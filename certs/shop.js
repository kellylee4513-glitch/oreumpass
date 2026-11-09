/* 더오를 요약노트 PDF 상품 목록
   - url: 결제 페이지 주소(https://…). 비워 두면 '판매 준비 중'으로 보여요.
   - price/list: 판매가/정가(원). previews: 미리보기 이미지 경로(예: 'img/tuunsa-p1.png').
   - soon: true 이면 목록에 '준비 중' 카드로만 보여요. */
window.SHOP_CATS = [
  { id: 'fin', name: '금융 자격증', dot: '#E3B341' },
  { id: 'job', name: '취업 공통 스펙', dot: '#3182F6' }
];
window.SHOP = [
  { id: 'tuunsa', cert: 'tuunsa', cat: 'fin', short: '투자자산운용사', cv: '투자자산|운용사', title: '투자자산운용사 요약노트 PDF', tint: '#1B64DA',
    url: '', price: 9900, list: 12900, featured: true,
    tags: ['50쪽 합격 세트', '확인문제 70', '빈칸 학습지'],
    points: ['16개 편 전 범위 핵심 정리본 + 보강 노트', '헷갈리는 개념 비교표 · 편별 확인문제 70', '빈칸 학습지로 외우고 정리본으로 바로 채점'],
    sub: '정리본에 보강 노트, 비교표, 확인문제, 빈칸 학습지까지 한 권에 담은 50쪽 PDF예요.',
    items: [
      ['핵심 정리본 12쪽', '세제·금융상품·부동산부터 법규·운용·거시·분산까지, 16개 편 시험 범위를 표 중심으로 압축했어요.'],
      ['보강 노트 14쪽', '정리본에 없던 출제 논점 140여 개를 주제마다 "한 줄 이해"와 "시험엔 이렇게"로 정리했어요.'],
      ['헷갈리는 짝 비교표', '시험이 섞어 내는 개념 24쌍을 표로 나란히 놓고 외우는 법까지 붙였어요.'],
      ['편별 확인문제 70', '편마다 꼭 나오는 논점을 고른 문제와 정답·해설이에요. 읽고 바로 확인해요.'],
      ['빈칸 학습지 12쪽', '정리본과 배치가 똑같아서, 정답은 정리본의 같은 쪽 같은 자리에 있어요.'],
      ['부록', '2026년 달라진 것, 시험장 숫자 총정리, 핵심 공식 모음']
    ],
    sample: 'files/tuunsa_sample.pdf', previews: ['img/tuunsa-pv1.jpg', 'img/tuunsa-pv2.jpg', 'img/tuunsa-pv3.jpg', 'img/tuunsa-pv4.jpg', 'img/tuunsa-pv5.jpg', 'img/tuunsa-pv6.jpg', 'img/tuunsa-pv7.jpg'] },
  { id: 'history', cat: 'job', short: '한국사능력검정', cv: '한국사|능력검정', title: '한능검 요약노트 PDF', tint: '#B5762E', soon: true },
  { id: 'comp', cat: 'job', short: '컴퓨터활용능력', cv: '컴퓨터|활용능력', title: '컴활 필기 요약노트 PDF', tint: '#16B871', soon: true }
];
