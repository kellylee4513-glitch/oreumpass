-- 출시 스위치 · PRO 보관함(사용 시작) · 앱 환불 (실제 DB에 적용 전 — 운영자 확인 후 적용)
-- 적용해도 launch_at 값이 비어 있으면 사용자에게 아무 변화가 없어요.

-- 1) 출시 스위치: launch_at에 '2027-01-19' 같은 날짜(한국 시간 0시부터)를 넣으면 켜져요. 비우면 꺼져요.
create table public.app_settings (
  key text primary key,
  value text not null default ''
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;  -- 결제 서버(service role)만 읽고, 앱은 서버의 status로 받아요
insert into public.app_settings (key, value) values ('launch_at', ''), ('explain_limit_at', '') on conflict (key) do nothing;
-- explain_limit_at: 상세 해설 하루 20개 제한 시작일 (launch_at과 따로 켜고 꺼요)

-- 2) 주문에 보관함·사용 시작·동의·환불 종류 기록
alter table public.orders
  add column boxed boolean not null default false,          -- true: 결제 후 보관함에 들어감(사용 시작을 눌러야 열림). 스위치 켠 뒤의 PRO 주문
  add column started_at timestamptz,                         -- 사용 시작 시각(이용 개시 증거)
  add column agreed_at timestamptz,                          -- 결제 전 환불 규정 동의 시각
  add column refund_kind text check (refund_kind in ('unused', 'quick', 'admin'));  -- 앱 환불 종류: 미사용 / 사용 1시간 내 1회
create index orders_refund_kind_idx on public.orders (refund_kind) where refund_kind is not null;

-- 보는 법: 스위치 켜기 → update public.app_settings set value = '2027-01-19' where key = 'launch_at';
--          스위치 끄기 → update public.app_settings set value = '' where key = 'launch_at';
