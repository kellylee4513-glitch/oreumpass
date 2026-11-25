/* 더오를패스 기기별 화면 점검 — 사이트에 올리기 전에 반드시 실행
   사용: (저장소 폴더에서) python3 -m http.server 8765 & 띄운 뒤
         NODE_PATH=$(npm root -g) node tools/check-devices.js [주소]
   기본 주소: http://localhost:8765/index.html
   기기: 폴드(접힘) 344 · 아이폰SE 375 · 갤럭시S 360 · 아이폰15 393 · 프로맥스 430 · 아이패드 768 · 노트북 1366 · PC 1440
   검사: 가로 넘침, 글자 잘림, 스크립트 오류, 탭 이동(홈·문제·복습·기록·내 정보), 홈 요약노트 카드가 로그인 안내 바로 아래인지
   결과: 문제가 있으면 끝에 "실패"와 이유를 적고 종료 코드 1. 화면은 tools/shots/ 에 저장 */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const URL = process.argv[2] || 'http://localhost:8765/index.html';
const DEV = [['폴드접힘', 344, 882], ['아이폰SE', 375, 667], ['갤럭시S', 360, 780], ['아이폰15', 393, 852], ['프로맥스', 430, 932], ['아이패드', 768, 1024], ['노트북', 1366, 768], ['PC', 1440, 900]];
const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  /* 리눅스 크롬 → 윈도우 엣지·크롬 순서로, 이미 설치된 브라우저가 있으면 그걸 써요 */
  const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].find(f => fs.existsSync(f));
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const fails = [];
  for (const [n, w, h] of DEV) {
    const mob = w < 900;
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mob, hasTouch: mob, serviceWorkers: 'block' });
    const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL + (URL.includes('?') ? '&' : '?') + 'v=' + Date.now()); await p.waitForTimeout(2500);
    await p.evaluate(() => pickCert('tuunsa')); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const W = document.documentElement.clientWidth, bad = [];
      document.querySelectorAll('#app *').forEach(e => { const q = e.getBoundingClientRect(); if (q.width && q.right > W + 1 && getComputedStyle(e).position !== 'fixed') bad.push('넘침:' + (e.className || e.tagName)); });
      document.querySelectorAll('.hm-tt,.hm-pt,.hm-chip,.hm-all,.hm-tile b,.hm-sj,.hm-nn,.hm-nb').forEach(e => { if (e.scrollWidth > e.clientWidth + 1) bad.push('잘림:' + e.className); });
      const nu = document.querySelector('.hm-nudge'), nw = document.querySelector('.hm-nw');
      if (nu && nw && nu.nextElementSibling !== nw) bad.push('요약노트 카드가 로그인 안내 아래가 아님');
      if (!document.querySelector('.hm-today')) bad.push('새 홈이 안 보임');
      return { sw: document.documentElement.scrollWidth > W, bad: [...new Set(bad)].slice(0, 8) };
    });
    await p.screenshot({ path: path.join(OUT, n + '_홈.png') });
    const nav = await p.evaluate(() => { const r = []; for (const t of ['play', 'note', 'study', 'my', 'home']) { try { go(t); } catch (e) { r.push(t + ':' + e.message); } } return r; });
    const why = [...(r.sw ? ['가로 스크롤 생김'] : []), ...r.bad, ...nav, ...errs.map(e => '오류:' + e)];
    console.log(`${why.length ? '✗' : '✓'} ${n} ${w}x${h}${why.length ? ' → ' + why.join(' / ') : ''}`);
    if (why.length) fails.push(n);
    await c.close();
  }
  await b.close();
  console.log(fails.length ? `실패: ${fails.join(', ')}` : '모든 기기 통과');
  process.exit(fails.length ? 1 : 0);
})();
