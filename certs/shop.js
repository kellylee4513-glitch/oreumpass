/* 더오를 요약노트 PDF 상품 목록
   - url: 결제 페이지 주소(https://…). 비워 두면 '판매 준비 중'으로 보여요.
   - price/list: 판매가/정가(원). previews: 미리보기 이미지 경로(예: 'img/tuunsa-p1.png').
   - soon: true 이면 목록에 '준비 중' 카드로만 보여요. */
window.SHOP_CATS = [
  { id: 'fin', name: '금융 자격증', dot: '#E3B341' },
  { id: 'job', name: '취업 공통 스펙', dot: '#3182F6' }
];
window.SHOP = [
  { id: 'tuunsa', cert: 'tuunsa', cat: 'fin', short: '투자자산운용사', title: '투자자산운용사 요약노트 PDF', tint: '#1B64DA',
    url: '', price: 0, list: 0,
    sub: '3과목 전 범위를 표와 도식으로 압축하고, 빈출 포인트를 빈칸으로 다시 외우는 PDF 세트예요.',
    items: [
      ['핵심 정리본 12쪽', '1과목 세제·금융상품·부동산부터 3과목 법규·운용·거시·분산까지, 시험 범위를 표 중심으로 압축했어요.'],
      ['빈칸 학습지 12쪽', '빈출 포인트 약 145곳을 빈칸으로 바꿨어요. 세율·기한·공식처럼 헷갈리는 숫자를 손으로 채우며 외워요.'],
      ['정답지', '정리본 원본과 빈칸 위치가 같아서 나란히 놓고 바로 채점할 수 있어요.']
    ],
    previews: [] },
  { id: 'fund', cat: 'fin', short: '펀드투자권유대행인', cv: '펀드권유대행', title: '펀드투자권유대행인 요약노트 PDF', tint: '#0E9F6E', soon: true },
  { id: 'sec', cat: 'fin', short: '증권투자권유대행인', cv: '증권권유대행', title: '증권투자권유대행인 요약노트 PDF', tint: '#7A5AF8', soon: true },
  { id: 'afpk', cat: 'fin', short: 'AFPK', title: 'AFPK 요약노트 PDF', tint: '#D9480F', soon: true },
  { id: 'history', cat: 'job', short: '한국사능력검정', cv: '한국사능력', title: '한능검 요약노트 PDF', tint: '#B5762E', soon: true },
  { id: 'comp', cat: 'job', short: '컴퓨터활용능력', cv: '컴퓨터활용', title: '컴활 필기 요약노트 PDF', tint: '#16B871', soon: true }
];
