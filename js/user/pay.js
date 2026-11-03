/* [user/pay.js] 결제: 자격증별 PRO 30일권 (+ 요약노트 묶음) */
/* 결제 모드: 라이브 키(live_)면 모두 실결제. 테스트 키(test_)면 운영자 계정만 테스트 결제, 나머지는 오픈 준비 기간 무료 30일 */
const PAY_KEY = (window.OP_CFG || {}).tossClientKey || '';
const PAY_REAL = /^live_/.test(PAY_KEY);
const OP_ADMINS = ['a06d0a06-48a7-4f07-ae65-f1264f4df8aa', 'a12aaa8a-c3d5-4d97-bcea-e57f7fc3a90a'];
const payAdmin = () => !!(typeof AU !== 'undefined' && AU.user && OP_ADMINS.includes(AU.user.id));
const payOn = () => !!PAY_KEY;                 /* 결제창은 누구나 열 수 있음 (토스 심사 때 결제 흐름을 확인함) */
const payPrep = () => !PAY_REAL && !payAdmin(); /* 오픈 준비 기간: 시험 결제창이라 청구·지급 없음 */
const PREP_NOTE = '결제 오픈 준비 중이에요. 지금 결제창은 시험용이라 실제로 청구되지 않고, 상품도 지급되지 않아요.';
const PRO_PLAN = { price: 4900, days: 30 };
const BUNDLE = { price: 9900 };
let payPick = 'pro';
const proLeft = id => { const e = (G.passExp || {})[id]; return e ? Math.ceil((e - Date.now()) / 864e5) : null; };
function paywall(kind) { afterPay = kind; payPick = 'pro'; if (isPro()) { closeSheet(); return; } drawPay(); }
function drawPay() {
  const note = typeof SHOPS === 'function' ? SHOPS().find(p => p.cert === C.id && !p.soon) : null;
  const opt = (k, t, d, pr, s) => `<button class="plan ${payPick === k ? 'on' : ''}" onclick="payPick='${k}';drawPay()"><span class="rd"></span><div class="grow"><div class="t">${t}</div><div class="d">${d}</div></div><div class="pr">${s ? `<s>${won(s)}</s>` : ''}${won(pr)}</div></button>`;
  const sel = payPick === 'bundle' && note ? BUNDLE.price : PRO_PLAN.price;
  openSheet(`<h3>${esc(C.short)} PRO로<br>합격선까지 빠르게</h3><div class="p">문제·해설·오답노트는 무료, PRO는 실전 감각과 약점 관리까지</div>
    <div class="feat"><span class="fi">${IC.exam()}</span><span>실전 모의고사<small>시험과 같은 과목 비율·시간으로</small></span></div>
    <div class="feat"><span class="fi">${IC.target()}</span><span>약점 집중 · 맞춤 학습<small>정답률 낮은 단원부터 자동으로</small></span></div>
    <div class="feat"><span class="fi">${IC.ox()}</span><span>OX 선지 퀴즈 · 잊을 때쯤 복습<small>선지를 쪼개 개념을 확실하게, 1·3·7·15·30일 뒤 다시 출제</small></span></div>
    <div style="height:10px"></div>
    ${opt('pro', `${esc(C.short)} PRO 30일 <span class="pp-off">오픈 기념가</span>`, '결제한 날부터 30일 · 자동 결제 없음', PRO_PLAN.price, 0)}
    ${note ? opt('bundle', 'PRO 30일 + 요약노트 PDF', `따로 사면 ${won(PRO_PLAN.price + 6500)}`, BUNDLE.price, PRO_PLAN.price + 6500) : ''}
    <button class="btn" style="width:100%;margin-top:6px" onclick="buy()">${payOn() ? won(sel) + ' 결제하기' : '오픈 기념 무료로 30일 열기'}</button>
    ${payOn() && payPrep() ? `<button class="btn ghost" style="width:100%;margin-top:8px" onclick="freeOpen()">오픈 전 무료 체험 30일 열기</button>` : ''}
    <div class="note">${payOn() ? (payPrep() ? PREP_NOTE + '<br>' : '') + '결제 후 7일 이내 미사용 시 전액 환불 · <a onclick="legalPage(\'refund\')" style="text-decoration:underline">환불 규정</a>' : '결제 오픈 준비 중이에요. 지금은 무료로 30일 동안 열어 드려요.'}</div>`);
}
function buy() {
  if (payOn()) { payStart(payPick === 'bundle' ? 'bundle' : 'pro'); return; }
  freeOpen();
}
function freeOpen() {
  G.passExp = G.passExp || {}; if (!G.passCerts.includes(C.id)) G.passCerts.push(C.id);
  G.passExp[C.id] = Date.now() + PRO_PLAN.days * 864e5; save(); closeSheet(); toast(C.short + ' PRO가 30일 동안 열렸어요 🎉');
  setTimeout(() => { if (afterPay === 'ox') startOx(0); else if (afterPay === 'custom') startCustom(); else if (afterPay === 'weak') startWeak(); else if (afterPay === 'mock') startMock(true); else go(tab); }, 300);
}

