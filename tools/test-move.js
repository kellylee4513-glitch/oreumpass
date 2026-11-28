/* 새 주소 이사(user/move.js) 점검 — 실제 두 주소를 이 폴더 파일로 흉내 내서 확인
   사용: (저장소 폴더에서) NODE_PATH=$(npm root -g) node tools/test-move.js
   - 스위치 켜짐(시험용으로만 강제): 옛 주소 기록·비회원 주문이 새 주소로 옮겨지는지
   - 새 주소에 기록이 있으면 고르기 화면, '옛 기록으로 바꾸기' 동작
   - 스위치 꺼짐: 옛 주소에서 아무 일 없음 / 결제 복귀 주소에서는 이사 안 함
   화면은 tools/shots/이사_*.png */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), OUT = path.join(__dirname, 'shots');
const OLD = 'https://kellylee4513-glitch.github.io/oreumpass/', NEW = 'https://theoreulpass.com/';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };
const fails = [], ok = m => console.log('✓ ' + m), bad = m => { fails.push(m); console.log('✗ ' + m); };
(async () => {
  const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find(f => fs.existsSync(f));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  async function ctx(moveOn) {
    const c = await browser.newContext({ viewport: { width: 393, height: 852 }, serviceWorkers: 'block' });
    await c.addInitScript(() => { window.__toasts = []; document.addEventListener('DOMContentLoaded', () => { const t = document.getElementById('toast'); if (t) new MutationObserver(() => window.__toasts.push(t.textContent)).observe(t, { childList: true, characterData: true, subtree: true }); }); });
    const serve = base => async route => {
      const u = new URL(route.request().url()); let p = decodeURIComponent(u.pathname.slice(new URL(base).pathname.length)) || 'index.html';
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(R, p); if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: '' });
      let body = fs.readFileSync(f);
      if (p === 'js/core/config.js') body = Buffer.from(body.toString().replace(/moveOn: (true|false)/, 'moveOn: ' + moveOn).replace(/sbUrl: '[^']*'/, "sbUrl: ''"));
      route.fulfill({ status: 200, body, contentType: TYPES[path.extname(f)] || 'application/octet-stream' });
    };
    await c.route(OLD + '**', serve(OLD)); await c.route(NEW + '**', serve(NEW));
    await c.route(/^https:\/\/(?!theoreulpass\.com|kellylee4513-glitch\.github\.io)/, r => r.abort());
    return c;
  }
  const seed = ([g, orders]) => { if (typeof C !== 'undefined' && C && C.bankVer) Object.values(g.data).forEach(d => d.bv = C.bankVer); localStorage.setItem('oreumpass_v3', JSON.stringify(g)); if (orders) localStorage.setItem('op_guest_orders', JSON.stringify(orders)); };
  const mkG = (solved, wrong) => ({ cur: 'tuunsa', name: '', data: { tuunsa: { wrong, star: [3], seen: wrong, solved, correct: Math.floor(solved / 2), subj: {}, days: { '2026-11-20': solved }, hist: [], goal: 10, exam: '2027-01-17', memo: { 5: '메모 테스트' } } } });
  const errs = p => { const e = []; p.on('pageerror', x => e.push(x.message)); return e; };

  /* 1) 켜짐: 옛 주소 기록 → 새 주소(빈 상태) */
  { const c = await ctx(true), p = await c.newPage(), e = errs(p);
    await p.goto(OLD + 'index.html'); await p.evaluate(seed, [mkG(820, [1, 2, 7, 9]), [{ id: 'op_test_order_1', cert: 'tuunsa', item: 'note', status: 'paid', email: 'a@b.co', token: 't', created_at: '2026-11-20T00:00:00Z', approved_at: '2026-11-20T00:00:00Z' }]]);
    await p.goto(OLD + 'index.html'); await p.waitForSelector('.mvs.on', { timeout: 5000 }).then(() => ok('옛 주소: 이사 화면이 떠요')).catch(() => bad('옛 주소: 이사 화면이 안 떠요'));
    await p.screenshot({ path: path.join(OUT, '이사_1_옛주소.png') });
    await p.waitForURL(u => u.href.startsWith(NEW), { timeout: 8000 }).then(() => ok('2초 뒤 새 주소로 이동해요')).catch(() => bad('새 주소로 이동 안 함: ' + p.url()));
    await p.waitForTimeout(1500);
    const st = await p.evaluate(() => ({ toasts: window.__toasts || [], g: JSON.parse(localStorage.getItem('oreumpass_v3') || '{}'), o: JSON.parse(localStorage.getItem('op_guest_orders') || '[]'), hash: location.hash, toast: document.getElementById('toast').textContent }));
    const d = (st.g.data || {}).tuunsa || {};
    d.solved === 820 && (d.wrong || []).length === 4 && (d.memo || {})[5] === '메모 테스트' && d.exam === '2027-01-17' ? ok('새 주소: 풀이 820·오답 4·메모·시험일이 그대로 옮겨졌어요') : bad('새 주소 기록이 다름: ' + JSON.stringify(d).slice(0, 200));
    st.o.some(o => o.id === 'op_test_order_1') ? ok('새 주소: 비회원 주문도 옮겨졌어요') : bad('비회원 주문이 안 옮겨짐');
    !st.hash ? ok('새 주소 주소창에서 기록 코드가 지워졌어요') : bad('주소창에 기록 코드가 남음');
    /그대로 가져왔어요/.test(st.toasts.join('|')) ? ok('"옮겨 왔어요" 알림이 떠요') : bad('알림 없음: ' + st.toasts.join('|'));
    await p.screenshot({ path: path.join(OUT, '이사_2_새주소도착.png') });
    e.length ? bad('스크립트 오류: ' + e.join(' / ')) : ok('스크립트 오류 없음');
    await c.close(); }

  /* 2) 켜짐: 새 주소에도 기록이 있으면 고르기 */
  { const c = await ctx(true), p = await c.newPage(), e = errs(p);
    await p.goto(NEW + 'index.html'); await p.evaluate(seed, [mkG(15, [4])]);
    await p.goto(OLD + 'index.html'); await p.evaluate(seed, [mkG(820, [1, 2, 7, 9])]);
    await p.goto(OLD + 'index.html'); await p.waitForURL(u => u.href.startsWith(NEW), { timeout: 8000 }).catch(() => {});
    await p.waitForSelector('.sheet.show .mvc', { timeout: 5000 }).then(() => ok('새 주소에 기록이 있으면 고르기 화면이 떠요')).catch(() => bad('고르기 화면이 안 떠요'));
    await p.waitForTimeout(400); await p.screenshot({ path: path.join(OUT, '이사_3_고르기.png') });
    const txt = await p.textContent('.sheet'); /820/.test(txt) && /15/.test(txt) ? ok('두 기록의 풀이 수(820 / 15)가 보여요') : bad('숫자가 이상함: ' + txt);
    await p.click('text=이전 주소 기록 쓰기'); await p.waitForTimeout(500);
    const s = await p.evaluate(() => JSON.parse(localStorage.getItem('oreumpass_v3')).data.tuunsa.solved);
    s === 820 ? ok('"옛 주소 기록으로 바꾸기"를 누르면 820 기록으로 바뀌어요') : bad('바꾸기 후 기록: ' + s);
    e.length ? bad('스크립트 오류: ' + e.join(' / ')) : ok('스크립트 오류 없음');
    await c.close(); }

  /* 3) 켜짐: "지금 기록 유지" */
  { const c = await ctx(true), p = await c.newPage();
    await p.goto(NEW + 'index.html'); await p.evaluate(seed, [mkG(15, [4])]);
    await p.goto(OLD + 'index.html'); await p.evaluate(seed, [mkG(820, [1])]);
    await p.goto(OLD + 'index.html'); await p.waitForURL(u => u.href.startsWith(NEW), { timeout: 8000 }).catch(() => {});
    await p.waitForSelector('.sheet.show .mvc', { timeout: 5000 }).catch(() => {}); await p.click('text=새 주소 기록 쓰기'); await p.waitForTimeout(400);
    const s = await p.evaluate(() => JSON.parse(localStorage.getItem('oreumpass_v3')).data.tuunsa.solved);
    s === 15 ? ok('"지금 기록 유지"를 누르면 새 주소 기록 그대로예요') : bad('유지 후 기록: ' + s);
    await c.close(); }

  /* 4) 꺼짐 / 결제 복귀 */
  { const c = await ctx(false), p = await c.newPage();
    await p.goto(OLD + 'index.html'); await p.waitForTimeout(3000);
    (await p.$('.mvs')) || !p.url().startsWith(OLD) ? bad('스위치가 꺼져 있는데 이사 화면/이동이 생김') : ok('스위치 꺼짐: 옛 주소는 지금과 똑같아요');
    await c.close(); }
  { const c = await ctx(true), p = await c.newPage();
    await p.goto(OLD + 'index.html?pay=fail&c=tuunsa'); await p.waitForTimeout(3000);
    (await p.$('.mvs')) ? bad('결제 복귀 주소에서 이사가 시작됨') : ok('결제하고 돌아온 순간에는 이사하지 않아요');
    await c.close(); }

  /* 5) 작은 화면에서 이사 화면 넘침 확인 */
  for (const [n, w, h] of [['폴드접힘', 344, 882], ['아이폰SE', 375, 667], ['PC', 1440, 900]]) {
    const c = await ctx(true), p = await c.newPage(); await p.setViewportSize({ width: w, height: h });
    await p.route(NEW + '**', r => r.abort()); /* 이동 막고 화면만 보기 */
    await p.goto(OLD + 'index.html'); await p.waitForSelector('.mvs.on', { timeout: 5000 }).catch(() => {});
    const over = await p.evaluate(() => { const el = document.querySelector('.mvs-in'); const btn = document.querySelector('.mvs .btn').getBoundingClientRect(); return { x: el.scrollWidth > el.clientWidth + 1, btn: btn.bottom <= innerHeight + 1 }; });
    await p.screenshot({ path: path.join(OUT, '이사_' + n + '.png') });
    !over.x && over.btn ? ok(n + ': 이사 화면 넘침 없음, 버튼 보임') : bad(n + ': 넘침/버튼 가림 ' + JSON.stringify(over));
    await c.close();
  }
  await browser.close();
  console.log(fails.length ? '\n실패 ' + fails.length + '개' : '\n이사 기능 모두 통과'); process.exit(fails.length ? 1 : 0);
})();
