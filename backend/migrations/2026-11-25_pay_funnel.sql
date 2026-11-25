-- 결제 단계별 기록 (이탈 위치 확인용). 아직 실제 DB에 적용 전 — 운영자 확인 후 적용
-- 개인 정보 없음: sid는 브라우저 탭마다 만드는 임의 번호, step은 단계 이름뿐
-- 쓰기는 결제 서버 함수(service role)만. 앱(anon/authenticated)은 읽기·쓰기 모두 불가
create table public.pay_funnel (
  id bigint generated always as identity primary key,
  sid text not null check (char_length(sid) <= 12),
  step text not null check (char_length(step) <= 20),
  item text check (char_length(item) <= 20),
  kind text check (char_length(kind) <= 20),
  login boolean not null default false,
  admin boolean not null default false,
  created_at timestamptz not null default now()
);
create index pay_funnel_time_idx on public.pay_funnel (created_at desc);
alter table public.pay_funnel enable row level security;
revoke all on public.pay_funnel from anon, authenticated;

-- 보는 법 (Supabase SQL Editor): 최근 30일, 운영자 테스트 제외, 단계별 도달한 탭 수
-- select step, count(distinct sid) from pay_funnel where not admin and created_at > now() - interval '30 days' group by step order by 2 desc;
