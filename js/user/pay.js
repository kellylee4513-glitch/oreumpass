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
/* ===== 스위치 (결제 서버의 app_settings에서 받아 이 기기에 기억) =====
   explain_limit_at: 상세 해설 하루 20개 제한 시작일 / launch_at: 새 환불 방식(PRO 보관함·사용 시작·앱 환불·결제 전 동의) 시작일
   날짜(한국 시간 0시)부터 켜지고, 비어 있으면 꺼짐. 서버 값만 바꾸면 앱 업데이트 없이 켜고 끌 수 있어요 */
const SW = (() => { try { return JSON.parse(localStorage.getItem('op_switch') || '{}'); } catch (e) { return {}; } })();
const swOn = v => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && Date.now() >= Date.parse(v + 'T00:00:00+09:00');
const explainLimitOn = () => swOn((window.OP_CFG || {}).explainAt || SW.explainAt);
const launched = () => swOn((window.OP_CFG || {}).launchAt || SW.launchAt);
async function switchSync() {
  try {
    const c = window.OP_CFG || {}; if (!c.sbUrl || (typeof authSandbox === 'function' && authSandbox())) return;
    const r = await fetch(c.sbUrl + '/functions/v1/pay', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: c.sbKey }, body: '{"action":"status"}' });
    const d = await r.json(); if (!d || typeof d !== 'object') return;
    const n = { explainAt: d.explainAt || '', launchAt: d.launchAt || '' };
    if (n.explainAt !== (SW.explainAt || '') || n.launchAt !== (SW.launchAt || '')) { Object.assign(SW, n); try { localStorage.setItem('op_switch', JSON.stringify(SW)); } catch (e) {} if (!run && typeof tab !== 'undefined' && tab) go(tab); }
  } catch (e) {}
}
function paywall(kind) { afterPay = kind; payPick = 'pro'; if (isPro()) { closeSheet(); return; } funnel('paywall', { kind }); drawPay(); }
function drawPay() {
  const opt = (k, t, d, pr, s) => `<button class="plan ${payPick === k ? 'on' : ''}" onclick="payPick='${k}';drawPay()"><span class="rd"></span><div class="grow"><div class="t">${t}</div><div class="d">${d}</div></div><div class="pr">${s ? `<s>${won(s)}</s>` : ''}${won(pr)}</div></button>`;
  const sel = PRO_PLAN.price;
  const exOn = explainLimitOn(), L = launched();
  const endT = proEnd(C.id, Date.now()), days = Math.max(1, Math.ceil((endT - Date.now()) / 864e5)), perDay = Math.round(PRO_PLAN.price / days / 10) * 10;
  openSheet(`<h3>${esc(C.short)} PRO${L ? `<br>시험까지 ${won(PRO_PLAN.price)}` : '로<br>합격선까지 빠르게'}</h3><div class="p">${exOn ? '문제 풀이·정답·오답노트는 계속 무료예요.<br>PRO는 해설 무제한과 실전 준비를 더해요.' : '문제·해설·오답노트는 무료, PRO는 실전 감각과 약점 관리까지'}</div>
    ${exOn ? `<div class="feat"><span class="fi">${IC.note()}</span><span>모든 보기 해설 무제한<small>정답뿐 아니라 오답 보기가 왜 틀렸는지까지</small></span></div>` : ''}
    <div class="feat"><span class="fi">${IC.exam()}</span><span>실전 모의고사<small>시험과 같은 과목 비율·시간으로</small></span></div>
    <div class="feat"><span class="fi">${IC.target()}</span><span>약점 집중 · 맞춤 학습<small>정답률 낮은 단원부터 자동으로</small></span></div>
    <div class="feat"><span class="fi">${IC.ox()}</span><span>OX 선지 퀴즈 · 잊을 때쯤 복습<small>선지를 쪼개 개념을 확실하게, 1·3·7·15·30일 뒤 다시 출제</small></span></div>
    <div style="height:10px"></div>
    ${opt('pro', L ? `${esc(C.short)} PRO 시험 이용권` : `${esc(C.short)} PRO <span class="pp-off">오픈 기념가</span>`, (proEndLabel(C.id) ? proEndLabel(C.id) + ' 시험까지' : '결제한 날부터 ' + PRO_PLAN.days + '일') + (L ? ` · 하루 약 ${perDay}원` : ' · 자동 결제 없음'), PRO_PLAN.price, 0)}
    ${L ? `<div class="pp-safe">✓ <b>자동 결제 없어요</b> · 한 번만 결제<br>✓ 결제하면 <b>보관함</b>에 들어가고, 원할 때 사용 시작<br>✓ 사용 시작 전이면 <b>7일 안에 전액 환불</b></div>
    <label class="pp-agree"><input type="checkbox" id="payAgree"><span>디지털 이용권이라 <b>사용 시작 후 1시간이 지나면 환불되지 않는다</b>는 점과 <a role="button" onclick="legalPage('refund')">환불 규정</a>을 확인했어요.</span></label>` : ''}
    <button class="btn${L ? ' sm' : ''}" style="width:100%;margin-top:6px" onclick="buy()">${payOn() ? won(sel) + ' 결제하기' : 'PRO 오픈 준비 중'}</button>
    ${L ? '' : `<div class="note">${payOn() ? (payPrep() ? PREP_NOTE + '<br>' : '') + '결제 후 7일 이내 미사용 시 전액 환불 · <a onclick="legalPage(\'refund\')" style="text-decoration:underline">환불 규정</a>' : 'PRO는 오픈 준비 중이에요. 문제 풀이·해설·오답노트는 지금도 무료예요.'}</div>`}`);
}
function buy() {
  if (payOn()) { if (!agreeOk('payAgree')) return; funnel('buy_click', { item: 'pro' }); payStart('pro'); return; }
  toast('PRO는 오픈 준비 중이에요. 열리면 바로 알려드릴게요');
}
/* (예전 오픈 준비 기간의 "무료로 열기"는 쓰지 않아 지웠어요: 콘솔에서 불러 PRO를 열 수 있었음) */

