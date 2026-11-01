# 더오를패스 · 자격증 CBT

더오를이 만든 자격증 문제 풀이 웹앱이에요. 핸드폰에서 열고 "홈 화면에 추가"하면 앱처럼 쓸 수 있어요.

## 폴더 구조

```
index.html        화면 뼈대 + 파일 불러오는 순서
css/app.css       디자인(색·글꼴·레이아웃, 핸드폰/PC 반응형)
certs/            자격증 데이터 (자격증 하나 = 파일 하나, 형식은 certs/_template.js)
js/
  core/     공통 기반 — 상태 저장, 화면 이동, 시트, 뒤로가기, 아이콘
  quiz/     문제 풀이 — 연습·시험·오픈북 모드, 모의고사, 결과, OX, 펜, 하이라이트
  stats/    통계 — 기록 탭, 합격 예측, 오답 원인, 자주 틀린 문제
  review/   오답 관리 — 복습노트, 간격 반복, 오늘의 플랜, 개념 카드, 요약 노트
  screens/  화면 — 첫 화면, 홈, 단원별, 세트별, 문제은행, 이용 안내
  user/     사용자 관리 — 내 정보, 기록 옮기기, 홈 화면 추가, 결제
  engage/   몰입 요소 — 5분 퀴즈, 배지, 복습 알림, 애니메이션
  boot.js     앱 시작
sw.js             앱 저장(오프라인) 목록
```

## 파일별 역할

| 파일 | 하는 일 |
|---|---|
| `js/core/icons.js` | 아이콘·그림, 로고 |
| `js/core/state.js` | 상태·저장소: 자격증 레지스트리, 현재 자격증 값, 전역 상태(G/S), localStorage |
| `js/core/ui.js` | 공통 UI 유틸: 날짜·토스트·셔플·기록(record)·탭바·상단바·화면 이동(go) |
| `js/screens/picker.js` | 첫 화면: 자격증 선택 |
| `js/screens/home.js` | 홈 화면 · 합격 예측 카드 · 오늘의 OX |
| `js/quiz/practice.js` | 문제 풀이: 진입(빠른·약점·과목) · 연습 화면(문제+해설) · 채점 · 번호판 · 제보 |
| `js/quiz/mock.js` | 문제 풀이: 실전 모의고사(타이머·OMR) |
| `js/quiz/result.js` | 문제 풀이: 결과 화면 |
| `js/quiz/ox.js` | 문제 풀이: OX 선지 퀴즈 |
| `js/stats/study.js` | 통계: 기록 탭 |
| `js/review/wrongnote.js` | 오답 관리: 복습노트(오답·OX 오답·북마크) |
| `js/user/my.js` | 사용자: 내 정보 탭 · 기록 초기화 |
| `js/quiz/modes.js` | 문제 풀이: 해설·시험·오픈북 모드 선택 |
| `js/screens/units.js` | 과목·단원별 풀기 |
| `js/screens/sets.js` | 세트별 실전 문제 |
| `js/screens/bank.js` | 문제은행 검색 |
| `js/quiz/pen.js` | 문제 풀이: 펜 필기 |
| `js/stats/topwrong.js` | 통계: 내가 자주 틀린 문제 TOP 10 |
| `js/screens/faq.js` | 이용 안내 · 정책 링크 |
| `js/user/sync.js` | 사용자: 기기 간 기록 옮기기(기록 코드) |
| `js/core/nav.js` | 뒤로가기(안드로이드 버튼·아이폰 스와이프) |
| `js/review/srs-plan.js` | 오답 관리: 간격 반복(SRS) · 오늘의 학습 플랜 |
| `js/stats/why.js` | 통계: 오답 원인 태그와 분석 |
| `js/review/cards.js` | 오답 관리: 1분 개념 카드 |
| `js/stats/predict.js` | 통계: 풀이 속도·단원 통계 · 합격 확률 · 맞춤 문제집 · 리포트 |
| `js/quiz/highlight.js` | 해설 키워드 하이라이트 |
| `js/review/notes.js` | 단권화 요약 노트 |
| `js/engage/gamify.js` | 게이미피케이션: 5분 퀴즈 · 배지 · 복습 알림 · 애니메이션 |
| `js/core/sheet.js` | 바텀 시트 · 시험일·목표·이름 설정 |
| `js/user/install.js` | 홈 화면에 추가(아이폰·안드로이드 안내) |
| `js/user/pay.js` | 결제(PRO · ALL 패스) — 지금은 시제품 |
| `js/boot.js` | 앱 시작 · 서비스 워커 등록 |

## 규칙

1. **불러오는 순서가 중요해요.** `index.html` 아래쪽의 `<script>` 순서대로 읽혀요. 새 파일은 쓰는 곳보다 위에, `boot.js`보다 위에 넣어요.
2. **기능 하나 = 파일 하나.** 고칠 때는 해당 기능 파일만 열어요. 예: 합격 확률 계산은 `js/stats/predict.js`만 고치면 돼요.
3. **새 파일을 만들면** `index.html`의 `<script>` 목록과 `sw.js`의 `FILES` 목록 두 곳에 추가하고, `sw.js`의 `CACHE` 버전 숫자를 올려요.
4. **저장 데이터는 `js/core/state.js`에서만 정의해요.** 전체 공통은 `G`, 자격증별은 `S`예요. 나중에 Supabase로 옮길 때 이 파일과 `js/user/sync.js`가 출발점이에요.
5. **새 자격증**은 `certs/`에 파일을 만들고 `index.html`에 한 줄 추가하면 돼요.
