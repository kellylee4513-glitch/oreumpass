/* [user/pay.js] 결제: 자격증별 PRO 시험 이용권 — 결제하면 다음 공식 시험일까지 (요약노트는 요약노트 탭에서 따로. 예전 묶음(bundle) 주문은 계속 인정) */
/* 결제 모드: 라이브 키(live_)면 모두 실결제. 테스트 키(test_)면 운영자 계정만 테스트 결제, 나머지는 오픈 준비 기간 무료 이용 */
const PAY_KEY = (window.OP_CFG || {}).tossClientKey || '';
const PAY_REAL = /^live_/.test(PAY_KEY);
const OP_ADMINS = ['a06d0a06-48a7-4f07-ae65-f1264f4df8aa', 'a12aaa8a-c3d5-4d97-bcea-e57f7fc3a90a'];
const payAdmin = () => !!(typeof AU !== 'undefined' && AU.user && OP_ADMINS.includes(AU.user.id));
const payOn = () => !!PAY_KEY;                 /* 결제창은 누구나 열 수 있음 (토스 심사 때 결제 흐름을 확인함) */
const payPrep = () => !PAY_REAL && !payAdmin(); /* 오픈 준비 기간: 시험 결제창이라 청구·지급 없음 */
const PREP_NOTE = '결제 오픈 준비 중이에요. 지금 결제창은 시험용이라 실제로 청구되지 않고, 상품도 지급되지 않아요.';
const PRO_PLAN = { price: 4900, days: 30 }; /* days: 예전 30일권 주문, 그리고 등록된 시험일이 없을 때 쓰는 기간 */
/* 자격증별 공식 시험일(한국 시간). 협회가 새 일정을 발표하면 여기에 날짜를 추가해요. */
const EXAM_DATES = { tuunsa: ['2027-01-17'] };
/* 아직 협회가 공고하지 않은 예상 시험일. 공식 일정이 나오면 EXAM_DATES를 고치고 여기서 빼요. */
const EXAM_TENTATIVE = { tuunsa: ['2027-01-17'] };
const EXAM_GAP = 7; /* 시험이 7일 안 남았을 때 결제하면 그다음 시험일까지 */
const PRO_EXAM_FROM = new Date('2026-11-24T00:00:00+09:00').getTime(); /* 이 시각 전 주문은 예전 30일권 */
const examEnds = c => (EXAM_DATES[c] || []).map(d => new Date(d + 'T23:59:59+09:00').getTime()).sort((a, b) => a - b);
/* from 시점에 결제(또는 이어서 결제)하면 PRO가 끝나는 시각 */
function proEnd(cert, from) { const e = examEnds(cert).find(t => t - from >= EXAM_GAP * 864e5); return e || from + PRO_PLAN.days * 864e5; }
function proEndLabel(cert, from) { const base = Math.max((G.passExp || {})[cert] || 0, from || Date.now()); const e = examEnds(cert).find(t => t - base >= EXAM_GAP * 864e5); if (!e) return null; const d = new Date(e + 9 * 36e5), iso = d.toISOString().slice(0, 10); return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일${(EXAM_TENTATIVE[cert] || []).includes(iso) ? '(예상)' : ''}`; }
const legacyPro = o => /30일/.test(o.order_name || '') || (!o.order_name && new Date(o.approved_at).getTime() < PRO_EXAM_FROM);
/* 묶음(PRO + 요약노트) 판매는 2026-11-25에 중단. 판매된 적 없음. 예전 주문 처리 코드(item 'bundle')는 남겨 둠 */
const NOTE_PRICE = 9900;
let payPick = 'pro';
const proLeft = id => { const e = (G.passExp || {})[id]; return e ? Math.ceil((e - Date.now()) / 864e5) : null; };
function paywall(kind) { afterPay = kind; payPick = 'pro'; if (isPro()) { closeSheet(); return; } drawPay(); }
function drawPay() {
  const opt = (k, t, d, pr, s) => `<button class="plan ${payPick === k ? 'on' : ''}" onclick="payPick='${k}';drawPay()"><span class="rd"></span><div class="grow"><div class="t">${t}</div><div class="d">${d}</div></div><div class="pr">${s ? `<s>${won(s)}</s>` : ''}${won(pr)}</div></button>`;
  const sel = PRO_PLAN.price;
  openSheet(`<h3>${esc(C.short)} PRO로<br>합격선까지 빠르게</h3><div class="p">문제·해설·오답노트는 무료, PRO는 실전 감각과 약점 관리까지</div>
    <div class="feat"><span class="fi">${IC.exam()}</span><span>실전 모의고사<small>시험과 같은 과목 비율·시간으로</small></span></div>
    <div class="feat"><span class="fi">${IC.target()}</span><span>약점 집중 · 맞춤 학습<small>정답률 낮은 단원부터 자동으로</small></span></div>
    <div class="feat"><span class="fi">${IC.ox()}</span><span>OX 선지 퀴즈 · 잊을 때쯤 복습<small>선지를 쪼개 개념을 확실하게, 1·3·7·15·30일 뒤 다시 출제</small></span></div>
    <div style="height:10px"></div>
    ${opt('pro', `${esc(C.short)} PRO <span class="pp-off">오픈 기념가</span>`, (proEndLabel(C.id) ? proEndLabel(C.id) + ' 시험까지' : '결제한 날부터 ' + PRO_PLAN.days + '일') + ' · 자동 결제 없음', PRO_PLAN.price, 0)}
    <button class="btn" style="width:100%;margin-top:6px" onclick="buy()">${payOn() ? won(sel) + ' 결제하기' : 'PRO 오픈 준비 중'}</button>
    <div class="note">${payOn() ? (payPrep() ? PREP_NOTE + '<br>' : '') + '결제 후 7일 이내 미사용 시 전액 환불 · <a onclick="legalPage(\'refund\')" style="text-decoration:underline">환불 규정</a>' : 'PRO는 오픈 준비 중이에요. 문제 풀이·해설·오답노트는 지금도 무료예요.'}</div>`);
}
function buy() {
  if (payOn()) { payStart('pro'); return; }
  toast('PRO는 오픈 준비 중이에요. 열리면 바로 알려드릴게요');
}
/* (예전 오픈 준비 기간의 "무료로 열기"는 쓰지 않아 지웠어요: 콘솔에서 불러 PRO를 열 수 있었음) */

/* ===== 토스페이먼츠 결제 (실결제) ===== */
const PAY = { busy: false, owned: {}, orders: [] };
/* 결제 후 돌아올 주소: 반드시 '지금 결제를 시작한 그 주소'로 돌아와야 해요.
   로그인 세션과 비회원 주문 토큰이 주소(도메인)별로 따로 저장되기 때문에, 다른 주소로 돌아가면 결제 확인을 못 해요.
   (주소 이전 기간에 옛 주소·새 주소 어느 쪽에서 결제해도 안전하게) */
const payBase = () => location.origin + location.pathname;
const PRETRY = 'op_pay_retry'; /* 결제 확인이 실패했을 때 다시 확인하려고 잠깐 보관 (같은 결제를 두 번 청구하지 않음) */
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
/* 토스 결제위젯: 결제수단·약관을 시트 안에 그리고, 손님이 고른 수단으로 결제창을 연다 (계약 상점 = 결제위젯 연동 키) */
async function payWidget(o, customerKey, email, successUrl, failUrl) {
  await loadTossSdk();
  const tp = window.TossPayments((window.OP_CFG || {}).tossClientKey);
  const w = tp.widgets({ customerKey: customerKey === '@@ANONYMOUS' ? window.TossPayments.ANONYMOUS : customerKey });
  openSheet(`<h3>결제수단을 골라 주세요</h3><div class="p">${esc(o.orderName)} · <b>${won(o.amount)}</b></div>
    <div id="pw-methods" style="margin:0 -8px"></div><div id="pw-agree" style="margin:0 -8px"></div>
    <button class="btn" id="pw-go" style="width:100%;margin-top:8px" disabled>${won(o.amount)} 결제하기</button>
    ${payPrep() ? `<div class="note">${PREP_NOTE}</div>` : ''}`);
  await w.setAmount({ currency: 'KRW', value: o.amount });
  await Promise.all([w.renderPaymentMethods({ selector: '#pw-methods', variantKey: 'DEFAULT' }), w.renderAgreement({ selector: '#pw-agree', variantKey: 'AGREEMENT' })]);
  const b = document.getElementById('pw-go'); if (!b) return;
  b.disabled = false;
  b.onclick = async () => {
    if (b.dataset.busy) return; b.dataset.busy = '1';
    try { await w.requestPayment({ orderId: o.orderId, orderName: o.orderName, successUrl, failUrl, customerEmail: email || undefined }); }
    catch (e) { delete b.dataset.busy; if (e && (e.code === 'USER_CANCEL' || /취소/.test(e.message || ''))) toast('결제를 취소했어요'); else toast(e && e.message ? e.message : '결제를 진행하지 못했어요'); }
  };
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
  const p = item === 'note' ? NOTE_PRICE : PRO_PLAN.price;
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
    const base = payBase();
    await payWidget(o, '@@ANONYMOUS', email, base + '?pay=ok&g=1&c=' + encodeURIComponent(cert), base + '?pay=fail&c=' + encodeURIComponent(cert));
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
    const base = payBase();
    await payWidget(o, o.customerKey, o.email, base + '?pay=ok&c=' + encodeURIComponent(cert), base + '?pay=fail&c=' + encodeURIComponent(cert));
  } catch (e) {
    if (e && (e.code === 'USER_CANCEL' || /취소/.test(e.message || ''))) toast('결제를 취소했어요');
    else toast('결제창을 열지 못했어요. 잠시 뒤 다시 해 주세요');
  } finally { PAY.busy = false; }
}
/* 결제 후 돌아왔을 때: 서버에서 승인 → 이용권 반영 */
async function payReturn(again) {
  let paymentKey, orderId, amount;
  if (again && again.paymentKey) ({ paymentKey, orderId, amount } = again);
  else {
    const q = new URLSearchParams(location.search); const st = q.get('pay'); if (!st) return;
    const clean = () => { try { history.replaceState(null, '', location.pathname); } catch (e) {} };
    if (st === 'fail') { clean(); toast(q.get('code') === 'PAY_PROCESS_CANCELED' ? '결제를 취소했어요' : '결제가 완료되지 않았어요'); return; }
    paymentKey = q.get('paymentKey'); orderId = q.get('orderId'); amount = q.get('amount'); clean();
  }
  if (!paymentKey || !orderId) return;
  try { sessionStorage.setItem(PRETRY, JSON.stringify({ paymentKey, orderId, amount })); } catch (e) {}
  openSheet('<h3>결제를 확인하고 있어요</h3><div class="p">잠시만 기다려 주세요. 창을 닫지 마세요.</div>');
  let pend = null; try { pend = JSON.parse(localStorage.getItem(GPEND) || 'null'); } catch (e) {}
  const guest = !!(pend && pend.orderId === orderId);
  try {
    await authInit(); if (!guest) for (let i = 0; i < 20 && !AU.user; i++) await new Promise(r => setTimeout(r, 300));
    const r = await payFn(guest ? { action: 'confirm', paymentKey, orderId, amount: Number(amount), guestToken: pend.token } : { action: 'confirm', paymentKey, orderId, amount: Number(amount) });
    if (guest) { gAdd(r.order, pend.token, pend.email); try { localStorage.removeItem(GPEND); } catch (e) {} }
    try { sessionStorage.removeItem(PRETRY); } catch (e) {}
    await syncPurchases(); closeSheet();
    if (r && r.order && r.order.test && !payAdmin()) { openSheet(`<h3>시험 결제가 끝났어요</h3><div class="p">${PREP_NOTE}<br><br>정식 오픈하면 같은 방법으로 바로 구매할 수 있어요.</div><button class="btn" style="width:100%" onclick="closeSheet();go('home')">확인</button>`); return; }
    const it = r && r.order && r.order.item;
    if (guest) { openSheet(`<h3>결제가 끝났어요 🎉</h3><div class="p">${it === 'note' ? '요약노트를 바로 내려받을 수 있어요.' : 'PRO가 열렸어요. 남은 기간은 내 정보에서 볼 수 있어요.'}<br><br>다른 기기에서 불러올 때 필요하니 아래 주문번호를 꼭 저장해 두세요.</div><div class="card" style="padding:14px;font-size:15px"><b>주문번호</b> ${esc(orderId)}<br><b>이메일</b> ${esc(pend.email)}</div><button class="btn" style="width:100%" onclick="closeSheet();${it === 'note' || it === 'bundle' ? `shopDetail('${r.order.cert}')` : `go('home')`}">확인</button>`); return; }
    toast(it === 'note' ? '결제 완료! 요약노트를 내려받을 수 있어요' : '결제 완료! PRO가 열렸어요 🎉');
    if (it === 'note' || it === 'bundle') { if (typeof shopDetail === 'function') setTimeout(() => shopDetail(r.order.cert), 300); } else go('home');
  } catch (e) {
    /* 카드 거절처럼 토스가 결제를 실패로 판단한 경우는 다시 확인해도 소용없어요. 그 외(인터넷 끊김 등)는 다시 확인하기를 보여 줘요 */
    const tossFail = e && e.message === 'toss';
    if (tossFail) { try { sessionStorage.removeItem(PRETRY); } catch (x) {} }
    closeSheet(); openSheet(tossFail
      ? `<h3>결제가 완료되지 않았어요</h3><div class="p">${esc((e.info && e.info.message) || '결제사에서 결제를 승인하지 않았어요.')}<br><br>다른 결제수단으로 다시 시도해 주세요. 주문번호 ${esc(orderId)}</div><button class="btn" style="width:100%" onclick="closeSheet()">확인</button>`
      : `<h3>결제를 확인하지 못했어요</h3><div class="p">인터넷 연결이 불안정했을 수 있어요. 아래 버튼으로 한 번 더 확인해 주세요. 같은 결제가 두 번 청구되지는 않아요.<br><br>계속 안 되면 주문번호와 함께 문의해 주세요. 확인 후 바로 처리해 드려요.<br><br>주문번호 ${esc(orderId)}</div><button class="btn" style="width:100%" onclick="payRetry()">다시 확인하기</button><button class="btn ghost" style="width:100%;margin-top:8px" onclick="closeSheet();kakaoAsk()">카카오톡으로 문의하기</button>`);
  }
}
function payRetry() { let p = null; try { p = JSON.parse(sessionStorage.getItem(PRETRY) || 'null'); } catch (e) {} closeSheet(); if (!p) { toast('확인할 결제가 없어요. 내 정보에서 결제 내역을 확인해 주세요'); return; } payReturn(p); }
/* 서버의 결제 내역 → 이용권·요약노트 보유 상태 */
/* 비회원 주문을 서버에 다시 확인: 환불됐거나 서버에 없는 주문(직접 만든 가짜 등)은 '취소'로 바꿔요.
   인터넷 문제로 확인을 못 하면 그대로 둬요(정상 구매자가 갑자기 잠기지 않게) */
async function guestRecheck() {
  const list = gOrders(); if (!list.length || !authOn()) return;
  let changed = false;
  for (const o of list) {
    if (o.status !== 'paid' || o.test || !o.email) continue;
    try { const r = await payFn({ action: 'lookup', orderId: o.id, email: o.email }); if (r && r.order && r.order.status !== o.status) { Object.assign(o, r.order); changed = true; } }
    catch (e) { if (e && e.message === 'not_found') { o.status = 'canceled'; changed = true; } }
  }
  if (changed) gSave(list);
}
async function syncPurchases() {
  let server = [], fresh = false;
  if (AU.sb && AU.user) {
    const { data, error } = await AU.sb.from('orders').select('id,cert,item,order_name,amount,status,approved_at,canceled_at,downloaded_at,created_at,test').order('created_at', { ascending: false }).limit(100);
    server = (data || []).filter(o => !o.test || (!PAY_REAL && payAdmin())); /* 시험 결제는 운영자 확인용(오픈 준비 중)만 반영 */
    fresh = !error && Array.isArray(data);
  }
  try { await guestRecheck(); } catch (e) {}
  const guest = gOrders().filter(o => !o.test); /* 비회원 시험 결제는 아무것도 지급하지 않음 */
  PAY.orders = server.concat(guest.filter(g => !server.some(o => o.id === g.id))).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); PAY.owned = {};
  const paid = PAY.orders.filter(o => o.status === 'paid').sort((a, b) => new Date(a.approved_at) - new Date(b.approved_at));
  const exp = {};
  paid.forEach(o => {
    if (o.item === 'pro' || o.item === 'bundle') { const t = new Date(o.approved_at).getTime(), base = Math.max(exp[o.cert] || 0, t); exp[o.cert] = legacyPro(o) ? base + PRO_PLAN.days * 864e5 : proEnd(o.cert, base); }
    if (o.item === 'note' || o.item === 'bundle') PAY.owned[o.cert] = true;
  });
  G.passExp = G.passExp || {};
  Object.keys(exp).forEach(c => { G.passExp[c] = Math.max(G.passExp[c] || 0, exp[c]); if (!G.passCerts.includes(c)) G.passCerts.push(c); });
  /* 환불(취소)된 주문이 있는 자격증은, 남은 정상 결제 기준으로 만료일을 다시 계산해요(늘리기만 하던 문제 수정).
     취소 주문이 없는 자격증은 건드리지 않아요 */
  const canceled = PAY.orders.filter(o => o.status === 'canceled' && (fresh || o.guest));
  [...new Set(canceled.map(o => o.cert))].forEach(c => {
    if (exp[c] && exp[c] > Date.now()) { G.passExp[c] = exp[c]; return; }
    delete G.passExp[c]; G.passCerts = G.passCerts.filter(x => x !== c);
  });
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
