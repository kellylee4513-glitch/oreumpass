/* [quiz/ox.js] 문제 풀이: OX 선지 퀴즈 */
/* ===== OX ===== */
function startOx(s, list) { closeSheet(); const items = shuffle(list || OX.map((x, i) => Object.assign({ id: i }, x)).filter(x => !s || x.s === s)); if (!items.length) { toast('OX 문제가 아직 없어요'); return; } run = { ox: true, items, i: 0, ans: null, score: 0, retry: !!list }; drawOx(); }
function drawOx() { markNav(); const r = run, x = r.items[r.i]; window.scrollTo(0, 0); const answered = r.ans !== null, ok = answered && r.ans === x.a;
  $app.innerHTML = topBar('OX 선지 퀴즈', `${r.i + 1} / ${r.items.length}`) + `<div class="pad"><div class="prog"><i style="width:${(r.i + (answered ? 1 : 0)) / r.items.length * 100}%"></i></div>
    <div class="oxcard"><div class="s">${SUBJ[x.s]}</div>${esc(x.t)}</div>
    <div class="oxbtns"><button class="ox o ${answered && x.a ? 'hit' : ''}" ${answered ? 'disabled' : ''} onclick="oxAns(true)">O</button><button class="ox x ${answered && !x.a ? 'hit' : ''}" ${answered ? 'disabled' : ''} onclick="oxAns(false)">X</button></div>
    ${answered ? `<div class="explain ${ok ? 'ok' : 'no'}" style="margin-top:14px"><div class="hd">${ok ? '정답이에요!' : '틀렸어요 · 정답 ' + (x.a ? 'O' : 'X')}</div>${esc(x.e)}</div>` : ''}</div>`;
  bottom(answered ? `<button class="btn" onclick="oxNext()">${r.i + 1 < r.items.length ? '다음' : '끝내기'}</button>` : ''); }
function oxAns(v) { const r = run, x = r.items[r.i]; r.ans = v; const ok = v === x.a; record(x.s, ok); if (ok) { r.score++; if (r.retry) S.wrongOx = S.wrongOx.filter(i => i !== x.id); } else if (!S.wrongOx.includes(x.id)) S.wrongOx.push(x.id); save(); drawOx(); }
function oxNext() { const r = run; if (r.i + 1 < r.items.length) { r.i++; r.ans = null; drawOx(); return; }
  S.hist.unshift({ d: dkey(), l: 'OX 선지 퀴즈', s: r.score, t: r.items.length }); S.hist = S.hist.slice(0, 30); save(); window.scrollTo(0, 0);
  $app.innerHTML = `<div class="top"><div class="ttl" style="text-align:center">OX 결과</div></div><div class="pad"><div class="card score"><div class="emo">${IC.ox()}</div><div class="big">${r.score}<small> / ${r.items.length}</small></div><div class="msg">틀린 선지는 복습노트에 모아 뒀어요</div></div></div>`;
  bottom(`<button class="btn ghost" onclick="go('home')">홈으로</button><button class="btn" onclick="wnTab='ox';go('note')">복습노트</button>`); }

