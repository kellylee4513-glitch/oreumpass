-- 더오를패스 Supabase 스키마 (회원 · 기록 동기화 · 커뮤니티)
-- 2026-10-30 이후 public 테이블은 Data API 노출에 명시적 GRANT 가 필요해서, 테이블마다 GRANT 를 직접 적어요.
-- 운영자 숨김·공지 고정은 Supabase 대시보드(Table Editor)에서 hidden / pinned 값을 바꿔서 해요.

create schema if not exists private;

-- ===== 회원 프로필 =====
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 12),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
grant select on public.profiles to anon, authenticated;
grant update (nickname) on public.profiles to authenticated;
create policy "profiles_read" on public.profiles for select to anon, authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- 가입하면 프로필 자동 생성 (닉네임: 소셜 이름 앞 8자, 없으면 수험생+숫자)
create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare nm text;
begin
  nm := left(coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), nullif(trim(new.raw_user_meta_data->>'full_name'), '')), 8);
  if nm is null or char_length(nm) < 2 then nm := '수험생' || (floor(random() * 9000) + 1000)::int; end if;
  insert into public.profiles (id, nickname) values (new.id, nm);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- ===== 학습 기록 동기화 (사용자당 한 줄) =====
create table public.progress (
  user_id uuid primary key references auth.users on delete cascade default auth.uid(),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  check (pg_column_size(data) < 900000)
);
alter table public.progress enable row level security;
grant select, insert, update on public.progress to authenticated;
create policy "progress_select_own" on public.progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress_insert_own" on public.progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progress_update_own" on public.progress for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ===== 커뮤니티: 글 =====
create table public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  board text not null check (board in ('free', 'pass', 'exam', 'qna')),
  cert text not null default 'common' check (char_length(cert) <= 20),
  title text not null check (char_length(title) between 2 and 80),
  body text not null check (char_length(body) between 2 and 5000),
  views int not null default 0,
  likes int not null default 0,
  comments int not null default 0,
  reports int not null default 0,
  pinned boolean not null default false,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_list_idx on public.posts (pinned desc, created_at desc) where not hidden;
create index posts_board_idx on public.posts (board, created_at desc) where not hidden;
create index posts_user_idx on public.posts (user_id);
alter table public.posts enable row level security;
grant select on public.posts to anon, authenticated;
grant insert (board, cert, title, body) on public.posts to authenticated;
grant update (board, cert, title, body) on public.posts to authenticated;
grant delete on public.posts to authenticated;
create policy "posts_read" on public.posts for select to anon, authenticated using (not hidden or (select auth.uid()) = user_id);
create policy "posts_insert_own" on public.posts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "posts_update_own" on public.posts for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "posts_delete_own" on public.posts for delete to authenticated using ((select auth.uid()) = user_id);

-- ===== 커뮤니티: 댓글 =====
create table public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  reports int not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, created_at);
create index comments_user_idx on public.comments (user_id);
alter table public.comments enable row level security;
grant select on public.comments to anon, authenticated;
grant insert (post_id, body) on public.comments to authenticated;
grant delete on public.comments to authenticated;
create policy "comments_read" on public.comments for select to anon, authenticated using (not hidden);
create policy "comments_insert_own" on public.comments for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "comments_delete_own" on public.comments for delete to authenticated using ((select auth.uid()) = user_id);

-- ===== 좋아요 =====
create table public.likes (
  post_id bigint not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index likes_user_idx on public.likes (user_id);
alter table public.likes enable row level security;
grant select on public.likes to authenticated;
grant insert (post_id) on public.likes to authenticated;
grant delete on public.likes to authenticated;
create policy "likes_read_own" on public.likes for select to authenticated using ((select auth.uid()) = user_id);
create policy "likes_insert_own" on public.likes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "likes_delete_own" on public.likes for delete to authenticated using ((select auth.uid()) = user_id);

-- ===== 신고 (5건 이상이면 자동 숨김) =====
create table public.reports (
  id bigint generated always as identity primary key,
  target text not null check (target in ('post', 'comment')),
  target_id bigint not null,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reason text not null default '' check (char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  unique (target, target_id, user_id)
);
create index reports_user_idx on public.reports (user_id);
alter table public.reports enable row level security;
grant insert (target, target_id, reason) on public.reports to authenticated;
create policy "reports_insert_own" on public.reports for insert to authenticated with check ((select auth.uid()) = user_id);

-- ===== 개수 자동 계산 · 도배 방지 (트리거, private 스키마) =====
create or replace function private.bump_counts() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'comments' then
    update public.posts set comments = comments + (case when tg_op = 'INSERT' then 1 else -1 end)
      where id = coalesce(new.post_id, old.post_id);
  elsif tg_table_name = 'likes' then
    update public.posts set likes = likes + (case when tg_op = 'INSERT' then 1 else -1 end)
      where id = coalesce(new.post_id, old.post_id);
  elsif tg_table_name = 'reports' then
    if new.target = 'post' then
      update public.posts set reports = reports + 1, hidden = (reports + 1 >= 5) or hidden where id = new.target_id;
    else
      update public.comments set reports = reports + 1, hidden = (reports + 1 >= 5) or hidden where id = new.target_id;
    end if;
  end if;
  return coalesce(new, old);
end $$;
create trigger comments_count after insert or delete on public.comments for each row execute function private.bump_counts();
create trigger likes_count after insert or delete on public.likes for each row execute function private.bump_counts();
create trigger reports_count after insert on public.reports for each row execute function private.bump_counts();

create or replace function private.rate_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'posts' and exists (select 1 from public.posts where user_id = new.user_id and created_at > now() - interval '60 seconds') then
    raise exception '글은 1분에 한 번만 쓸 수 있어요';
  end if;
  if tg_table_name = 'comments' and exists (select 1 from public.comments where user_id = new.user_id and created_at > now() - interval '10 seconds') then
    raise exception '댓글은 10초에 한 번만 쓸 수 있어요';
  end if;
  return new;
end $$;
create trigger posts_rate before insert on public.posts for each row execute function private.rate_limit();
create trigger comments_rate before insert on public.comments for each row execute function private.rate_limit();

create or replace function private.touch_updated() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
create trigger posts_touch before update on public.posts for each row execute function private.touch_updated();

-- ===== 조회수 +1 (누구나 호출 가능, 조회수만 올림) =====
create or replace function public.view_post(pid bigint) returns void
language sql security definer set search_path = '' as $$
  update public.posts set views = views + 1 where id = pid and not hidden;
$$;
revoke execute on function public.view_post(bigint) from public;
grant execute on function public.view_post(bigint) to anon, authenticated;

revoke all on schema private from public, anon, authenticated;

-- ===== 2차: 새 프로젝트 기본 권한 걷어내고 필요한 권한만 다시 부여 =====
revoke all on public.profiles, public.progress, public.posts, public.comments, public.likes, public.reports from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated, public;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
-- (이후 위 GRANT 문을 다시 적용)
