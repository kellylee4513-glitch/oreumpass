/* ===== 새 자격증 추가 템플릿 =====
   1) 이 파일을 복사해서 certs/영문이름.js 로 저장 (예: certs/fund.js)
   2) 아래 내용을 채우기
   3) index.html의 "새 자격증은 여기에 한 줄 추가" 아래에 <script src="certs/fund.js"></script> 추가
   4) catalog.js의 "준비 중" 목록에 같은 id가 있으면 자동으로 "준비 중"에서 빠져요
*/
window.CERTS = window.CERTS || [];
CERTS.push({
  id: 'fund',                        // 영문 id (catalog.js와 같게)
  name: '펀드투자권유자문인력',          // 전체 이름
  short: '펀드',                      // 짧은 이름 (배지·탭에 표시, 2~4자)
  cat: '금융',                        // 분류: 금융 / 공통 / IT·데이터 ...
  color: '#7C5CFF',                  // 배지 색
  ready: true,
  info: { org: '주관 기관', count: 0, minutes: 0, format: '4지선다', eligibility: '응시자격' }, // 실제 시험 정보 (공고 확인 후 입력)
  pass: { total: 70, sub: 40 },      // 합격 기준: 전체 %, 과목별 과락 %
  subjects: {                        // 과목 (개수 자유)
    1: { short: '과목1 짧게', full: '과목1 전체 이름' },
    2: { short: '과목2 짧게', full: '과목2 전체 이름' }
  },
  price: 9900,                       // 이 자격증 PRO 가격
  pdf: '#',                          // 더오를 정리본 판매 링크
  questions: [
    // s: 과목 번호, q: 문제, o: 보기 4개, a: 정답 위치(0부터: 0=①, 1=②, 2=③, 3=④), e: 해설
    { s: 1, q: '문제 내용', o: ['보기1', '보기2', '보기3', '보기4'], a: 0, e: '해설' }
  ],
  ox: [
    // s: 과목 번호, t: 문장, a: 정답(true=O, false=X), e: 해설
    { s: 1, t: 'OX 문장', a: true, e: '해설' }
  ]
});
