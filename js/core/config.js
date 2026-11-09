/* [core/config.js] 서버 연결 설정
   Supabase 프로젝트 주소와 공개(publishable) 키만 넣어요. service_role·secret 키는 절대 넣지 마세요.
   비어 있으면 로그인·커뮤니티는 '준비 중'으로 보이고, 나머지 기능은 지금처럼 기기 저장으로 동작해요. */
window.OP_CFG = {
  sbUrl: 'https://bqnqbdntwgjdxbsdfzls.supabase.co',
  sbKey: 'sb_publishable_iSRIY5V5EFvDtFs-U7Q5sw_njb7Qcxn',
  webUrl: 'https://kellylee4513-glitch.github.io/oreumpass/',
  sbLib: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.9/dist/umd/supabase.js',
  kakaoChannel: 'https://pf.kakao.com/_ByRxeX',
  /* 토스페이먼츠 클라이언트 키(공개용). 결제위젯 연동 키. 테스트: test_gck_… / 실결제: live_gck_… — 시크릿 키는 절대 여기에 넣지 않아요 */
  tossClientKey: 'live_gck_QbgMGZzorzneqR2Y5l7jrl5E1em4'
};
