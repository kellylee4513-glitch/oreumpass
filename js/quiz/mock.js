/* [quiz/mock.js] 문제 풀이: 실전 모의고사(타이머·OMR) */
/* ===== 실전 모의고사 ===== */
/* 실전과 같은 구성: 과목별 문항 수(dist)를 맞추고, 과목 안에서는 단원 비중대로 뽑기 */
function mockSet() {
  const all = pool(0), total = C.info.count || 100; if (all.length <= total) return shuffle(all);
  const dist = C.dist || Object.fromEntries(SK.map(s => [s, Math.round(total / SK.length)])), out = [];
  SK.forEach(s => {
    const qs = all.filter(q => q.s == s), need = Math.min(dist[s] || 0, qs.length); if (!need) return;
    const by = {}; qs.forEach(q => (by[q.sec || ''] = by[q.sec || ''] || []).push(q));
    const keys = Object.keys(by), raw = keys.map(k => by[k].length * need / qs.length), n = raw.map(Math.floor);
    let left = need - n.reduce((a, b) => a + b, 0);
    keys.map((k, i) => [raw[i] - n[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { n[i]++; left--; } });
    keys.forEach((k, i) => out.push(...shuffle(by[k]).slice(0, n[i])));
  });
  return out;
}
function startMock() { closeSheet(); const items = mockSet(); const mins = items.length >= C.info.count ? C.info.minutes : Math.max(5, Math.round(C.info.minutes / C.info.count * items.length));
  run = { mock: true, items, i: 0, ans: {}, start: Date.now(), limit: mins * 60000, label: '실전 모의고사' }; stopTimer();
  timer = setInterval(() => { if (!run || !run.mock) return; const left = run.limit - (Date.now() - run.start); const el = document.getElementById('tr'); if (el) { el.textContent = '남은 시간 ' + fmt(left); el.style.color = left < 300000 ? 'var(--red)' : ''; } if (left <= 0) { toast('시간이 끝나 자동 제출했어요'); submitMock(true); } }, 1000); drawMock(); }
function drawMock() { markNav(); const r = run, q = r.items[r.i], a = r.ans[q.id]; window.scrollTo(0, 0); const n = Object.keys(r.ans).length;
  $app.innerHTML = topBar('실전 모의고사', '남은 시간 ' + fmt(r.limit - (Date.now() - r.start)), 'quitQuiz()') + `<div class="pad">
    <div class="prog"><i style="width:${n / r.items.length * 100}%"></i></div>
    <div class="qmeta"><span>${SUBJ[q.s]}</span><span style="background:var(--bg);color:var(--sub)">${r.i + 1} / ${r.items.length}</span>${starBtn(q.id)}</div>
    <div class="qtext">${esc(q.q)}</div>
    ${q.o.map((o, k) => `<button class="opt ${a === k ? 'sel' : ''}" onclick="mockPick(${k})"><span class="num">${k + 1}</span><span>${esc(o)}</span></button>`).join('')}
    <div class="lbl" style="margin-top:20px">답안 표기 · ${n}/${r.items.length}</div>
    <div class="omr">${r.items.map((x, i) => `<button class="${r.ans[x.id] !== undefined ? 'ans' : ''} ${i === r.i ? 'cur' : ''}" onclick="run.i=${i};drawMock()">${i + 1}</button>`).join('')}</div>
  </div>`;
  bottom(`<button class="btn ghost sm" ${r.i === 0 ? 'disabled' : ''} onclick="run.i--;drawMock()">이전</button>` + (r.i + 1 < r.items.length ? `<button class="btn ghost" onclick="run.i++;drawMock()">다음</button>` : '') + `<button class="btn" onclick="submitMock()">제출하기</button>`); }
let submitArm = false;
function submitMock(force) { const r = run, n = Object.keys(r.ans).length;
  if (!force && n < r.items.length && !submitArm) { submitArm = true; toast(`안 푼 문제가 ${r.items.length - n}개 있어요. 한 번 더 누르면 제출`); setTimeout(() => submitArm = false, 2500); return; } submitArm = false;
  { const na = Object.keys(r.ans).length; if (na) { S.spd = S.spd || { n: 0, ms: 0 }; S.spd.n += na; S.spd.ms += Math.min(Date.now() - r.start, na * 300000); } }
  r.score = 0; r.wrongIds = []; r.items.forEach(q => { const a = r.ans[q.id], ok = a === q.a; if (a !== undefined) record(q.s, ok, q.id); if (ok) r.score++; else if (a !== undefined) { r.wrongIds.push(q.id); if (!S.wrong.includes(q.id)) S.wrong.push(q.id); } }); save(); result(); }
function mockPick(k) { const r = run; if (!r || !r.mock) return; const i = r.i, q = r.items[i]; r.ans[q.id] = k; drawMock(); clearTimeout(r.adv); r.adv = setTimeout(() => { if (run === r && r.i === i && i + 1 < r.items.length) { r.i++; drawMock(); } }, 180); }

