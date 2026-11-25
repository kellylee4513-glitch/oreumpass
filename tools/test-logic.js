/* 올리기 전 점검 2: 돈과 기록에 닿는 핵심 계산 자동 검사
   사용: (저장소 폴더에서) NODE_PATH=$(npm root -g) node tools/test-logic.js
   실제 서버·결제는 건드리지 않아요. 서버 응답을 흉내 내서 앱의 계산만 확인해요.
   검사: 모의고사 과락, 기록 합치기(오프라인·삭제·초기화·두 기기), 환불 반영, 가짜 비회원 주문, 결제 복귀·재확인 */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((q, s) => { let f = decodeURIComponent(q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; const p = path.join(ROOT, f); if (!p.startsWith(ROOT) || !fs.existsSync(p)) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); });

const TESTS = {
  '모의고사: 한 과목을 비우면 과락이 떠요': () => {
    const subs = [...new Set(Q.map(q => q.s))]; const items = Q.map((q, id) => Object.assign({ id }, q)).filter(q => q.s === subs[0]).slice(0, 5).concat(Q.map((q, id) => Object.assign({ id }, q)).filter(q => q.s === subs[1]).slice(0, 5));
    const ans = {}; items.filter(q => q.s === subs[0]).forEach(q => ans[q.id] = q.a); /* 첫 과목만 다 맞히고 둘째 과목은 비움 */
    run = { mock: true, items, ans, i: 0, start: Date.now(), limit: 1e7, label: '테스트' }; submitMock(true);
    const weak = document.querySelectorAll('#app .weak').length, pill = /과락 과목이 있어요/.test(document.getElementById('app').innerText);
    return weak === 1 && pill ? true : `과락 표시 ${weak}개, 안내 문구 ${pill ? '있음' : '없음'}`;
  },
  '기록 합치기: 오프라인에서 쓴 메모·복습 단계가 서버 예전 값에 덮이지 않아요': () => {
    const z = blankCert(); z.memo = { 3: '예전' }; z.srs = { 3: { b: 1, d: '2026-11-01' } };
    const a = cleanCert(z); a.memo = { 3: '새 메모' }; a.srs = { 3: { b: 2, d: '2026-11-20' } };
    const o = mergeCert3(z, a, cleanCert(z));
    return o.memo[3] === '새 메모' && o.srs[3].b === 2 ? true : JSON.stringify({ memo: o.memo, srs: o.srs });
  },
  '기록 합치기: 오답노트에서 뺀 문제·별표가 되살아나지 않아요': () => {
    const z = blankCert(); z.wrong = [1, 2, 3]; z.star = [5];
    const a = cleanCert(z); a.wrong = [1, 3]; a.star = [];
    const b = cleanCert(z); b.wrong = [1, 2, 3, 9];
    const o = mergeCert3(z, a, b);
    return J(o.wrong.sort()) === J([1, 3, 9]) && o.star.length === 0 ? true : J({ wrong: o.wrong, star: o.star });
  },
  '기록 합치기: 기록 초기화가 다른 기기 기록으로 되돌아가지 않아요': () => {
    const z = blankCert(); z.wrong = [1, 2]; z.solved = 50; z.correct = 30; z.hist = [{ d: '2026-11-01', l: 'x', s: 3, t: 5, ms: 1 }];
    const a = blankCert(); const o = mergeCert3(z, a, cleanCert(z));
    return o.wrong.length === 0 && o.solved === 0 && o.hist.length === 0 ? true : J({ wrong: o.wrong, solved: o.solved, hist: o.hist.length });
  },
  '기록 합치기: 두 기기에서 따로 푼 문제 수가 더해져요': () => {
    const z = blankCert(); z.solved = 10; z.correct = 5; z.days = { '2026-11-20': 10 };
    const a = cleanCert(z); a.solved = 13; a.correct = 7; a.days = { '2026-11-20': 13 };
    const b = cleanCert(z); b.solved = 15; b.correct = 9; b.days = { '2026-11-20': 15 };
    const o = mergeCert3(z, a, b);
    return o.solved === 18 && o.correct === 11 && o.days['2026-11-20'] === 18 ? true : J({ solved: o.solved, correct: o.correct, days: o.days });
  },
  '기록 합치기: 풀이 기록이 두 번씩 쌓이지 않아요': () => {
    const h = [{ d: '2026-11-20', l: 'a', s: 3, t: 5, ms: 9 }]; const a = blankCert(); a.hist = h; const b = blankCert(); b.hist = h;
    const o1 = mergeCert(a, b), o3 = mergeCert3(cleanCert(a), a, b);
    return o1.hist.length === 1 && o3.hist.length === 1 ? true : `예전 방식 ${o1.hist.length}개, 새 방식 ${o3.hist.length}개`;
  },
  '환불: 환불된 PRO는 닫혀요 (회원)': async () => {
    const id = C.id; G.passCerts = [id]; G.passExp = { [id]: Date.now() + 30 * 864e5 };
    const orders = [{ id: 'o1', cert: id, item: 'pro', status: 'canceled', approved_at: '2026-11-20T00:00:00Z', created_at: '2026-11-20T00:00:00Z' }];
    AU.user = { id: 'u1' }; AU.sb = { from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: orders, error: null }) }) }) }) };
    localStorage.removeItem('op_guest_orders'); await syncPurchases(); const open = isPro(); AU.user = null; AU.sb = null;
    return !open ? true : 'PRO가 아직 열려 있어요';
  },
  '환불: 정상 결제가 남아 있으면 PRO는 유지돼요': async () => {
    const id = C.id; G.passCerts = []; G.passExp = {};
    const orders = [{ id: 'o2', cert: id, item: 'pro', status: 'paid', approved_at: new Date().toISOString(), created_at: new Date().toISOString() }, { id: 'o1', cert: id, item: 'pro', status: 'canceled', approved_at: '2026-11-01T00:00:00Z', created_at: '2026-11-01T00:00:00Z' }];
    AU.user = { id: 'u1' }; AU.sb = { from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: orders, error: null }) }) }) }) };
    localStorage.removeItem('op_guest_orders'); await syncPurchases(); const open = isPro(); AU.user = null; AU.sb = null;
    return open ? true : '정상 결제인데 PRO가 닫혔어요';
  },
  '가짜 비회원 주문: 서버에 없으면 PRO가 안 열려요': async () => {
    const id = C.id; G.passCerts = []; G.passExp = {};
    localStorage.setItem('op_guest_orders', JSON.stringify([{ id: 'fake', cert: id, item: 'pro', status: 'paid', approved_at: new Date().toISOString(), created_at: new Date().toISOString(), email: 'a@b.co', token: 'x', guest: true }]));
    window.authOn = () => true; window.payFn = async () => { const e = new Error('not_found'); throw e; };
    await syncPurchases(); return !isPro() ? true : '가짜 주문으로 PRO가 열렸어요';
  },
  '비회원 주문: 인터넷 문제로 확인 못 하면 정상 구매자는 잠기지 않아요': async () => {
    const id = C.id; G.passCerts = []; G.passExp = {};
    localStorage.setItem('op_guest_orders', JSON.stringify([{ id: 'real', cert: id, item: 'pro', status: 'paid', approved_at: new Date().toISOString(), created_at: new Date().toISOString(), email: 'a@b.co', token: 'x', guest: true }]));
    window.authOn = () => true; window.payFn = async () => { throw new Error('fn'); };
    await syncPurchases(); return isPro() ? true : '정상 구매자가 잠겼어요';
  },
  '로그아웃: 계정 PRO는 닫히고, 기록 지우기를 고르면 이 기기 기록이 비워져요': async () => {
    const id = C.id; G.passCerts = [id]; G.passExp = { [id]: Date.now() + 864e5 }; S.wrong = [1, 2]; save(true);
    localStorage.removeItem('op_guest_orders'); AU.user = { id: 'u1' }; AU.pending = false; AU.sb = { auth: { signOut: async () => {} } };
    await authLogout(); const closed = !isPro(), asked = !!document.querySelector('#sheet button[onclick="logoutWipe()"]');
    logoutWipe(); const wiped = !(G.data[id] && G.data[id].wrong.length); AU.sb = null;
    return closed && asked && wiped ? true : J({ closed, asked, wiped });
  },
  '결제 복귀: 결제를 시작한 주소로 돌아와요': () => payBase() === location.origin + location.pathname ? true : payBase(),
  '결제 확인 실패 → 다시 확인하기로 완료돼요': async () => {
    let n = 0; window.authInit = async () => {}; AU.user = { id: 'u1' }; window.syncPurchases = async () => {};
    window.payFn = async () => { n++; if (n === 1) throw new Error('fn'); return { ok: true, order: { item: 'pro', cert: C.id } }; };
    await payReturn({ paymentKey: 'pk', orderId: 'op1', amount: '4900' });
    const retry = !!document.querySelector('#sheet button[onclick="payRetry()"]'); payRetry(); await new Promise(r => setTimeout(r, 300));
    AU.user = null; return retry && n === 2 && sessionStorage.getItem('op_pay_retry') === null ? true : J({ retry, n });
  },
};

(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const URL = `http://127.0.0.1:${srv.address().port}/index.html`;
  const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].find(f => fs.existsSync(f));
  const b = await chromium.launch(exe ? { executablePath: exe } : {}); let fails = 0;
  for (const [name, fn] of Object.entries(TESTS)) {
    const c = await b.newContext({ serviceWorkers: 'block' }); const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL); await p.waitForTimeout(800); await p.evaluate(() => pickCert('tuunsa')); await p.waitForTimeout(300);
    let r; try { r = await p.evaluate(`(${fn.toString()})()`); } catch (e) { r = '오류: ' + e.message.split('\n')[0]; }
    if (r === true && errs.length) r = '화면 오류: ' + errs[0];
    console.log(`${r === true ? '✓' : '✗'} ${name}${r === true ? '' : ' → ' + r}`); if (r !== true) fails++;
    await c.close();
  }
  await b.close(); srv.close();
  console.log(fails ? `실패 ${fails}개` : '핵심 계산 모두 통과'); process.exit(fails ? 1 : 0);
})();
