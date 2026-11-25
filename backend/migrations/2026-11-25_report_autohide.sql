-- 신고 자동 숨김 보완 (아직 실제 DB에 적용 전 — 운영자 확인 후 적용)
-- 1) 고정(공지) 글은 신고가 쌓여도 자동으로 숨기지 않아요.
-- 2) 자동 숨김 기준을 신고 5건 → 10건으로 올려요. (계정 몇 개로 남의 합격 후기를 지우기 어렵게)
--    신고가 3건 이상 쌓인 글은 운영자가 Table Editor에서 reports 순으로 정렬해 확인해요.
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
      update public.posts set reports = reports + 1, hidden = hidden or (not pinned and reports + 1 >= 10) where id = new.target_id;
    else
      update public.comments set reports = reports + 1, hidden = hidden or (reports + 1 >= 10) where id = new.target_id;
    end if;
  end if;
  return coalesce(new, old);
end $$;
