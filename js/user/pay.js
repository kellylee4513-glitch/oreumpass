/* [user/pay.js] 결제: 자격증별 PRO 30일권 (+ 요약노트 묶음) */
/* PAY_LIVE: 토스페이먼츠 실결제 연결 전에는 false → 오픈 준비 기간 무료 체험으로 30일 열어 줌 */
const PAY_LIVE = false;
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
    ${opt('pro', `${esc(C.short)} PRO 30일 <span class="pp-off">오픈 기념가</span>`, '‘사용하기’를 누른 날부터 30일', PRO_PLAN.price, 0)}
    ${note ? opt('bundle', 'PRO 30일 + 요약노트 PDF', `따로 사면 ${won(PRO_PLAN.price + 6500)}`, BUNDLE.price, PRO_PLAN.price + 6500) : ''}
    <button class="btn" style="width:100%;margin-top:6px" onclick="buy()">${PAY_LIVE ? won(sel) + ' 결제하기' : '오픈 기념 무료로 30일 열기'}</button>
    <div class="note">${PAY_LIVE ? '결제 후 7일 이내 미사용 시 전액 환불 · <a onclick="legalPage(\'refund\')" style="text-decoration:underline">환불 규정</a>' : '결제 오픈 준비 중이에요. 지금은 무료로 30일 동안 열어 드려요.'}</div>`);
}
function buy() {
  if (PAY_LIVE) { toast('결제창을 여는 중이에요'); return; } /* 토스페이먼츠 연결 시 여기서 결제창 호출 */
  G.passExp = G.passExp || {}; if (!G.passCerts.includes(C.id)) G.passCerts.push(C.id);
  G.passExp[C.id] = Date.now() + PRO_PLAN.days * 864e5; save(); closeSheet(); toast(C.short + ' PRO가 30일 동안 열렸어요 🎉');
  setTimeout(() => { if (afterPay === 'ox') startOx(0); else if (afterPay === 'custom') startCustom(); else if (afterPay === 'weak') startWeak(); else if (afterPay === 'mock') startMock(true); else go(tab); }, 300);
}
