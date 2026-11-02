/* [quiz/practice.js] 문제 풀이: 진입(빠른·약점·과목) · 연습 화면(문제+해설) · 채점 · 번호판 · 제보 */
/* ===== 풀이 진입 ===== */
function startQuick() { closeSheet(); const all = pool(0), un = shuffle(all.filter(q => !S.seen.includes(q.id))), sn = shuffle(all.filter(q => S.seen.includes(q.id))); startQuiz(un.concat(sn).slice(0, 10), '빠른 10문제'); }
function startWeak() { closeSheet(); const w = weakest(); if (!w) { toast('먼저 문제를 풀어 실력을 확인해 볼게요'); startQuick(); return; } const ws = pool(w.s); const wr = ws.filter(q => S.wrong.includes(q.id)); startQuiz(wr.concat(shuffle(ws.filter(q => !S.wrong.includes(q.id)))), '약점 집중 · ' + SUBJ[w.s]); }
function subjectSheet() { unitPage(); }
function subjectSheetOld() { openSheet(`<h3>어떤 과목을 풀까요?</h3><div class="p">문제마다 바로 정답과 해설을 보여 드려요</div>
  ${SK.map(s => { const a = acc(s); return `<button class="pick" onclick="closeSheet();startQuiz(pool(${s}),'${SUBJ[s]} 풀기')"><div class="grow"><div class="t">${SUBJ[s]} · ${esc(SUBJ_FULL[s])}</div><div class="d">${pool(s).length}문항${a !== null ? ' · 정답률 ' + a + '%' : ''}</div></div><span class="chev" aria-hidden="true">›</span></button>`; }).join('')}
  <button class="pick" onclick="closeSheet();startQuiz(pool(0),'전 과목 풀기')"><div class="grow"><div class="t">전 과목 순서대로</div><div class="d">${Q.length}문항</div></div><span class="chev" aria-hidden="true">›</span></button>`); }

/* ===== 연습 모드: 문제 + 해설 2단 구조 ===== */
function startQuiz(items, label, mode, at) { closeSheet(); if (!items.length) { toast('풀 문제가 없어요'); return; }
  run = { mode: mode || 'explain', items, i: at || 0, st: items.map(() => ({ pick: null, done: false })), score: 0, wrongIds: [], start: Date.now(), label, retry: /오답|틀린|복습|약점|자주/.test(label || ''), memo: false };
  stopTimer(); drawQ(); }
