/* [quiz/result.js] 문제 풀이: 결과 화면 */
/* ===== 결과 ===== */
function result() { markNav(); stopTimer(); $app.classList.remove('wide'); const r = run; window.scrollTo(0, 0); const T = PASS.total, M = PASS.sub;
  const pct = Math.round(r.score / r.items.length * 100), pass = pct >= T, wn = r.wrongIds.length, ms = Date.now() - r.start;
  S.hist.unshift({ d: dkey(), l: r.label, s: r.score, t: r.items.length, ms }); S.hist = S.hist.slice(0, 30); if (r.daily) S.dq = { d: dkey(), s: r.score }; checkBadges(); if (r.setNo) { S.setBest = S.setBest || {}; S.setBest[r.setNo] = Math.max(S.setBest[r.setNo] || 0, pct); } save();
  const by = {}; r.items.forEach(q => { by[q.s] = by[q.s] || { t: 0, c: 0 }; by[q.s].t++; if (!r.wrongIds.includes(q.id)) by[q.s].c++; });
  const cut = Object.keys(by).some(k => by[k].c / by[k].t * 100 < M);
  $app.innerHTML = `<div class="top"><div class="ttl" style="text-align:center">결과</div></div><div class="pad">
    <div class="card score"><div class="emo">${pass && !cut ? IC.trophy() : pass ? IC.medal() : IC.climb()}</div><div class="big">${pct}<small>점</small></div>
      <div class="msg">${r.items.length}문제 중 ${r.score}문제 맞혔어요 · ${fmt(ms)}</div>
      <span class="pill ${pass && !cut ? 'pass' : 'fail'}">${pass && !cut ? `합격선 ${T}점을 넘었어요` : cut ? '과락 과목이 있어요' : `합격선 ${T}점까지 ${T - pct}점 남았어요`}</span></div>
    <div class="card"><div style="font-weight:700;font-size:16px;margin-bottom:4px">과목별 정답률</div>
      ${Object.keys(by).sort().map(k => { const p = Math.round(by[k].c / by[k].t * 100); return `<div class="bar"><span class="nm">${SUBJ[k]}${p < M ? '<span class="weak">과락</span>' : ''}</span><span class="tr"><i style="width:${p}%;${p < M ? 'background:var(--red)' : p < T ? 'background:var(--orange)' : ''}"></i></span><span class="v">${p}%</span></div>`; }).join('')}
      <div style="font-size:12px;color:var(--gray);margin-top:4px">${esc(C.name)} 합격 기준: 전체 ${T}% 이상 · 과목별 ${M}% 미만 과락</div></div>
    ${wn ? `<button class="btn" style="width:100%;margin-bottom:12px" onclick="startQuiz(run.wrongIds.map(id => Object.assign({ id }, Q[id])), '방금 틀린 문제', 'explain')">방금 틀린 ${wn}문제 바로 다시 풀기</button>` : ''}
    ${wn ? (isPro() ? `<button class="upsell" onclick="go('note')"><div class="deco">${IC.note()}</div><div class="t">틀린 ${wn}문제, 오답노트에 저장했어요</div><div class="d">헷갈렸던 문제만 다시 풀어 보세요</div><span class="go">오답노트 보기 ›</span></button>`
      : `<button class="upsell" onclick="paywall('wrong')"><div class="deco">${IC.note()}</div><div class="t">틀린 ${wn}문제,<br>그냥 넘어가면 시험에 또 나와요</div><div class="d">오답노트와 OX 선지 퀴즈로 약점만 골라 복습하세요</div><span class="go">${IC.lock()} 오답노트 열기</span></button>`)
      : `<div class="card" style="text-align:center;font-weight:700">전부 맞혔어요! 완벽해요 🎉</div>`}
    ${r.mock || r.review ? `<div class="sec" style="margin-top:20px">문제별 확인</div>${r.items.map((q, i) => { const a = r.ans[q.id], ok = a === q.a; return `<div class="witem" onclick="this.classList.toggle('open')"><div class="m"><span style="color:${ok ? 'var(--green)' : 'var(--red)'}">${i + 1}번 · ${ok ? '정답' : a === undefined ? '안 풂' : '오답'}</span><span style="color:var(--gray)">${SUBJ[q.s]}</span></div><div class="q">${esc(q.q)}</div><div class="a xa">${explainHTML(q, a === undefined ? null : a)}</div></div>`; }).join('')}` : ''}
  </div>`;
  bottom(`<button class="btn ghost" onclick="go('home')">홈으로</button><button class="btn" onclick="${r.mock ? 'startMock()' : 'startQuick()'}">${r.mock ? '다시 응시' : '10문제 더'}</button>`); }

