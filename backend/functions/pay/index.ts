// 더오를패스 결제: 주문 생성(order) · 결제 승인(confirm) · 요약노트 다운로드(download) · 비회원 주문 조회(lookup) · 회원 탈퇴(delete_account)
// + 토스 웹훅(PAYMENT_STATUS_CHANGED): 토스 관리자에서 환불하면 주문을 'canceled'로 바꿔 앱에서 PRO·요약노트가 닫히게 함
// 회원·비회원 모두 결제 가능. 비회원은 이메일 + 주문별 비밀 토큰으로 주문을 확인한다.
// 비밀값은 환경변수로만: TOSS_SECRET_KEY (토스페이먼츠 결제위젯 시크릿 키 gsk), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (자동 제공)
// + 출시 스위치(app_settings.launch_at): 켜지면 PRO는 보관함(사용 시작) · 앱 환불(start/refund) · 결제 전 동의(agree) 필요
// 이 파일은 Supabase에 올라가 있는 'pay' 함수의 원본이에요. 고치면 Supabase에 다시 배포해야 반영돼요.
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  // x-region: 앱이 결제 요청을 서울 서버로 고정할 때 보내는 표시. 허용 목록에 없으면 브라우저가 요청을 막아 결제창이 안 열려요
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-region',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
// 운영자 계정: 테스트 키일 때 시험 결제로 상품까지 받아 볼 수 있음 (그 외 사용자의 시험 결제는 아무것도 지급하지 않음)
const ADMINS = ['a06d0a06-48a7-4f07-ae65-f1264f4df8aa', 'a12aaa8a-c3d5-4d97-bcea-e57f7fc3a90a'];
// 서버 기준 가격표 (클라이언트가 보낸 금액은 믿지 않음)
// PRO는 시험 이용권: 결제하면 다음 공식 시험일까지 (이름에 '30일'이 들어간 예전 주문은 앱에서 30일권으로 계산)
const PRICES: Record<string, Record<string, { amount: number; name: string }>> = {
  tuunsa: {
    pro: { amount: 4900, name: '투자자산운용사 PRO 시험 이용권' },
    note: { amount: 9900, name: '투자자산운용사 요약노트 PDF' },
    // bundle(PRO + 요약노트 12,900원)은 2026-11-25 판매 중단. 예전 주문 확인·다운로드는 아래 코드가 계속 처리
  },
};
const NOTE_FILES: Record<string, string> = { tuunsa: 'tuunsa.pdf' };
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const pub = (o: any) => o && ({ id: o.id, cert: o.cert, item: o.item, order_name: o.order_name, amount: o.amount, status: o.status, approved_at: o.approved_at, canceled_at: o.canceled_at, downloaded_at: o.downloaded_at, created_at: o.created_at, test: o.test, boxed: !!o.boxed, started_at: o.started_at || null, refund_kind: o.refund_kind || null });
// 출시 스위치: launch_at 날짜(한국 시간 0시)부터 켜짐. 비어 있으면 꺼짐
const launchedAt = (v: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && Date.now() >= Date.parse(v + 'T00:00:00+09:00');
const DAY = 864e5, HOUR = 36e5;
const randTok = () => crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
// 키 종류만 알려줌 (값은 절대 내보내지 않음)
const keyKind = (s: string) => !s ? 'none' : s.startsWith('live_sk_') ? 'live_sk' : s.startsWith('live_gsk_') ? 'live_gsk' : s.startsWith('test_sk_') ? 'test_sk' : s.startsWith('test_gsk_') ? 'test_gsk' : s.startsWith('live_ck_') || s.startsWith('test_ck_') ? 'client_key' : /^\s/.test(s) ? 'leading_space' : 'other';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer /, '');
  let user: any = null;
  if (token && token.split('.').length === 3) { const { data: u } = await admin.auth.getUser(token); user = u?.user || null; }
  let body: any = {};
  try { body = await req.json(); } catch { return json({ error: 'body' }, 400); }
  const act = body.action;
  const sk = (Deno.env.get('TOSS_SECRET_KEY') || '').trim();
  const isTest = !sk || sk.startsWith('test_');
  const isAdmin = !!user && ADMINS.includes(user.id);
  const getSetting = async (k: string) => { const { data } = await admin.from('app_settings').select('value').eq('key', k).maybeSingle(); return (data && data.value) || ''; };
  const getLaunch = () => getSetting('launch_at');

  // 토스 웹훅: 결제 상태가 바뀜(환불 등). 보낸 내용은 믿지 않고, 시크릿 키로 토스에 직접 다시 물어본 결과로만 처리해요.
  // 토스 개발자센터 > 웹훅에 이 함수 주소를 등록하고 이벤트 'PAYMENT_STATUS_CHANGED'를 고르면 동작해요.
  if (body.eventType === 'PAYMENT_STATUS_CHANGED') {
    const pk = String(body.data?.paymentKey || '');
    if (!pk || !sk) return json({ ok: true });
    const r = await fetch('https://api.tosspayments.com/v1/payments/' + encodeURIComponent(pk), { headers: { Authorization: 'Basic ' + btoa(sk + ':') } });
    const t = await r.json().catch(() => ({}));
    if (!r.ok || !t.orderId) { console.log('webhook_skip', r.status, t.code || ''); return json({ ok: true }); }
    if (t.status === 'CANCELED' || t.status === 'PARTIAL_CANCELED') {
      const last = Array.isArray(t.cancels) && t.cancels.length ? t.cancels[t.cancels.length - 1].canceledAt : null;
      const { error } = await admin.from('orders').update({ status: 'canceled', canceled_at: last || new Date().toISOString() }).eq('id', t.orderId).eq('payment_key', pk);
      console.log('webhook_cancel', t.orderId, t.status, error ? error.message : 'ok');
    }
    return json({ ok: true });
  }

  // 결제 단계 기록(이탈 위치 확인용): 개인 정보 없이 단계 이름과 탭별 임의 번호만 저장
  if (act === 'track') {
    const STEPS = ['paywall', 'buy_click', 'start', 'choose', 'login_click', 'guest_submit', 'widget', 'pay_click', 'cancel', 'pay_error', 'return_fail', 'paid', 'declined', 'confirm_fail'];
    const step = String(body.step || ''), sid = String(body.sid || '');
    if (!STEPS.includes(step) || !/^[a-z0-9]{1,12}$/.test(sid)) return json({ ok: false }, 400);
    const short = (v: unknown) => (typeof v === 'string' && /^[a-z_]{1,20}$/.test(v) ? v : null);
    await admin.from('pay_funnel').insert({ sid, step, item: short(body.item), kind: short(body.kind), login: !!body.login, admin: !!body.admin });
    return json({ ok: true });
  }

  if (act === 'status') { const [launchAt, explainAt] = await Promise.all([getLaunch(), getSetting('explain_limit_at')]); return json({ live: !isTest, grant: !isTest || isAdmin, launchAt, explainAt, ...(isAdmin ? { kind: keyKind(Deno.env.get('TOSS_SECRET_KEY') || '') } : {}) }); }

  // 운영자 전용: 토스에 주문 상태 조회 (실패 원인 확인용)
  if (act === 'diag') {
    if (!isAdmin) return json({ error: 'login' }, 401);
    const r = await fetch('https://api.tosspayments.com/v1/payments/orders/' + encodeURIComponent(String(body.orderId || '')), { headers: { Authorization: 'Basic ' + btoa(sk + ':') } });
    const t = await r.json().catch(() => ({}));
    return json({ http: r.status, code: t.code || null, message: t.message || null, status: t.status || null, method: t.method || null, totalAmount: t.totalAmount || null, mId: t.mId || null, failure: t.failure || null });
  }

  if (act === 'order') {
    const p = PRICES[body.cert]?.[body.item];
    if (!p) return json({ error: 'item' }, 400);
    const id = 'op' + Date.now().toString(36) + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    // 출시 후: 결제 전 환불 규정 동의 필수, PRO는 보관함으로
    const L = launchedAt(await getLaunch());
    if (L && body.agree !== true) return json({ error: 'agree' }, 400);
    const extra = L ? { boxed: body.item === 'pro', agreed_at: new Date().toISOString() } : {};
    if (user) {
      const { error } = await admin.from('orders').insert({ id, user_id: user.id, cert: body.cert, item: body.item, order_name: p.name, amount: p.amount, test: isTest, ...extra });
      if (error) return json({ error: 'db', detail: error.message }, 500);
      return json({ orderId: id, amount: p.amount, orderName: p.name, customerKey: user.id, email: user.email || null });
    }
    // 비회원 주문
    const email = String(body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return json({ error: 'email' }, 400);
    const gt = randTok();
    const { error } = await admin.from('orders').insert({ id, user_id: null, guest_email: email, guest_token: gt, cert: body.cert, item: body.item, order_name: p.name, amount: p.amount, test: isTest, ...extra });
    if (error) return json({ error: 'db', detail: error.message }, 500);
    return json({ orderId: id, amount: p.amount, orderName: p.name, customerKey: null, email, guest: true, guestToken: gt });
  }

  // 주문 찾기: 회원은 본인 주문, 비회원은 주문번호 + 비밀 토큰
  const findOrder = async (orderId: string) => {
    if (!orderId) return null;
    const { data: o } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (!o) return null;
    if (o.user_id) return user && o.user_id === user.id ? o : null;
    return body.guestToken && o.guest_token && body.guestToken === o.guest_token ? o : null;
  };

  if (act === 'confirm') {
    const { paymentKey, orderId } = body; const amount = Number(body.amount);
    if (!paymentKey || !orderId || !amount) return json({ error: 'param' }, 400);
    const o = await findOrder(orderId);
    if (!o) { console.log('confirm_fail', orderId, 'order_not_found'); return json({ error: 'order' }, 404); }
    if (o.status === 'paid') return json({ ok: true, order: pub(o) });
    if (o.amount !== amount) { console.log('confirm_fail', orderId, 'amount', o.amount, amount); return json({ error: 'amount' }, 400); }
    if (!sk) return json({ error: 'not_configured' }, 503);
    if (o.test !== isTest) { console.log('confirm_fail', orderId, 'mode'); return json({ error: 'mode' }, 400); } // 테스트 주문을 라이브 키로(또는 반대로) 승인하지 않음
    const r = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + btoa(sk + ':'), 'Content-Type': 'application/json', 'Idempotency-Key': orderId },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    const t = await r.json().catch(() => ({}));
    if (!r.ok || t.status !== 'DONE') {
      console.log('confirm_fail', orderId, 'toss', r.status, t.code || '', t.message || '', t.status || '');
      await admin.from('orders').update({ status: 'failed', payment_key: paymentKey }).eq('id', orderId).eq('status', 'ready');
      return json({ error: 'toss', code: t.code || null, message: t.message || null }, 400);
    }
    const at = t.approvedAt || new Date().toISOString();
    // 보관함 PRO가 아니면 결제 즉시 사용 시작으로 기록
    const { data: done } = await admin.from('orders').update({ status: 'paid', payment_key: paymentKey, method: t.method || null, approved_at: at, ...(o.item === 'pro' && !o.boxed ? { started_at: at } : {}) }).eq('id', orderId).select('*').single();
    return json({ ok: true, order: pub(done), guest: !done.user_id });
  }

  // 비회원 주문 불러오기: 주문번호 + 결제 때 넣은 이메일
  if (act === 'lookup') {
    const orderId = String(body.orderId || '').trim(); const email = String(body.email || '').trim().toLowerCase();
    if (!orderId || !EMAIL_RE.test(email)) return json({ error: 'param' }, 400);
    const { data: o } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (!o || o.user_id || !o.guest_email || o.guest_email !== email || o.status !== 'paid') return json({ error: 'not_found' }, 404);
    return json({ ok: true, order: pub(o), guestToken: o.guest_token });
  }

  if (act === 'download') {
    const cert = body.cert; const file = NOTE_FILES[cert];
    if (!file) return json({ error: 'item' }, 400);
    let row: any = null;
    if (body.orderId && body.guestToken) {
      const o = await findOrder(body.orderId);
      if (o && o.cert === cert && o.status === 'paid' && ['note', 'bundle'].includes(o.item) && !o.test) row = o;
    } else if (user) {
      let q = admin.from('orders').select('id,downloaded_at').eq('user_id', user.id).eq('cert', cert).eq('status', 'paid').in('item', ['note', 'bundle']);
      if (!(isTest && isAdmin)) q = q.eq('test', false); // 시험 결제로는 받을 수 없음 (오픈 준비 중 운영자만 예외)
      const { data: rows } = await q.order('approved_at', { ascending: true }).limit(1);
      row = rows && rows[0];
    }
    if (!row) return json({ error: 'not_paid' }, 403);
    const { data: s, error } = await admin.storage.from('notes').createSignedUrl(file, 300, { download: '투자자산운용사_합격세트.pdf' });
    if (error || !s) return json({ error: 'file' }, 500);
    if (!row.downloaded_at) await admin.from('orders').update({ downloaded_at: new Date().toISOString() }).eq('id', row.id);
    return json({ url: s.signedUrl });
  }

  // 보관함 PRO 사용 시작: 이 시각부터 시험일까지 열려요(1시간 안 1회 환불만 가능)
  if (act === 'start') {
    const o = await findOrder(String(body.orderId || ''));
    if (!o || o.status !== 'paid' || o.item !== 'pro' || !o.boxed) return json({ error: 'order' }, 404);
    if (o.started_at) return json({ ok: true, order: pub(o) });
    await admin.from('orders').update({ started_at: new Date().toISOString() }).eq('id', o.id).is('started_at', null);
    const { data: cur } = await admin.from('orders').select('*').eq('id', o.id).maybeSingle();
    return json({ ok: true, order: pub(cur) });
  }

  // 앱에서 직접 환불: 조건에 맞을 때만 토스에 전액 취소 요청
  //  - 보관함 PRO: 사용 시작 전 + 결제 후 7일 이내 -> 'unused' / 사용 시작 후 1시간 이내 + 계정(이메일)당 1회 -> 'quick'
  //  - 요약노트: 내려받기 전 + 결제 후 7일 이내 -> 'unused'
  //  - 그 밖은 앱 환불 불가 -> 카카오 문의로 운영자가 처리
  if (act === 'refund') {
    const o = await findOrder(String(body.orderId || ''));
    if (!o || o.status !== 'paid' || !o.payment_key) return json({ error: 'order' }, 404);
    const nowT = Date.now(), paidT = Date.parse(o.approved_at || o.created_at);
    let kind: string | null = null;
    if (o.item === 'note' && !o.downloaded_at && nowT - paidT <= 7 * DAY) kind = 'unused';
    if (o.item === 'pro' && o.boxed) {
      if (!o.started_at && nowT - paidT <= 7 * DAY) kind = 'unused';
      else if (o.started_at && nowT - Date.parse(o.started_at) <= HOUR) {
        let q = admin.from('orders').select('id', { count: 'exact', head: true }).eq('refund_kind', 'quick');
        q = o.user_id ? q.eq('user_id', o.user_id) : q.eq('guest_email', o.guest_email);
        const { count } = await q;
        if (count) return json({ error: 'quick_used' }, 400);
        kind = 'quick';
      }
    }
    if (!kind) return json({ error: 'not_refundable' }, 400);
    if (!sk) return json({ error: 'not_configured' }, 503);
    if (o.test !== isTest) return json({ error: 'mode' }, 400);
    const r = await fetch('https://api.tosspayments.com/v1/payments/' + encodeURIComponent(o.payment_key) + '/cancel', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + btoa(sk + ':'), 'Content-Type': 'application/json', 'Idempotency-Key': 'refund-' + o.id },
      body: JSON.stringify({ cancelReason: kind === 'quick' ? '사용 시작 1시간 이내 환불(1회)' : '사용 전 환불' }),
    });
    const t = await r.json().catch(() => ({}));
    if (!r.ok || t.status !== 'CANCELED') { console.log('refund_fail', o.id, r.status, t.code || '', t.message || ''); return json({ error: 'toss', code: t.code || null, message: t.message || null }, 400); }
    const last = Array.isArray(t.cancels) && t.cancels.length ? t.cancels[t.cancels.length - 1].canceledAt : null;
    const { data: done } = await admin.from('orders').update({ status: 'canceled', canceled_at: last || new Date().toISOString(), refund_kind: kind }).eq('id', o.id).select('*').single();
    console.log('refund_ok', o.id, kind);
    return json({ ok: true, order: pub(done) });
  }

  if (act === 'delete_account') {
    if (!user) return json({ error: 'login' }, 401);
    if (body.confirm !== '탈퇴') return json({ error: 'confirm' }, 400);
    // 학습 기록·프로필·글은 함께 삭제(연쇄), 결제 기록은 전자상거래법에 따라 5년 보관(회원 연결만 끊음)
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return json({ error: 'delete', detail: error.message }, 500);
    return json({ ok: true });
  }

  if (!user) return json({ error: 'login' }, 401);
  return json({ error: 'action' }, 400);
});