function starBtn(id) { return `<button class="sb" onclick="toggleStar(${id})" aria-label="별표">${IC.starLine(S.star.includes(id))}</button>`; }
function toggleStar(id) { const on = S.star.includes(id); S.star = on ? S.star.filter(x => x !== id) : S.star.concat(id); save(); toast(on ? '북마크를 뺐어요' : '북마크에 담았어요 ⭐'); run && run.mock ? drawMock() : drawQ(); }
const NUM = '①②③④';
function explainHTML(q, pick) {
  const answered = pick !== null && pick !== undefined, ok = pick === q.a, qs = (S.qstat || {})[q.id];
  const st = !answered ? 'neutral' : ok ? 'ok' : 'no';
  let h = `<div class="ex">
    <div class="ex-head ${st}"><div class="ex-st"><i></i>${!answered ? '정답 확인' : ok ? '정답이에요' : '아쉽게 틀렸어요'}</div>
      <div class="ex-ans"><span class="ex-n">${NUM[q.a]}</span><span>${esc(q.o[q.a])}</span></div>
      ${answered && !ok ? `<div class="ex-my">내가 고른 답 <b>${NUM[pick]}</b> ${esc(q.o[pick])}</div>` : ''}</div>`;
  if (q.k) h += `<div class="ex-easy"><div class="ex-lb">쉽게 말하면</div><p>${esc(q.k)}</p></div>`;
  if (q.m) h += `<div class="ex-tip"><div class="ex-lb">10초 암기</div><p>${esc(q.m)}</p></div>`;
  if (q.c) h += `<section class="ex-sec"><h4>핵심 개념${q.t ? `<span>${esc(q.t)}</span>` : ''}</h4><p>${hl(q.c)}</p>${q.f ? `<div class="ex-f"><span>공식</span><div class="fx">${hl(q.f)}</div></div>` : ''}</section>`;
  h += `<section class="ex-sec"><h4>왜 정답이 ${NUM[q.a]}일까</h4><p>${hl(q.e)}</p></section>`;
  if (q.w) h += `<section class="ex-sec"><h4>보기 분석</h4><div class="ex-ol">${q.o.map((o, k) => `<div class="ex-o ${k === q.a ? 'c' : ''} ${k === pick && k !== q.a ? 'm' : ''}"><span class="k">${NUM[k]}</span><div class="grow"><div class="ot">${esc(o)}${k === q.a ? '<em class="t ok">정답</em>' : ''}${k === pick && k !== q.a ? '<em class="t my">내 선택</em>' : ''}</div><div class="ow">${k === q.a ? '정답이에요. 위의 ‘왜 정답일까’를 확인하세요' : hl(q.w[k] || '')}</div></div></div>`).join('')}</div></section>`;
  h += `<div class="ex-foot">${q.c ? `<button class="ex-link" onclick="notePage('${unitKey(q)}',${q.id})">요약 노트 · ${esc(unitName(q))} <span>›</span></button>` : ''}${PDF_LINK && PDF_LINK !== '#' ? `<a class="ex-link" href="${PDF_LINK}" target="_blank" rel="noopener">${esc(C.short)} 정리본 PDF <span>›</span></a>` : ''}${qs && qs.t ? `<div class="ex-me">이 문제 ${qs.t}번 풀이 · 오답 ${qs.w}번</div>` : ''}</div></div>`;
  return h;
}
function drawQ() { markNav();
  const r = run, q = r.items[r.i], st = r.st[r.i], n = r.items.length; window.scrollTo(0, 0);
  const M = r.mode, cls = k => { if (M === 'open') return k === q.a ? 'correct' : ''; if (M === 'exam') return k === st.pick ? 'sel' : ''; if (!st.done) return ''; if (k === q.a) return 'correct'; if (k === st.pick) return 'wrong'; return 'faded'; };
  if (!st.done && !st.t0) st.t0 = Date.now();
  const memo = (S.memo || {})[q.id] || '', solved = r.st.filter(x => x.done || (M === 'exam' && x.pick !== null)).length;
  $app.classList.add('wide');
  $app.innerHTML = `<div class="top qtop"><button class="back" onclick="quitQuiz()" aria-label="나가기"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="#191F28" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <div class="ttl">${esc(r.label)}<small><b class="mchip m-${M}">${MODE_NAME[M]}</b><span class="mtxt">${M === 'open' ? '정답·해설 펼쳐 보기' : solved + '문제 ' + (M === 'exam' ? '답함' : '풀었어요')}</span></small></div>
    <div class="qnav"><button class="pg" onclick="jumpSheet()" aria-label="번호판 열기"><svg viewBox="0 0 24 24" width="15" height="15"><rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor" opacity=".4"/></svg>${r.i + 1}<em>/${n}</em></button></div></div></div>
  <div class="pad"><div class="prog"><i style="width:${solved / n * 100}%"></i></div>
  <div class="qwrap">
    <div class="qcard">
      <div class="qhead"><span class="qno">${r.i + 1}</span><span class="tagS">${SUBJ[q.s]} · ${esc(SUBJ_SHORT[q.s])}</span>${q.lv ? `<span class="tagL">난이도 ${q.lv}</span>` : ''}${q.rev ? '<span class="tagR">2026 개정</span>' : ''}
        <div class="tools"><button title="북마크" aria-label="북마크" onclick="toggleStar(${q.id})">${IC.starLine(S.star.includes(q.id))}</button><button title="내 노트" aria-label="내 노트" onclick="run.memo=!run.memo;drawQ()" class="${memo ? 'has' : ''}"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 20h4l10-10-4-4L4 16v4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button><button title="펜 필기" aria-label="펜 필기" class="${run.pen ? 'has' : ''}" onclick="togglePen()"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 21c3-1 5-3 6-5M14.5 4.5l5 5L10 19l-5.5.5L5 14z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg></button><button title="문제 제보" aria-label="문제 제보" onclick="reportSheet(${q.id})"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3l9 16H3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4M12 16.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>
      ${run.memo || memo ? `<textarea class="memo" placeholder="내 노트: 헷갈린 포인트를 적어 두세요" oninput="(S.memo=S.memo||{})[${q.id}]=this.value;save()">${esc(memo)}</textarea>` : ''}
      <div class="qtext">${esc(q.q)}</div>
      ${q.o.map((o, k) => `<button class="opt ${cls(k)}" ${(M === 'explain' && st.done) || M === 'open' ? 'disabled' : ''} onclick="answer(${k})"><span class="num">${k + 1}</span><span>${esc(o)}</span></button>`).join('')}
      ${M === 'explain' && st.done ? `<button class="retry" onclick="retryQ()">↺ 이 문제 다시 풀기</button>` : ''}
    </div>
    <div class="xcard ${st.done || M === 'open' ? 'open' : ''}">${M === 'open' ? explainHTML(q, null) : M === 'exam' ? `<div class="xp-wait">${IC.exam()}<p>시험 모드예요<br>다 풀고 <b>채점하기</b>를 누르면<br>해설이 한꺼번에 열려요</p></div>` : st.done ? explainHTML(q, st.pick) + (st.pick !== q.a ? whyHTML(q.id) : '') : `<div class="xp-wait">${IC.medal()}<p>답을 고르면<br>더오를 해설이 펼쳐져요</p></div>`}</div>
  </div></div>`;
  const last = r.i + 1 >= n, nextFn = last ? 'finishQuiz()' : `goQ(${r.i + 1})`, ready = M !== 'explain' || st.done;
  const nextLbl = last ? (M === 'exam' ? '채점하기' : M === 'open' ? '끝내기' : '결과 보기') : (ready ? '다음 문제' : '건너뛰기');
  bottom(`<button class="btn ghost qprev" ${r.i === 0 ? 'disabled' : ''} onclick="goQ(${r.i - 1})"><span class="ar">‹</span>이전 문제</button><button class="btn qnext ${ready ? '' : 'skip'}" onclick="${nextFn}">${nextLbl}<span class="ar">›</span></button>`);
  if (r.pen) setTimeout(mountPen, 30);
  if (M === 'explain' && st.done && window.innerWidth < 900) { const x = document.querySelector('.xcard'); if (x) setTimeout(() => x.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120); }
}
function goQ(i) { run.i = Math.max(0, Math.min(run.items.length - 1, i)); run.memo = false; drawQ(); }
function gradeOne(q, k) { const ok = k === q.a; record(q.s, ok, q.id); S.qstat = S.qstat || {}; const qs = S.qstat[q.id] = S.qstat[q.id] || { t: 0, w: 0 }; qs.t++; if (!ok) qs.w++; if (ok) { if (run.retry) S.wrong = S.wrong.filter(x => x !== q.id); } else if (!S.wrong.includes(q.id)) S.wrong.push(q.id); }
function answer(k) { const r = run, q = r.items[r.i], st = r.st[r.i]; if (r.mode === 'open') return; if (r.mode === 'exam') { if (st.pick === null) speedHit(Date.now() - st.t0); st.pick = k; drawQ(); return; } if (st.done) return; if (st.again) { st.pick = k; st.done = true; buzz(k === q.a); if (k === q.a && S.wrong.includes(q.id)) { S.wrong = S.wrong.filter(x => x !== q.id); save(); } drawQ(); return; } speedHit(Date.now() - st.t0); buzz(k === q.a); st.pick = k; st.done = true; const ok = k === q.a; record(q.s, ok, q.id);
  S.qstat = S.qstat || {}; const qs = S.qstat[q.id] = S.qstat[q.id] || { t: 0, w: 0 }; qs.t++; if (!ok) qs.w++;
  if (ok) { if (r.retry) S.wrong = S.wrong.filter(x => x !== q.id); } else if (!S.wrong.includes(q.id)) S.wrong.push(q.id); save(); drawQ(); }
