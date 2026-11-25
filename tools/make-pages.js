/* 더오를패스 검색용 소개 페이지 만들기
   구글이 기능별로 따로 읽을 수 있는 페이지(문제 풀이·모의고사·OX·오답노트·요약노트·이용권·커뮤니티)를 만들어요.
   검색 결과 아래에 붙는 링크(사이트링크)는 이런 페이지가 있어야 생겨요.
   사용: (저장소 폴더에서) node tools/make-pages.js
   내용을 고칠 때는 아래 PAGES만 고치고 다시 실행해요. 만든 뒤 sitemap.xml도 함께 갱신돼요. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = 'https://theoreulpass.com/';
const TODAY = new Date().toISOString().slice(0, 10);

/* 위쪽 메뉴와 아래쪽 링크에 함께 쓰는 목록 */
const NAV = [
  ['cbt/', '문제 풀이'], ['mock/', '모의고사'], ['ox/', 'OX 퀴즈'], ['wrong-note/', '오답노트'],
  ['summary-note/', '요약노트'], ['pricing/', '이용권'], ['community/', '커뮤니티']
];
const FOOT = [['', '앱 열기'], ['about.html', '더오를패스 소개'], ['guide.html', '투자자산운용사 시험 안내'], ...NAV];

const PAGES = [
  {
    slug: 'cbt', nav: '문제 풀이',
    title: '투자자산운용사 CBT 문제 풀이 867문항 · 더오를패스',
    desc: '투자자산운용사 3과목 16개 단원 867문항을 무료로 풀어요. 모든 보기 해설(하루 20문제 무료), 과목·단원별 풀기, 세트별 풀기, 문제은행 검색을 지원해요.',
    h1: '투자자산운용사 CBT 문제 풀이',
    lead: '3과목 16개 단원, 867문항을 휴대폰과 PC에서 바로 풀어요. 문제 풀이와 정답 확인은 모두 무료이고, 상세 해설은 하루 20문제까지 무료예요.',
    go: 'play', cta: '문제 풀러 가기',
    body: `<h2>이렇게 풀 수 있어요</h2>
<div class="card"><ul>
<li><b>빠른 10문제:</b> 시간이 없을 때 무작위 10문항으로 감을 유지해요.</li>
<li><b>과목·단원별:</b> 약한 단원만 골라서 집중적으로 풀어요.</li>
<li><b>세트별:</b> 정해진 묶음을 처음부터 끝까지 풀어요.</li>
<li><b>문제은행 검색:</b> 헷갈리는 개념을 키워드로 찾아 관련 문항을 모아 봐요.</li>
</ul></div>
<h2>세 가지 풀이 모드</h2>
<table><tr><th>모드</th><th>이렇게 달라요</th></tr>
<tr><td>해설 모드</td><td>한 문제마다 바로 정답과 해설을 보여 줘요.</td></tr>
<tr><td>시험 모드</td><td>정답을 숨긴 채 끝까지 풀고 한 번에 채점해요.</td></tr>
<tr><td>오픈북 모드</td><td>정답과 해설을 펼쳐 놓고 읽는 공부용이에요. 기록은 남지 않아요.</td></tr></table>
<h2>모든 보기 해설</h2>
<p>정답이 왜 맞는지뿐 아니라 오답 보기가 각각 왜 틀렸는지도 설명해요. 문항마다 쉬운 말 풀이와 10초 암기 문구가 함께 있어요.</p>
<p>기출 문제를 그대로 옮기지 않았어요. 자주 나오는 출제 포인트를 바탕으로 문장·보기·숫자·해설을 새로 만들었고, 2026년 개정 세법처럼 바뀐 내용은 '2026 개정' 표시를 달았어요.</p>`
  },
  {
    slug: 'mock', nav: '모의고사',
    title: '투자자산운용사 실전 모의고사 100문항 · 더오를패스',
    desc: '실제 시험처럼 100문항을 120분 동안 풀고 과목별 점수와 과락 여부를 확인하는 투자자산운용사 실전 모의고사예요.',
    h1: '투자자산운용사 실전 모의고사',
    lead: '실제 시험과 같은 과목 비율과 시간으로 100문항을 풀어요. 끝나면 과목별 점수와 합격 여부를 바로 확인해요.',
    go: 'play', cta: '모의고사 보러 가기',
    body: `<h2>실제 시험과 같은 구성</h2>
<table><tr><th>과목</th><th>문항 수</th></tr>
<tr><td>1과목 금융상품 및 세제</td><td>20</td></tr>
<tr><td>2과목 투자운용 및 전략 II, 투자분석</td><td>30</td></tr>
<tr><td>3과목 직무윤리·법규, 투자운용 및 전략 I, 거시경제·분산투자</td><td>50</td></tr></table>
<h2>이런 걸 확인해요</h2>
<div class="card"><ul>
<li><b>타이머와 OMR:</b> 120분 시간 제한과 답안 표기 화면으로 실전처럼 연습해요.</li>
<li><b>과목별 점수와 과락:</b> 과목마다 40% 이상, 전체 70% 이상인지 바로 알려 줘요.</li>
<li><b>틀린 문제 정리:</b> 틀린 문항은 오답노트로 모여서 다시 풀 수 있어요.</li>
</ul></div>
<p>실전 모의고사는 <a href="../pricing/">PRO 이용권</a>으로 열려요. 문제 풀이와 정답 확인은 무료로 먼저 써 볼 수 있어요.</p>`
  },
  {
    slug: 'ox', nav: 'OX 퀴즈',
    title: '투자자산운용사 OX 선지 퀴즈 · 더오를패스',
    desc: '객관식 보기 하나하나를 OX 문제로 쪼개 개념을 확실하게 점검하는 투자자산운용사 OX 선지 퀴즈예요. 잊을 때쯤 다시 내 주는 복습도 함께 해요.',
    h1: '투자자산운용사 OX 선지 퀴즈',
    lead: '객관식 보기를 하나씩 OX로 쪼개서 풀어요. 정답 하나만 맞히는 것보다 개념을 훨씬 촘촘하게 점검할 수 있어요.',
    go: 'home', cta: 'OX 퀴즈 풀러 가기',
    body: `<h2>왜 OX로 풀까요</h2>
<p>4지선다는 정답 하나만 알아도 맞힐 수 있어요. 하지만 시험에서는 같은 개념이 다른 보기로 다시 나와요. 보기마다 맞는지 틀린지 판단해 보면 모르는 부분이 바로 드러나요.</p>
<h2>이렇게 써요</h2>
<div class="card"><ul>
<li><b>오늘의 OX:</b> 홈 화면에서 매일 새 문제를 하나씩 풀어요.</li>
<li><b>OX 선지 퀴즈:</b> 단원별로 보기를 빠르게 넘기며 점검해요.</li>
<li><b>잊을 때쯤 복습:</b> 틀린 선지를 1·3·7·15·30일 뒤에 다시 내 줘요.</li>
<li><b>OX 오답 모아 보기:</b> 틀린 OX 문항은 오답노트의 OX 탭에 모여요.</li>
</ul></div>
<p>전체 OX 선지 퀴즈와 복습은 <a href="../pricing/">PRO 이용권</a>으로 열려요.</p>`
  },
  {
    slug: 'wrong-note', nav: '오답노트',
    title: '투자자산운용사 오답노트 · 틀린 문제 다시 풀기 · 더오를패스',
    desc: '틀린 문제, OX 오답, 별표한 문제를 자동으로 모아 다시 푸는 투자자산운용사 오답노트예요. 무료로 쓸 수 있어요.',
    h1: '투자자산운용사 오답노트',
    lead: '틀린 문제는 따로 적지 않아도 자동으로 모여요. 모아 둔 문제만 골라서 다시 풀 수 있어요. 오답노트는 무료예요.',
    go: 'note', cta: '오답노트 열기',
    body: `<h2>자동으로 모이는 세 가지</h2>
<table><tr><th>탭</th><th>모이는 문제</th></tr>
<tr><td>오답</td><td>문제 풀이와 모의고사에서 틀린 문항</td></tr>
<tr><td>OX 오답</td><td>OX 선지 퀴즈에서 틀린 선지</td></tr>
<tr><td>별표</td><td>다시 보고 싶어서 별표를 누른 문항</td></tr></table>
<h2>함께 쓰면 좋은 기능</h2>
<div class="card"><ul>
<li><b>오답 원인 태그:</b> '개념을 몰랐어요', '헷갈렸어요', '계산 실수', '문제를 잘못 읽었어요' 중에서 골라 두면 나만의 약점 분석이 만들어져요.</li>
<li><b>자주 틀린 문제 TOP 10:</b> 내가 반복해서 틀리는 문항을 모아 보여 줘요.</li>
<li><b>1분 개념 카드:</b> 핵심 개념을 카드로 넘기며 짧게 다시 외워요.</li>
</ul></div>
<p>로그인하면 기록이 계정에 저장돼서 휴대폰과 PC 어디서나 이어서 볼 수 있어요.</p>`
  },
  {
    slug: 'summary-note', nav: '요약노트',
    title: '투자자산운용사 요약노트 PDF · 더오를패스',
    desc: '두꺼운 기본서 대신 시험에 나오는 핵심만 담은 투자자산운용사 요약노트 PDF예요. 무료 샘플 8쪽을 먼저 받아 볼 수 있어요.',
    h1: '투자자산운용사 요약노트 PDF',
    lead: '시험 전 마지막 정리를 위해, 두꺼운 기본서 대신 핵심만 담은 요약노트예요. 앱에서 바로 구매하고 내려받아요.',
    go: 'shop', cta: '요약노트 보러 가기',
    body: `<h2>이런 분께 맞아요</h2>
<div class="card"><ul>
<li>시험 직전, 두꺼운 기본서를 한 번에 정리하고 싶은 분</li>
<li>세율·기한·공식처럼 헷갈리는 숫자를 반복해서 외우고 싶은 분</li>
<li>출력해서 손으로 채우며 공부하는 분</li>
</ul></div>
<h2>가격</h2>
<table><tr><th>상품</th><th>가격</th></tr>
<tr><td>요약노트 PDF</td><td>9,900원</td></tr></table>
<p><a href="../files/tuunsa_sample.pdf">무료 샘플 PDF(8쪽)</a>를 먼저 받아 보고 결정하세요.</p>
<h2>구매 전 확인해 주세요</h2>
<p>디지털 콘텐츠(PDF)라서 실물 배송은 없어요. 결제 후 7일 안에 내려받지 않았다면 전액 환불돼요. 공식 기본서를 대신하지 않는 개인 학습용 요약 자료예요.</p>`
  },
  {
    slug: 'pricing', nav: '이용권',
    title: '더오를패스 이용권 · 무료 기능과 PRO 가격',
    desc: '더오를패스는 문제 풀이·정답·오답노트가 무료이고 상세 해설은 하루 20문제까지 무료예요. PRO 이용권은 4,900원으로 다음 시험일까지 실전 모의고사, 약점 맞춤 학습, OX 퀴즈를 열어요. 자동 결제는 없어요.',
    h1: '더오를패스 이용권',
    lead: '문제 풀이·정답·오답노트는 무료이고, 상세 해설은 하루 20문제까지 무료예요. PRO는 한 번 결제하면 다음 시험일까지 쓰는 시험 이용권이고, 자동 결제는 없어요.',
    go: 'my', cta: '이용권 확인하러 가기',
    body: `<h2>무료와 PRO 비교</h2>
<table><tr><th>기능</th><th>무료</th><th>PRO</th></tr>
<tr><td>문제 풀이 867문항 · 정답 확인 · 채점</td><td>✓</td><td>✓</td></tr>
<tr><td>모든 보기 상세 해설 · 쉬운 말 풀이 · 10초 암기</td><td>하루 20문제</td><td>무제한</td></tr>
<tr><td>과목·단원별, 세트별 풀기, 문제은행 검색</td><td>✓</td><td>✓</td></tr>
<tr><td>오답노트 · 별표</td><td>✓</td><td>✓</td></tr>
<tr><td>실전 모의고사</td><td></td><td>✓</td></tr>
<tr><td>약점 집중 · 맞춤 학습</td><td></td><td>✓</td></tr>
<tr><td>OX 선지 퀴즈 · 잊을 때쯤 복습</td><td></td><td>✓</td></tr></table>
<h2>가격</h2>
<table><tr><th>상품</th><th>가격</th><th>기간</th></tr>
<tr><td>투자자산운용사 PRO</td><td>4,900원</td><td>다음 공식 시험일까지</td></tr>
<tr><td>요약노트 PDF</td><td>9,900원</td><td>계속</td></tr></table>
<p>시험이 7일 안 남았을 때 결제하면 그다음 시험일까지 열려요. PRO는 결제 후 7일 안에 쓰지 않았으면 전액, 썼으면 이용한 기간을 빼고 환불해요.</p>`
  },
  {
    slug: 'community', nav: '커뮤니티',
    title: '투자자산운용사 커뮤니티 · 합격 후기와 질문 · 더오를패스',
    desc: '투자자산운용사 합격 후기, 시험 후기, 공부 질문을 나누는 더오를패스 커뮤니티예요.',
    h1: '투자자산운용사 커뮤니티',
    lead: '같은 시험을 준비하는 사람들과 합격 후기, 시험 후기, 공부 질문을 나눠요.',
    go: 'comm', cta: '커뮤니티 들어가기',
    body: `<h2>게시판</h2>
<table><tr><th>게시판</th><th>이런 글을 써요</th></tr>
<tr><td>자유</td><td>공부 일상, 응원, 잡담</td></tr>
<tr><td>합격 후기</td><td>공부 기간, 공부법, 도움이 된 자료</td></tr>
<tr><td>시험 후기</td><td>시험 직후 체감 난이도, 많이 나온 단원</td></tr>
<tr><td>질문</td><td>이해가 안 되는 개념이나 문제 풀이</td></tr></table>
<p>글을 쓰려면 로그인이 필요해요. 틀린 문제나 바뀐 법령을 발견하면 문제 화면의 ⚠ 버튼으로 알려 주세요.</p>`
  }
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page(p) {
  const url = SITE + p.slug + '/';
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebPage', name: p.title, description: p.desc, url, inLanguage: 'ko',
    isPartOf: { '@type': 'WebSite', '@id': SITE + '#website', name: '더오를패스', url: SITE },
    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '더오를패스', item: SITE },
      { '@type': 'ListItem', position: 2, name: p.nav, item: url }] }
  };
  const nav = NAV.map(([h, t]) => `<a href="../${h}"${h === p.slug + '/' ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  const foot = FOOT.map(([h, t]) => `<a href="../${h}">${t}</a>`).join(' · ');
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="더오를패스">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}icon-512.png">
<link rel="icon" type="image/png" href="../icon-192.png">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="../css/page.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<!-- tools/make-pages.js가 만든 파일이에요. 직접 고치지 말고 그 파일을 고친 뒤 다시 실행하세요. -->
<main>
<header><a class="brand" href="../"><img src="../icon-192.png" alt="" width="28" height="28">더오를패스</a><nav>${nav}</nav></header>
<h1>${esc(p.h1)}</h1>
<p>${esc(p.lead)}</p>
<a class="cta" href="../?go=${p.go}">${esc(p.cta)}</a>
${p.body}
<a class="cta" href="../?go=${p.go}">${esc(p.cta)}</a>
<footer>${foot}</footer>
</main>
</body>
</html>
`;
}

for (const p of PAGES) {
  const dir = path.join(ROOT, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(p));
  console.log('만듦: ' + p.slug + '/index.html');
}

/* 사이트맵: 첫 화면 + 소개 + 시험 안내 + 위 페이지들 */
const urls = ['', 'about.html', 'guide.html', ...PAGES.map(p => p.slug + '/')];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log('사이트맵 갱신: ' + urls.length + '개 주소');
