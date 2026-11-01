/* [user/my.js] 사용자: 내 정보 탭 · 기록 초기화 */
/* ===== 내 정보 ===== */
function myTab() {
  const mine = READY.filter(c => G.passAll || G.passCerts.includes(c.id));
  $app.innerHTML = `<div class="top"><div class="ttl">내 정보</div></div><div class="pad">
    <div class="card prof"><div class="av">${IC.user()}</div><div class="grow"><div style="font-size:18px;font-weight:800">${G.name ? esc(G.name) : '수험생'}님</div><div style="font-size:14px;color:var(--gray);margin-top:3px">${G.passAll ? '더오를패스 ALL 이용 중' : mine.length ? mine.map(c => c.short).join('·') + ' PRO 이용 중' : '무료 이용 중'}</div></div><button class="tag free" onclick="nameSheet()">이름 변경</button></div>
    ${G.passAll ? '' : `<button class="upsell" onclick="paywall('all')"><div class="deco">${IC.trophy()}</div><div class="t">더오를패스 ALL</div><div class="d">지금 있는 자격증과 앞으로 추가될 자격증 PRO 전부</div><span class="go">${won(ALL_PRICE)}에 시작하기</span></button>`}
    <div class="sec" style="margin-top:6px">${esc(C.short)} 설정</div>
    <div class="card list" style="padding:4px 20px">
      <button class="li" onclick="go('certs')"><span class="ico">${badge(C, 32)}</span>공부 중인 자격증<span class="r">${esc(C.name)} ›</span></button>
      <button class="li" onclick="examSheet()"><span class="ico">${IC.calendar()}</span>시험일<span class="r">${S.exam ? S.exam.replace(/-/g, '.') : '설정 안 함'} ›</span></button>
      <button class="li" onclick="goalSheet()"><span class="ico">${IC.goal()}</span>하루 목표<span class="r">${S.goal}문제 ›</span></button>
${PDF_LINK && PDF_LINK !== '#' ? `<a class="li" href="${PDF_LINK}" target="_blank" rel="noopener"><span class="ico">${IC.book()}</span>${esc(C.short)} 핵심 정리본 PDF<span class="r">›</span></a>` : ''}
    </div>
    <div class="card list" style="padding:4px 20px">
      <button class="li" onclick="faqPage()"><span class="ico">${IC.faq()}</span>이용 안내 · FAQ<span class="r">›</span></button>
      <button class="li" onclick="syncSheet()"><span class="ico">${IC.phone()}</span>기기 간 기록 옮기기<span class="r">아이폰·안드로이드·PC ›</span></button>
      <button class="li" onclick="installGuide()"><span class="ico">${IC.phone()}</span>홈 화면에 추가<span class="r">›</span></button>
      <button class="li" onclick="resetAll()" style="color:var(--red)"><span class="ico"></span>${esc(C.short)} 학습 기록 초기화</button>
    </div>
    <div class="foot">${policyLinks()}더오를패스 · 자격증 CBT (시제품)<br>문제는 기출 원문이 아니라 출제 포인트를 바탕으로 직접 만든 문항입니다.<br>학습 기록은 이 브라우저에 자격증별로 저장돼요.</div>
  </div>`; tabbar(); }
let resetArm = false;
function resetAll() { if (!resetArm) { resetArm = true; toast('한 번 더 누르면 ' + C.short + ' 기록이 초기화돼요'); setTimeout(() => resetArm = false, 2500); return; } G.data[C.id] = blankCert(); useCert(C.id); save(); resetArm = false; toast('기록을 초기화했어요'); go('home'); }