/* ===== 토스페이먼츠 결제 (실결제) ===== */
const PAY = { busy: false, owned: {}, orders: [] };
/* 결제 후 돌아올 주소: 반드시 '지금 결제를 시작한 그 주소'로 돌아와야 해요.
   로그인 세션과 비회원 주문 토큰이 주소(도메인)별로 따로 저장되기 때문에, 다른 주소로 돌아가면 결제 확인을 못 해요.
   (주소 이전 기간에 옛 주소·새 주소 어느 쪽에서 결제해도 안전하게) */
const payBase = () => location.origin + location.pathname;
/* 결제 단계별 기록(이탈 위치 확인용): 개인 정보 없이 '어느 단계까지 왔는지'만 서버에 남겨요.
   sid는 이 탭에서만 쓰는 임의 번호라 사람을 알아볼 수 없어요. 실패해도 결제에는 아무 영향 없음 */
const FUN_SID = (() => { try { let s = sessionStorage.getItem('op_fsid'); if (!s) { s = Math.random().toString(36).slice(2, 12); sessionStorage.setItem('op_fsid', s); } return s; } catch (e) { return 'x'; } })();
function funnel(step, x) {
  try {
    const c = window.OP_CFG || {}; if (!c.sbUrl || (typeof authSandbox === 'function' && authSandbox())) return;
    fetch(c.sbUrl + '/functions/v1/pay', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', apikey: c.sbKey },
      body: JSON.stringify({ action: 'track', step, sid: FUN_SID, item: (x && x.item) || null, kind: (x && x.kind) || null, login: !!(typeof AU !== 'undefined' && AU.user), admin: payAdmin() }) }).catch(() => {});
  } catch (e) {}
}
const PRETRY = 'op_pay_retry'; /* 결제 확인이 실패했을 때 다시 확인하려고 잠깐 보관 (같은 결제를 두 번 청구하지 않음) */
function loadTossSdk() {
  if (window.TossPayments) return Promise.resolve();
  return new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://js.tosspayments.com/v2/standard'; s.onload = ok; s.onerror = () => no(new Error('sdk')); document.head.appendChild(s); });
}
async function payFn(body) {
  await authInit(); if (!AU.sb) throw new Error('auth');
  /* 결제 서버는 항상 서울(ap-northeast-2)에서 실행: 토스 API 키 접근 정책이 '대한민국'에서 온 요청만 허용해서,
     해외에 있는 손님이 결제하면 가까운 해외 서버에서 승인 요청이 나가 막힐 수 있어요 */
  const { data, error } = await AU.sb.functions.invoke('pay', { body, region: 'ap-northeast-2' });
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
  b.disabled = false; funnel('widget', { item: o.item || null });
  b.onclick = async () => {
    if (b.dataset.busy) return; b.dataset.busy = '1'; funnel('pay_click');
    try { await w.requestPayment({ orderId: o.orderId, orderName: o.orderName, successUrl, failUrl, customerEmail: email || undefined }); }
    catch (e) { delete b.dataset.busy; if (e && (e.code === 'USER_CANCEL' || /취소/.test(e.message || ''))) { funnel('cancel'); toast('결제를 취소했어요'); } else { funnel('pay_error'); toast(e && e.message ? e.message : '결제를 진행하지 못했어요'); } }
  };
}
/* ===== 비회원 결제: 로그인 없이 이메일만으로 결제, 이 기기에 저장 + 주문번호·이메일로 다른 기기에서 불러오기 ===== */
const GKEY = 'op_guest_orders', GPEND = 'op_guest_pending';
const gOrders = () => { try { return JSON.parse(localStorage.getItem(GKEY) || '[]'); } catch (e) { return []; } };
const gSave = a => { try { localStorage.setItem(GKEY, JSON.stringify(a)); } catch (e) {} };
function gAdd(o, token, email) { const a = gOrders().filter(x => x.id !== o.id); a.push(Object.assign({}, o, { token, email, guest: true })); gSave(a); }
const gFind = (cert, items) => gOrders().find(o => o.cert === cert && o.status === 'paid' && !o.test && items.includes(o.item));
const EMAIL_OK = e => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(e);
function loginBuy(item, cert) { funnel('login_click', { item }); closeSheet(); try { sessionStorage.setItem('op_buy', JSON.stringify({ item, cert })); } catch (e) {} loginSheet('로그인하고 결제하면\n어느 기기에서든 이용할 수 있어요'); }
function guestSheet(item, cert) {
  funnel('choose', { item });
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
  if (PAY.busy) return; PAY.busy = true; toast('결제창을 여는 중이에요'); funnel('guest_submit', { item });
  try {
    const o = await payFn({ action: 'order', cert, item, email, agree: launched() ? PAY.agree === true : undefined });
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
  if (PAY.busy) return; funnel('start', { item });
  if (!AU.user) { guestSheet(item, cert); return; }
  PAY.busy = true; toast('결제창을 여는 중이에요');
  try {
    const o = await payFn({ action: 'order', cert, item, agree: launched() ? PAY.agree === true : undefined });
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
    if (st === 'fail') { clean(); funnel(q.get('code') === 'PAY_PROCESS_CANCELED' ? 'cancel' : 'return_fail'); toast(q.get('code') === 'PAY_PROCESS_CANCELED' ? '결제를 취소했어요' : '결제가 완료되지 않았어요'); return; }
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
    funnel('paid', { item: r && r.order && r.order.item });
    await syncPurchases(); closeSheet();
    if (r && r.order && r.order.test && !payAdmin()) { openSheet(`<h3>시험 결제가 끝났어요</h3><div class="p">${PREP_NOTE}<br><br>정식 오픈하면 같은 방법으로 바로 구매할 수 있어요.</div><button class="btn" style="width:100%" onclick="closeSheet();go('home')">확인</button>`); return; }
    const it = r && r.order && r.order.item;
    if (r && r.order && r.order.boxed && !r.order.started_at) { boxedDone(r.order, guest ? pend : null); return; }
    if (guest) { openSheet(`<h3>결제가 끝났어요 🎉</h3><div class="p">${it === 'note' ? '요약노트를 바로 내려받을 수 있어요.' : 'PRO가 열렸어요. 남은 기간은 내 정보에서 볼 수 있어요.'}<br><br>다른 기기에서 불러올 때 필요하니 아래 주문번호를 꼭 저장해 두세요.</div><div class="card" style="padding:14px;font-size:15px"><b>주문번호</b> ${esc(orderId)}<br><b>이메일</b> ${esc(pend.email)}</div><button class="btn" style="width:100%" onclick="closeSheet();${it === 'note' || it === 'bundle' ? `shopDetail('${r.order.cert}')` : `go('home')`}">확인</button>`); return; }
    toast(it === 'note' ? '결제 완료! 요약노트를 내려받을 수 있어요' : '결제 완료! PRO가 열렸어요 🎉');
    if (it === 'note' || it === 'bundle') { if (typeof shopDetail === 'function') setTimeout(() => shopDetail(r.order.cert), 300); } else go('home');
  } catch (e) {
    /* 카드 거절처럼 토스가 결제를 실패로 판단한 경우는 다시 확인해도 소용없어요. 그 외(인터넷 끊김 등)는 다시 확인하기를 보여 줘요 */
    const tossFail = e && e.message === 'toss'; funnel(tossFail ? 'declined' : 'confirm_fail');
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
    const { data, error } = await AU.sb.from('orders').select('id,cert,item,order_name,amount,status,approved_at,canceled_at,downloaded_at,created_at,test,boxed,started_at,refund_kind').order('created_at', { ascending: false }).limit(100);
    server = (data || []).filter(o => !o.test || (!PAY_REAL && payAdmin())); /* 시험 결제는 운영자 확인용(오픈 준비 중)만 반영 */
    fresh = !error && Array.isArray(data);
  }
  try { await guestRecheck(); } catch (e) {}
  const guest = gOrders().filter(o => !o.test); /* 비회원 시험 결제는 아무것도 지급하지 않음 */
  PAY.orders = server.concat(guest.filter(g => !server.some(o => o.id === g.id))).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); PAY.owned = {};
  const paid = PAY.orders.filter(o => o.status === 'paid').sort((a, b) => new Date(a.approved_at) - new Date(b.approved_at));
  const exp = {};
  paid.forEach(o => {
    if ((o.item === 'pro' || o.item === 'bundle') && !(o.boxed && !o.started_at)) { const t = new Date(o.started_at || o.approved_at).getTime(), base = Math.max(exp[o.cert] || 0, t); exp[o.cert] = legacyPro(o) ? base + PRO_PLAN.days * 864e5 : proEnd(o.cert, base); }
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

/* ===== 결제 전 동의 (새 환불 방식이 켜졌을 때만) ===== */
function agreeOk(id) {
  if (!launched()) { PAY.agree = undefined; return true; }
  const c = document.getElementById(id); if (!c || !c.checked) { toast('환불 규정을 확인하고 체크해 주세요'); return false; }
  PAY.agree = true; return true;
}
function noteBuy(cert) { if (!agreeOk('noteAgree')) return; payStart('note', cert); }

/* ===== PRO 보관함: 사용 시작 · 앱 환불 (새 환불 방식) ===== */
const fmtD = t => { const d = new Date(t); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
const fmtT = t => { const d = new Date(t); const h = d.getHours(); return `${fmtD(t)} ${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${pad2(d.getMinutes())}`; };
const ordArg = o => o.guest ? { orderId: o.id, guestToken: o.token } : { orderId: o.id };
/* 앱에서 바로 환불할 수 있는지: { kind, until } 또는 null (서버가 한 번 더 확인해요) */
function refundInfo(o) {
  if (!o || o.status !== 'paid' || o.test) return null;
  const now = Date.now(), paid = new Date(o.approved_at || o.created_at).getTime();
  if (o.item === 'note' && launched() && !o.downloaded_at && now - paid <= 7 * 864e5) return { kind: 'unused', until: paid + 7 * 864e5 }; /* 새 환불 방식이 꺼져 있으면 앱 환불 버튼 없음 */
  if (o.item === 'pro' && o.boxed) {
    if (!o.started_at) return now - paid <= 7 * 864e5 ? { kind: 'unused', until: paid + 7 * 864e5 } : null;
    const st = new Date(o.started_at).getTime(); if (now - st <= 36e5) return { kind: 'quick', until: st + 36e5 };
  }
  return null;
}
function boxCards() {
  const L = (PAY.orders || []).filter(o => o.item === 'pro' && o.boxed && o.status === 'paid' && READY.some(c => c.id === o.cert));
  if (!L.length) return '';
  return `<div class="sec" style="margin-top:6px">PRO 보관함</div>` + L.map(o => {
    const c = READY.find(x => x.id === o.cert), rf = refundInfo(o), endL = proEndLabel(o.cert, o.started_at ? new Date(o.started_at).getTime() : Date.now());
    if (!o.started_at) return `<div class="card box"><span class="tag pro">사용 전</span><div class="bx-t">${esc(c.short)} PRO 시험 이용권</div><div class="bx-d">${fmtD(o.approved_at)} 결제 · ${won(o.amount)}</div>
      <div class="bx-p">사용을 시작하면 <b>${endL ? endL + ' 시험까지' : '30일 동안'}</b> 열려요.</div>
      <button class="btn sm" style="width:100%" onclick="proStart('${o.id}')">사용 시작하기</button>
      <div class="bx-f">${rf ? `사용 전 · ${fmtD(rf.until)}까지 전액 환불 가능 · <a role="button" onclick="proRefund('${o.id}')">환불 신청</a>` : '환불 기간이 지났어요'}</div></div>`;
    const endT = proEnd(o.cert, new Date(o.started_at).getTime()), dd = Math.ceil((endT - Date.now()) / 864e5);
    return `<div class="card box"><span class="tag on">${dd > 0 ? '사용 중' : '기간 끝남'}</span><div class="bx-t">${esc(c.short)} PRO 시험 이용권</div><div class="bx-d">${fmtT(o.started_at)} 사용 시작</div>
      ${dd > 0 ? `<div class="bx-dd">D-${dd} <span>${endL ? endL.replace('(예상)', '') + ' 시험까지' : ''}</span></div>` : ''}
      ${rf && rf.kind === 'quick' ? `<div class="bx-q">실수로 시작했나요? <b>${Math.max(1, Math.ceil((rf.until - Date.now()) / 6e4))}분 안에</b> 한 번 전액 환불할 수 있어요. <a role="button" onclick="proRefund('${o.id}')">환불 신청</a></div>` : ''}</div>`;
  }).join('');
}
function boxedDone(o, pend) {
  openSheet(`<div class="hi">${IC.trophy()}</div><h3>결제가 끝났어요</h3><div class="p">PRO 이용권이 <b>보관함</b>에 들어갔어요.<br>공부를 시작할 때 '사용 시작'을 눌러 주세요.<br>사용 전이면 ${fmtD(new Date(o.approved_at || Date.now()).getTime() + 7 * 864e5)}까지 전액 환불돼요.</div>
    ${pend ? `<div class="card" style="padding:14px;font-size:14px;margin:6px 0 10px"><b>주문번호</b> ${esc(o.id)}<br><b>이메일</b> ${esc(pend.email)}<br><span style="color:var(--gray)">다른 기기에서 불러올 때 필요하니 꼭 저장해 두세요.</span></div>` : ''}
    <button class="btn sm" style="width:100%" onclick="proStart('${o.id}')">지금 사용 시작하기</button>
    <button class="btn sm ghost" style="width:100%;margin-top:8px" onclick="closeSheet();go('my')">나중에 할게요</button>`);
}
function proStart(id) {
  const o = (PAY.orders || []).find(x => x.id === id); if (!o) { toast('주문을 찾지 못했어요'); return; }
  const endL = proEndLabel(o.cert, Date.now());
  openSheet(`<div class="hi">${IC.calendar()}</div><h3>지금 사용을 시작할까요?</h3>
    <div class="feat"><span class="ck">1</span><span>누르는 즉시 PRO가 열려요<small>모의고사 · 해설 무제한 · 약점 학습</small></span></div>
    <div class="feat"><span class="ck">2</span><span>${endL ? endL + ' 시험까지' : '30일 동안'} 쓸 수 있어요</span></div>
    <div class="feat"><span class="ck">3</span><span>실수로 눌렀다면 1시간 안에 한 번 전액 환불<small>계정당 1회 · 1시간이 지나면 환불되지 않아요</small></span></div>
    <button class="btn sm" style="width:100%;margin-top:8px" onclick="proStartGo('${id}')">사용 시작</button>
    <button class="btn sm ghost" style="width:100%;margin-top:8px" onclick="closeSheet()">아직 안 할래요</button>`);
}
async function proStartGo(id) {
  const o = (PAY.orders || []).find(x => x.id === id); if (!o || PAY.busy) return; PAY.busy = true;
  try { const r = await payFn(Object.assign({ action: 'start' }, ordArg(o))); if (o.guest && r.order) gAdd(r.order, o.token, o.email); await syncPurchases(); closeSheet(); toast('PRO가 열렸어요 🎉'); go('my'); }
  catch (e) { toast('사용을 시작하지 못했어요. 잠시 뒤 다시 해 주세요'); }
  finally { PAY.busy = false; }
}
function proRefund(id) {
  const o = (PAY.orders || []).find(x => x.id === id), rf = refundInfo(o); if (!o || !rf) { toast('앱에서 환불할 수 있는 기간이 지났어요. 카카오톡으로 문의해 주세요'); return; }
  openSheet(`<h3>${won(o.amount)} 전액 환불할까요?</h3><div class="p">${esc(o.order_name)}<br>${rf.kind === 'quick' ? '사용 시작 후 1시간 이내 환불은 <b>계정당 한 번만</b> 할 수 있어요.<br>' : ''}환불하면 ${o.item === 'note' ? '요약노트를 내려받을 수 없게' : 'PRO가 바로 닫히게'} 되고, 되돌릴 수 없어요.<br>카드 결제는 카드사 사정에 따라 취소가 보이기까지 며칠 걸릴 수 있어요.</div>
    <button class="btn sm" style="width:100%" onclick="proRefundGo('${id}')">환불하기</button>
    <button class="btn sm ghost" style="width:100%;margin-top:8px" onclick="closeSheet()">취소</button>`);
}
async function proRefundGo(id) {
  const o = (PAY.orders || []).find(x => x.id === id); if (!o || PAY.busy) return; PAY.busy = true; toast('환불을 요청하고 있어요');
  try {
    const r = await payFn(Object.assign({ action: 'refund' }, ordArg(o)));
    if (o.guest && r.order) gAdd(r.order, o.token, o.email);
    await syncPurchases(); closeSheet(); toast('환불했어요. 결제한 수단으로 돌려드려요'); go('my');
  } catch (e) {
    const m = { quick_used: '사용 후 환불은 계정당 한 번만 할 수 있어요', not_refundable: '앱에서 환불할 수 있는 기간이 지났어요. 카카오톡으로 문의해 주세요' }[e && e.message];
    closeSheet(); toast(m || '환불하지 못했어요. 카카오톡으로 문의해 주세요');
  } finally { PAY.busy = false; }
}
