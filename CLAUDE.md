
## 사이트에 올리기 전 필수 점검 (운영자 요청, 2026-11-25)
- 화면을 바꿨으면 올리기(push) 전에 반드시 `tools/check-devices.js`로 기기별 점검을 돌린다.
  - 폴드(접힘)·아이폰SE·갤럭시S·아이폰15·프로맥스·아이패드·노트북·PC 8가지 크기
  - 가로 넘침, 글자 잘림, 스크립트 오류, 탭 이동을 확인하고 `tools/shots/`의 화면을 직접 본다
- "모든 기기 통과"가 나오지 않으면 올리지 않는다. 결과는 운영자에게 기기별로 알린다.
- sw.js의 CACHE 버전을 올려서 이미 열어 둔 사람에게도 새 화면이 가게 한다.

## 문제 데이터 규칙 (중요, 2026-11-25)
- 문제 번호 = certs/*.js 안의 **순서**예요. 오답·별표·메모·복습 기록이 이 번호로 저장돼요.
- 새 문제는 **맨 뒤에만 추가**한다. 중간에 넣거나 빼거나 순서를 바꾸면 모든 사용자의 오답노트가 엉뚱한 문제를 가리켜요.
- 틀린 문제를 고칠 때는 그 자리에서 내용만 고친다(삭제 대신 고치기).
- `bankVer`를 바꾸면 모든 사용자의 오답·별표 기록이 초기화돼요. 운영자 확인 없이 바꾸지 않는다.
- (1월 시험 이후 계획) 문제마다 바뀌지 않는 고유 번호를 붙여 이 제약을 없앤다.

## 올리기 전 자동 점검
- `node tools/check-release.js` : index.html·sw.js 파일 목록 일치, CACHE 버전 올림 확인
- `node tools/test-logic.js` : 채점·과락, 기록 합치기, 환불 반영 같은 핵심 계산 확인
- 둘 다 통과하고 `tools/check-devices.js`도 "모든 기기 통과"여야 올린다.

## 결제 서버
- 결제 서버 함수 원본은 `backend/functions/pay/index.ts`. 고치면 Supabase에 다시 배포해야 반영돼요(운영자 확인 후).
- DB 구조는 `backend/schema.sql`(실제 DB와 맞춰 둠). DB를 바꾸는 파일은 `backend/migrations/`에 날짜별로.

## 결제 서버와 앱을 함께 바꿀 때 올리는 순서
- 앱의 결제 요청은 서울 서버로 고정(x-region 표시)돼 있어요. 결제 서버의 CORS 허용 목록에 x-region이 있어야 해요.
- **결제 서버(backend/functions/pay)를 먼저 배포하고, 그다음 앱을 올린다.** 반대로 하면 결제창이 안 열려요.

## 새 주소 theoreulpass.com 같이 올리기 (2026-11-26~)
- 옛 주소 https://kellylee4513-glitch.github.io/oreumpass/ = 이 저장소 main (GitHub Pages, 브랜치 배포)
- 새 주소 https://theoreulpass.com = 별도 저장소 `kellylee4513-glitch/theoreulpass-site` 가 이 저장소 main을 **가져와서** 배포(GitHub Actions). 코드 사본은 거기 없음.
- **이 저장소에는 절대 CNAME 파일을 넣지 않는다.** 넣으면 옛 주소가 새 주소로 넘어가 버려요 (공식 이전 전까지 금지).
- main을 push한 직후 반드시 `bash tools/sync-site.sh` 실행 → 1~2분 뒤 https://theoreulpass.com/deployed.txt 가 방금 커밋 번호인지 확인.
  - 잊어도 theoreulpass-site 의 Action이 매시간 확인해서 따라잡아요(최대 1시간 늦음).
- 새 주소 사이트의 canonical·sitemap·og:url 은 공식 이전 전까지 옛 주소 그대로 둔다(같은 문서가 두 주소에 있어 검색엔진이 중복으로 보지 않게). 바꾸는 작업은 `domain-move` 브랜치.
- 결제는 시작한 주소로 돌아오고(pay.js payBase), 결제 서버 CORS는 `*` 라서 두 주소 모두 결제돼요. 로그인 안 한 사용자의 기록(localStorage)은 주소별이라 서로 안 보여요.

## 새 주소 이사 스위치 (js/user/move.js, 2026-11-26)
- `js/core/config.js`의 `moveOn: true`로 바꾸면 옛 주소(github.io)로 들어온 사람에게 이사 화면을 2초 보여 주고, 이 기기 기록(G)과 비회원 주문을 `#mv=`(압축)에 담아 새 주소로 보낸다.
- 새 주소는 받은 기록을 cleanG로 정리한 뒤 적용. 새 주소에 이미 기록이 있으면 고르기 시트. 이용권(passAll/passCerts/passExp)은 옮기지 않고 서버·주문으로 다시 계산.
- 결제 복귀(?pay=)나 비회원 결제 대기 중에는 이사하지 않는다.
- 켜기 전 확인: 새 주소 로그인·4,900원 결제·환불 시험 완료. 점검: `NODE_PATH=$(npm root -g) node tools/test-move.js`
- 켠 뒤에도 CNAME은 넣지 않는다(서버 이동은 기록이 안 옮겨져요). CNAME/canonical 변경은 2월 계획.
