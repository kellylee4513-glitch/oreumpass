/* [user/pay.js] 결제(PRO · ALL 패스) — 지금은 시제품 */
/* ===== 결제: 자격증별 PRO + 통합 패스 ===== */
let payPick = 'all';
function paywall(kind) { afterPay = kind; payPick = kind === 'all' ? 'all' : (G.passCerts.includes(C.id) ? 'all' : 'one'); drawPay(); }
function drawPay() { const one = kind => `<button class="plan ${payPick === kind ? 'on' : ''}" onclick="payPick='${kind}';drawPay()">`;
  openSheet(`<h3>틀린 문제만 골라서<br>자격증 합격까지 빠르게</h3><div class="p">더오를패스 PRO로 합격선까지 약점을 집중 복습하세요</div>
    <div class="feat"><span class="fi">${IC.note()}</span><span>오답노트 자동 정리<small>틀린 문제만 다시 풀고, 맞히면 빠져요</small></span></div>
    <div class="feat"><span class="fi">${IC.ox()}</span><span>OX 선지 퀴즈<small>선지를 쪼개서 개념을 확실하게</small></span></div>
    <div class="feat"><span class="fi">${IC.target()}</span><span>약점 과목 집중 · 별표 문제<small>정답률 낮은 과목부터 자동으로</small></span></div>
    <div style="height:10px"></div>
    ${G.passCerts.includes(C.id) ? '' : `${one('one')}<span class="rd"></span><div class="grow"><div class="t">${esc(C.short)} PRO</div><div class="d">${esc(C.name)} 시험일까지</div></div><div class="pr">${won(C.price)}</div></button>`}
    ${one('all')}<span class="rd"></span><div class="grow"><div class="t">더오를패스 ALL <span class="best">추천</span></div><div class="d">모든 자격증 PRO · 새 자격증도 자동 포함</div></div><div class="pr"><s>${won(ALL_LIST)}</s>${won(ALL_PRICE)}</div></button>
    <button class="btn" style="width:100%;margin-top:6px" onclick="buy()">${payPick === 'all' ? won(ALL_PRICE) : won(C.price)} 결제하기</button>
    <div class="note">시제품이라 실제 결제는 되지 않고 바로 잠금이 풀려요</div>`); }
function buy() { if (payPick === 'all') G.passAll = true; else if (!G.passCerts.includes(C.id)) G.passCerts.push(C.id); save(); closeSheet(); toast((payPick === 'all' ? '더오를패스 ALL' : C.short + ' PRO') + '가 열렸어요 🎉');
  setTimeout(() => { if (afterPay === 'ox') startOx(0); else if (afterPay === 'weak') startWeak(); else if (afterPay === 'all') go(tab); else { tab = 'note'; go('note'); } }, 300); }