/* ===== 토스페이먼츠 결제 (실결제) ===== */
const PAY = { busy: false, owned: {}, orders: [] };
function loadTossSdk() {
  if (window.TossPayments) return Promise.resolve();
  return new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://js.tosspayments.com/v2/standard'; s.onload = ok; s.onerror = () => no(new Error('sdk')); document.head.appendChild(s); });
}
async function payFn(body) {
  await authInit(); if (!AU.sb) throw new Error('auth');
  const { data, error } = await AU.sb.functions.invoke('pay', { body });
  if (error) { let d = null; try { d = await error.context.json(); } catch (e) {} const er = new Error((d && d.error) || 'fn'); er.info = d; throw er; }
  return data;
}
async function payStart(item, cert) {
  cert = cert || C.id;
  if (PAY.busy) return;
  if (!AU.user) { closeSheet(); try { sessionStorage.setItem('op_buy', JSON.stringify({ item, cert })); } catch (e) {} loginSheet('결제하려면 먼저\n로그인해 주세요'); return; }
  PAY.busy = true; toast('결제창을 여는 중이에요');
  try {
    const o = await payFn({ action: 'order', cert, item });
    await loadTossSdk();
    const tp = window.TossPayments((window.OP_CFG || {}).tossClientKey);
    const base = (window.OP_CFG || {}).webUrl || (location.origin + location.pathname);
    await tp.payment({ customerKey: o.customerKey }).requestPayment({
      method: 'CARD', amount: { currency: 'KRW', value: o.amount }, orderId: o.orderId, orderName: o.orderName,
      successUrl: base + '?pay=ok&c=' + encodeURIComponent(cert), failUrl: base + '?pay=fail&c=' + encodeURIComponent(cert),
      customerEmail: o.email || undefined, card: { useEscrow: false, flowMode: 'DEFAULT', useCardPoint: false, useAppCardOnly: false }
    });
  } catch (e) {
    if (e && (e.code === 'USER_CANCEL' || /취소/.test(e.message || ''))) toast('결제를 취소했어요');
    else toast('결제창을 열지 못했어요. 잠시 뒤 다시 해 주세요');
  } finally { PAY.busy = false; }
}
/* 결제 후 돌아왔을 때: 서버에서 승인 → 이용권 반영 */
async function payReturn() {
  const q = new URLSearchParams(location.search); const st = q.get('pay'); if (!st) return;
  const clean = () => { try { history.replaceState(null, '', location.pathname); } catch (e) {} };
  if (st === 'fail') { clean(); toast(q.get('code') === 'PAY_PROCESS_CANCELED' ? '결제를 취소했어요' : '결제가 완료되지 않았어요'); return; }
  const paymentKey = q.get('paymentKey'), orderId = q.get('orderId'), amount = q.get('amount'); clean();
  if (!paymentKey || !orderId) return;
  openSheet('<h3>결제를 확인하고 있어요</h3><div class="p">잠시만 기다려 주세요. 창을 닫지 마세요.</div>');
  try {
    await authInit(); for (let i = 0; i < 20 && !AU.user; i++) await new Promise(r => setTimeout(r, 300));
    const r = await payFn({ action: 'confirm', paymentKey, orderId, amount: Number(amount) });
    await syncPurchases(); closeSheet();
    if (r && r.order && r.order.test && !payAdmin()) { openSheet(`<h3>시험 결제가 끝났어요</h3><div class="p">${PREP_NOTE}<br><br>정식 오픈하면 같은 방법으로 바로 구매할 수 있어요.</div><button class="btn" style="width:100%" onclick="closeSheet();go('home')">확인</button>`); return; }
    const it = r && r.order && r.order.item;
    toast(it === 'note' ? '결제 완료! 요약노트를 내려받을 수 있어요' : '결제 완료! PRO가 30일 동안 열렸어요 🎉');
    if (it === 'note' || it === 'bundle') { if (typeof shopDetail === 'function') setTimeout(() => shopDetail(r.order.cert), 300); } else go('home');
  } catch (e) {
    closeSheet(); openSheet(`<h3>결제를 확인하지 못했어요</h3><div class="p">돈이 빠져나갔는데 이용권이 안 열렸다면 주문번호와 함께 문의해 주세요. 확인 후 바로 처리해 드려요.<br><br>주문번호 ${esc(orderId)}</div><button class="btn" style="width:100%" onclick="closeSheet();kakaoAsk()">카카오톡으로 문의하기</button>`);
  }
}
/* 서버의 결제 내역 → 이용권·요약노트 보유 상태 */
async function syncPurchases() {
  if (!AU.sb || !AU.user) return;
  const { data } = await AU.sb.from('orders').select('id,cert,item,order_name,amount,status,approved_at,canceled_at,downloaded_at,created_at,test').order('created_at', { ascending: false }).limit(100);
  PAY.orders = (data || []).filter(o => !o.test || (!PAY_REAL && payAdmin())); PAY.owned = {}; /* 시험 결제는 운영자 확인용(오픈 준비 중)만 반영 */
  const paid = PAY.orders.filter(o => o.status === 'paid').sort((a, b) => new Date(a.approved_at) - new Date(b.approved_at));
  const exp = {};
  paid.forEach(o => {
    if (o.item === 'pro' || o.item === 'bundle') { const t = new Date(o.approved_at).getTime(); exp[o.cert] = Math.max(exp[o.cert] || 0, t) + PRO_PLAN.days * 864e5; }
    if (o.item === 'note' || o.item === 'bundle') PAY.owned[o.cert] = true;
  });
  G.passExp = G.passExp || {};
  Object.keys(exp).forEach(c => { G.passExp[c] = Math.max(G.passExp[c] || 0, exp[c]); if (!G.passCerts.includes(c)) G.passCerts.push(c); });
  save();
}
const noteOwned = cert => !!PAY.owned[cert];
async function noteDownload(cert) {
  try { toast('파일을 준비하고 있어요'); const r = await payFn({ action: 'download', cert }); if (r && r.url) location.href = r.url; else throw 0; }
  catch (e) { toast(e && e.message === 'not_paid' ? '구매 내역을 찾지 못했어요' : '파일을 준비하지 못했어요. 잠시 뒤 다시 해 주세요'); }
}
/* 로그인하고 돌아왔을 때 결제 이어 하기 */
function payResume() { let b = null; try { b = JSON.parse(sessionStorage.getItem('op_buy') || 'null'); sessionStorage.removeItem('op_buy'); } catch (e) {} if (b && AU.user && payOn()) setTimeout(() => payStart(b.item, b.cert), 500); }