function retryQ() { run.st[run.i] = { pick: null, done: false, again: true }; drawQ(); }
function finishQuiz() { const r = run; if (r.mode === 'open') { toast('오픈북 학습을 마쳤어요'); quitArm = true; quitQuiz(); return; }
  if (r.mode === 'exam') { const un = r.st.filter(x => x.pick === null).length; if (un && !r.gradeArm) { r.gradeArm = true; toast(`안 푼 문제 ${un}개는 빼고 채점해요. 한 번 더 누르세요`); setTimeout(() => r.gradeArm = false, 2500); return; } r.ans = {}; r.items.forEach((q, i) => { const st = r.st[i]; if (st.pick !== null) { st.done = true; r.ans[q.id] = st.pick; gradeOne(q, st.pick); } }); save(); r.review = true; }
  if (!r.st.some(x => x.done)) { toast('먼저 한 문제 이상 풀어 주세요'); return; }
  const done = r.items.map((q, i) => ({ q, st: r.st[i] })).filter(x => x.st.done);
  r.items = done.map(x => x.q); r.score = done.filter(x => x.st.pick === x.q.a).length; r.wrongIds = done.filter(x => x.st.pick !== x.q.a).map(x => x.q.id); result(); }
function jumpSheet() { const r = run; openSheet(`<h3>번호판</h3><div class="p">${r.mode === 'exam' ? '파랑 답함 · 회색 아직' : '초록 맞힘 · 빨강 틀림 · 회색 아직'}</div><div class="jump">${r.items.map((q, i) => { const st = r.st[i]; return `<button class="${r.mode === 'exam' ? (st.pick !== null ? 'sel' : '') : r.mode === 'open' ? '' : !st.done ? '' : st.pick === q.a ? 'ok' : 'no'} ${i === r.i ? 'cur' : ''}" onclick="closeSheet();goQ(${i})">${i + 1}</button>`; }).join('')}</div>`); }
function reportSheet(id) { const q = Q[id]; openSheet(`<h3>문제 제보</h3><div class="p">틀린 내용이나 바뀐 법령을 알려 주세요</div><textarea class="field memo" id="rp" style="height:110px;padding:12px" placeholder="예) 2번 보기의 세율이 2026년 기준과 달라요"></textarea>
  <button class="btn" style="width:100%" onclick="copyReport(${id})">제보 내용 복사하기</button><div class="note">복사한 내용을 더오를 카카오톡 채널이나 이메일로 보내 주세요 (연락처는 출시 때 연결돼요)</div>`); }
function copyText(t, ok) { const done = () => { toast(ok || '복사했어요'); }; const fb = () => { const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px'; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length); let s = false; try { s = document.execCommand('copy'); } catch (e) {} ta.remove(); s ? done() : toast('복사가 안 돼요. 길게 눌러 직접 복사해 주세요'); }; try { if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, fb); else fb(); } catch (e) { fb(); } }
function copyReport(id) { const t = `[더오를패스 문제 제보] ${C.name} / ${SUBJ[Q[id].s]} / ${Q[id].q.split('\n')[0].slice(0, 40)}…\n${document.getElementById('rp').value}`; copyText(t); closeSheet(); }
let quitArm = false;
function quitQuiz() { if (run && (run.st ? run.st.some(x => x.done || x.pick !== null) : true) && !quitArm && run.mode !== 'open') { quitArm = true; toast('한 번 더 누르면 나가요'); setTimeout(() => quitArm = false, 2000); return; } quitArm = false; $app.classList.remove('wide'); go(tab); }

