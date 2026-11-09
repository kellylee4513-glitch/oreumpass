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
const BUNDLE = { price: 12900 };
const NOTE_PRICE = 9900;
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
    ${note ? opt('bundle', 'PRO 30일 + 요약노트 PDF', `따로 사면 ${won(PRO_PLAN.price + NOTE_PRICE)}`, BUNDLE.price, PRO_PLAN.price + NOTE_PRICE) : ''}
    <button class="btn" style="width:100%;margin-top:6px" onclick="buy()">${payOn() ? won(sel) + ' 결제하기' : 'PRO 오픈 준비 중'}</button>
    <div class="note">${payOn() ? (payPrep() ? PREP_NOTE + '<br>' : '') + '결제 후 7일 이내 미사용 시 전액 환불 · <a onclick="legalPage(\'refund\')" style="text-decoration:underline">환불 규정</a>' : 'PRO는 오픈 준비 중이에요. 문제 풀이·해설·오답노트는 지금도 무료예요.'}</div>`);
}
function buy() {
  if (payOn()) { payStart(payPick === 'bundle' ? 'bundle' : 'pro'); return; }
  toast('PRO는 오픈 준비 중이에요. 열리면 바로 알려드릴게요');
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
/* ===== 비회원 결제: 로그인 없이 이메일만으로 결제, 이 기기에 저장 + 주문번호·이메일로 다른 기기에서 불러오기 ===== */
const GKEY = 'op_guest_orders', GPEND = 'op_guest_pending';
const gOrders = () => { try { return JSON.parse(localStorage.getItem(GKEY) || '[]'); } catch (e) { return []; } };
const gSave = a => { try { localStorage.setItem(GKEY, JSON.stringify(a)); } catch (e) {} };
function gAdd(o, token, email) { const a = gOrders().filter(x => x.id !== o.id); a.push(Object.assign({}, o, { token, email, guest: true })); gSave(a); }
const gFind = (cert, items) => gOrders().find(o => o.cert === cert && o.status === 'paid' && !o.test && items.includes(o.item));
const EMAIL_OK = e => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(e);
function loginBuy(item, cert) { closeSheet(); try { sessionStorage.setItem('op_buy', JSON.stringify({ item, cert })); } catch (e) {} loginSheet('로그인하고 결제하면\n어느 기기에서든 이용할 수 있어요'); }
function guestSheet(item, cert) {
  const p = item === 'note' ? NOTE_PRICE : item === 'bundle' ? BUNDLE.price : PRO_PLAN.price;
  openSheet(`<h3>결제 방법을 골라 주세요</h3><div class="p">회원가입 없이 비회원으로도 바로 결제할 수 있어요.</div>
    <div class="card" style="padding:16px;margin:4px 0 12px">
      <div style="font-weight:700;margin-bottom:8px">비회원 결제</div>
      <input id="gEmail" type="email" inputmode="email" autocomplete="email" placeholder="이메일 (주문 확인·환불 안내용)" style="width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid var(--line);border-radius:12px;font-size:15px;margin-bottom:10px">
      <label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;color:var(--sub);line-height:1.5"><input id="gAgree" type="checkbox" style="margin-top:3px">
        <span>주문 확인과 환불 안내를 위해 이메일을 수집하는 데 동의하고, 상품·가격·<a role="button" onclick="legalPage('refund')" style="text-decoration:underline">환불 규정</a>을 확인했어요.</span></label>
      <button class="btn" style="width:100%;margin-top:12px" onclick="guestPay('${item}','${cert}')">비회원으로 ${won(p)} 결제하기</button>
      <div class="note" style="margin-top:8px">구매한 상품은 이 기기에 바로 열려요. 다른 기기에서는 <b>주문번호와 이메일</b>로 불러올 수 있어요.</div>
    </div>
    ${authOn() ? `<button class="btn ghost" style="width:100%" onclick="loginBuy('${item}','${cert}')">카카오·구글로 로그인하고 결제하기</button>` : ''}
    <div class="note" style="text-align:center;margin-top:10px"><a role="button" onclick="lookupSheet()" style="text-decoration:underline">이미 비회원으로 결제했나요? 주문 불러오기</a></div>`);
}
async function guestPay(item, cert) {
  const email = (document.getElementById('gEmail') || {}).value ? document.getElementById('gEmail').value.trim().toLowerCase() : '';
  if (!EMAIL_OK(email)) { toast('이메일을 정확히 입력해 주세요'); return; }
  if (!(document.getElementById('gAgree') || {}).checked) { toast('동의에 체크해 주세요'); return; }
  if (PAY.busy) return; PAY.busy = true; toast('결제창을 여는 중이에요');
  try {
    const o = await payFn({ action: 'order', cert, item, email });
    try { localStorage.setItem(GPEND, JSON.stringify({ orderId: o.orderId, token: o.guestToken, email })); } catch (e) {}
    await loadTossSdk();
    const tp = window.TossPayments((window.OP_CFG || {}).tossClientKey);
    const base = (window.OP_CFG || {}).webUrl || (location.origin + location.pathname);
    await tp.payment({ customerKey: window.TossPayments.ANONYMOUS }).requestPayment({
      method: 'CARD', amount: { currency: 'KRW', value: o.amount }, orderId: o.orderId, orderName: o.orderName,
      successUrl: base + '?pay=ok&g=1&c=' + encodeURIComponent(cert), failUrl: base + '?pay=fail&c=' + encodeURIComponent(cert),
      customerEmail: email, card: { useEscrow: false, flowMode: 'DEFAULT', useCardPoint: false, useAppCardOnly: false }
    });
  } catch (e) {
    if (e && (e.code === 'USER_CANCEL' || /취소/.test(e.message || ''))) toast('결제를 취소했어요');
    else toast(e && e.message === 'email' ? '이메일을 다시 확인해 주세요' : '결제창을 열지 못했어요. 잠시 뒤 다시 해 주세요');
  } finally { PAY.busy = false; }
}
function lookupSheet() {
  openSheet(`<h3>비회원 주문 불러오기</h3><div class="p">결제 완료 화면이나 결제 메일의 주문번호와, 결제할 때 넣은 이메일을 입력해 주세요.</div>
    <input id="lkId" placeholder="주문번호 (op로 시작)" autocapitalize="off" style="width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid var(--line);border-radius:12px;font-size:15px;margin-bottom:10px">
    <input id="lkEmail" type="email" inputmode="email" placeholder="이메일" style="width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid var(--line);border-radius:12px;font-size:15px">
    <button class="btn" style="width:100%;margin-top:12px" onclick="lookupGo()">불러오기</button>`);
}
async function lookupGo() {
  const id = (document.getElementById('lkId').value || '').trim(), email = (document.getElementById('lkEmail').value || '').trim().toLowerCase();
  if (!id || !EMAIL_OK(email)) { toast('주문번호와 이메일을 확인해 주세요'); return; }
  try {
    const r = await payFn({ action: 'lookup', orderId: id, email });
    gAdd(r.order, r.guestToken, email); await syncPurchases(); closeSheet();
    toast(r.order.test ? '시험 결제라 상품은 열리지 않아요' : '주문을 불러왔어요 🎉');
    if (!r.order.test && (r.order.item === 'note' || r.order.item === 'bundle') && typeof shopDetail === 'function') setTimeout(() => shopDetail(r.order.cert), 300);
  } catch (e) { toast('주문을 찾지 못했어요. 주문번호와 이메일을 확인해 주세요'); }
}
async function payStart(item, cert) {
  cert = cert || C.id;
  if (PAY.busy) return;
  if (!AU.user) { guestSheet(item, cert); return; }
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
  let pend = null; try { pend = JSON.parse(localStorage.getItem(GPEND) || 'null'); } catch (e) {}
  const guest = !!(pend && pend.orderId === orderId);
  try {
    await authInit(); if (!guest) for (let i = 0; i < 20 && !AU.user; i++) await new Promise(r => setTimeout(r, 300));
    const r = await payFn(guest ? { action: 'confirm', paymentKey, orderId, amount: Number(amount), guestToken: pend.token } : { action: 'confirm', paymentKey, orderId, amount: Number(amount) });
    if (guest) { gAdd(r.order, pend.token, pend.email); try { localStorage.removeItem(GPEND); } catch (e) {} }
    await syncPurchases(); closeSheet();
    if (r && r.order && r.order.test && !payAdmin()) { openSheet(`<h3>시험 결제가 끝났어요</h3><div class="p">${PREP_NOTE}<br><br>정식 오픈하면 같은 방법으로 바로 구매할 수 있어요.</div><button class="btn" style="width:100%" onclick="closeSheet();go('home')">확인</button>`); return; }
    const it = r && r.order && r.order.item;
    if (guest) { openSheet(`<h3>결제가 끝났어요 🎉</h3><div class="p">${it === 'note' ? '요약노트를 바로 내려받을 수 있어요.' : 'PRO가 30일 동안 열렸어요.'}<br><br>다른 기기에서 불러올 때 필요하니 아래 주문번호를 꼭 저장해 두세요.</div><div class="card" style="padding:14px;font-size:15px"><b>주문번호</b> ${esc(orderId)}<br><b>이메일</b> ${esc(pend.email)}</div><button class="btn" style="width:100%" onclick="closeSheet();${it === 'note' || it === 'bundle' ? `shopDetail('${r.order.cert}')` : `go('home')`}">확인</button>`); return; }
    toast(it === 'note' ? '결제 완료! 요약노트를 내려받을 수 있어요' : '결제 완료! PRO가 30일 동안 열렸어요 🎉');
    if (it === 'note' || it === 'bundle') { if (typeof shopDetail === 'function') setTimeout(() => shopDetail(r.order.cert), 300); } else go('home');
  } catch (e) {
    closeSheet(); openSheet(`<h3>결제를 확인하지 못했어요</h3><div class="p">돈이 빠져나갔는데 이용권이 안 열렸다면 주문번호와 함께 문의해 주세요. 확인 후 바로 처리해 드려요.<br><br>주문번호 ${esc(orderId)}</div><button class="btn" style="width:100%" onclick="closeSheet();kakaoAsk()">카카오톡으로 문의하기</button>`);
  }
}
/* 서버의 결제 내역 → 이용권·요약노트 보유 상태 */
async function syncPurchases() {
  let server = [];
  if (AU.sb && AU.user) {
    const { data } = await AU.sb.from('orders').select('id,cert,item,order_name,amount,status,approved_at,canceled_at,downloaded_at,created_at,test').order('created_at', { ascending: false }).limit(100);
    server = (data || []).filter(o => !o.test || (!PAY_REAL && payAdmin())); /* 시험 결제는 운영자 확인용(오픈 준비 중)만 반영 */
  }
  const guest = gOrders().filter(o => !o.test); /* 비회원 시험 결제는 아무것도 지급하지 않음 */
  PAY.orders = server.concat(guest.filter(g => !server.some(o => o.id === g.id))).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); PAY.owned = {};
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
  const g = gFind(cert, ['note', 'bundle']);
  try { toast('파일을 준비하고 있어요'); const r = await payFn(g && !(AU.user && PAY.orders.some(o => !o.guest && o.status === 'paid' && o.cert === cert && (o.item === 'note' || o.item === 'bundle'))) ? { action: 'download', cert, orderId: g.id, guestToken: g.token } : { action: 'download', cert }); if (r && r.url) location.href = r.url; else throw 0; }
  catch (e) { toast(e && e.message === 'not_paid' ? '구매 내역을 찾지 못했어요' : '파일을 준비하지 못했어요. 잠시 뒤 다시 해 주세요'); }
}
/* 로그인하고 돌아왔을 때 결제 이어 하기 */
function payResume() { let b = null; try { b = JSON.parse(sessionStorage.getItem('op_buy') || 'null'); sessionStorage.removeItem('op_buy'); } catch (e) {} if (b && AU.user && payOn()) setTimeout(() => payStart(b.item, b.cert), 500); }
