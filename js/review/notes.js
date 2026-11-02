/* [review/notes.js] 단권화 요약 노트 */
/* ===== 단권화 요약 노트 ===== */
let NT = { k: '' };
function notePage(k, focus) {
  markNav(); window.scrollTo(0, 0); $app.classList.remove('wide');
  const units = []; const seen = new Set(); pool(0).forEach(q => { const uk = unitKey(q); if (!seen.has(uk)) { seen.add(uk); units.push({ k: uk, name: unitName(q), s: q.s }); } });
  NT.k = k || NT.k || (units.find(u => pool(0).some(q => unitKey(q) === u.k && q.c)) || units[0]).k;
  const items = pool(0).filter(q => unitKey(q) === NT.k && q.c), u = units.find(x => x.k === NT.k);
  const fromQuiz = !!(run && !run.mock && !run.ox); $app.innerHTML = topBar('단원 정리 노트', '', fromQuiz ? 'drawQ()' : '') + `<div class="pad">
    <div class="chips" style="flex-wrap:wrap;margin-bottom:12px">${units.map(x => `<button class="chip ${x.k === NT.k ? 'on' : ''}" onclick="notePage('${x.k}')">${SUBJ[x.s]} ${esc(x.name)}</button>`).join('')}</div>
    <div class="nt-h"><div class="t">${esc(u ? u.name : '')}</div><div class="d">핵심 개념 ${items.length}개 · 문제를 풀다가 막히면 여기로 와요</div></div>
    ${items.length ? items.map((q, i) => `<div class="nt-c ${q.id === focus ? 'focus' : ''}" id="nt${q.id}"><div class="nt-n">${pad2(i + 1)}</div><div class="grow"><div class="nt-t">${esc(q.t || q.o[q.a])}</div><div class="nt-b">${hl(q.c)}</div>${q.f ? `<div class="rx-f"><div class="lb">핵심 공식</div>${hl(q.f)}</div>` : ''}${q.m ? `<div class="rx-m"><div class="lb">10초 암기 팁</div>${esc(q.m)}</div>` : ''}<button class="tlink" onclick="startQuiz([Object.assign({id:${q.id}},Q[${q.id}])],'단원 정리 확인 문제','explain')">관련 문제 풀기 ›</button></div></div>`).join('') : `<div class="empty"><div class="e">${IC.book()}</div>이 단원 요약은 문제를 늘리면서 함께 채워요</div>`}
  </div>`; if (fromQuiz) { document.querySelectorAll('.bottom,.tabbar').forEach(e => e.remove()); NT.back = true; } else { NT.back = false; tabbar(); }
  if (focus !== undefined) setTimeout(() => { const el = document.getElementById('nt' + focus); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
}

