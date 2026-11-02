/* [screens/faq.js] 이용 안내 · 정책 링크 */
/* 이용 안내 */
function faqPage() { markNav();
  window.scrollTo(0, 0); $app.classList.remove('wide');
  const F = [
    ['무료로 어디까지 쓸 수 있나요?', `문제 풀이는 모두 무료예요. 실전 모의고사, 빠른 10문제, 과목·단원별, 세트별 풀이, 문제은행 검색, 해설 보기까지 결제 없이 쓸 수 있어요.`],
    ['PRO는 무엇이 다른가요?', `틀린 문제를 모아 다시 푸는 오답노트, 북마크 모아보기, OX 선지 퀴즈, 약점 과목 집중 학습이 열려요. 자격증별로 ${won(C.price || 9900)}이에요.`],
    ['해설·시험·오픈북 모드는 어떻게 달라요?', `해설 모드는 한 문제마다 바로 정답과 해설을 보여 줘요. 시험 모드는 정답을 숨긴 채 끝까지 풀고 한 번에 채점해요. 오픈북 모드는 정답과 해설을 펼쳐 놓고 읽는 공부용이라 기록이 남지 않아요.`],
    ['문제는 어디서 가져왔나요?', `기출 문제를 그대로 옮기지 않았어요. 시험에 자주 나오는 출제 포인트를 바탕으로 더오를이 문장·보기·숫자·해설을 새로 만든 문항이에요. 2026년 개정 세법처럼 바뀐 내용은 '2026 개정' 표시를 달았어요.`],
    ['학습 기록은 어디에 저장되나요?', `지금은 회원가입 없이 이 기기의 브라우저에 자격증별로 저장돼요. 브라우저 기록을 지우거나 다른 기기에서 열면 기록이 이어지지 않아요. 로그인 기능이 생기면 기기 간에 이어 볼 수 있게 할게요.`],
    ['틀린 문제나 바뀐 법령을 발견했어요', `문제 화면 오른쪽 위 ⚠ 버튼으로 제보 내용을 복사해서 보내 주세요. 확인 후 고쳐서 반영해요.`],
    ['펜 필기는 어떻게 써요?', `문제 화면의 펜 버튼을 누르면 문제 위에 직접 밑줄을 긋거나 계산할 수 있어요. 색을 바꾸거나 지울 수 있고, 다른 문제로 넘어가면 지워져요.`],
    ['환불은 어떻게 되나요?', `지금은 시제품이라 실제 결제가 일어나지 않아요. 정식 출시 때 환불 규정을 결제 화면과 이 페이지에 함께 안내할게요.`]
  ];
  $app.innerHTML = topBar('이용 안내') + `<div class="pad upage"><div class="lead">${esc(C.name)} · 자주 묻는 질문</div>
    ${F.map(([q, a], i) => `<div class="faq ${i === 0 ? 'open' : ''}" role="button" tabindex="0" onclick="this.classList.toggle('open')"><div class="fq"><span class="qm">Q</span><span class="grow">${q}</span><span class="ar">⌄</span></div><div class="fa">${a}</div></div>`).join('')}
    <div class="foot">${policyLinks()}</div></div>`; tabbar();
}
function policyLinks() { return `<div class="pol"><a role="button" tabindex="0" onclick="toast('정식 출시 전에 공개돼요')">이용약관</a><a role="button" tabindex="0" onclick="toast('정식 출시 전에 공개돼요')">개인정보처리방침</a><a role="button" tabindex="0" onclick="toast('정식 출시 전에 공개돼요')">환불 규정</a><a role="button" tabindex="0" onclick="faqPage()">이용 안내</a></div>`; }


