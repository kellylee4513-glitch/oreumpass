/* [screens/units.js] 과목·단원별 풀기 */
/* 단원별 */
let unitSel = [];
function unitsOf() { const m = new Map(); pool(0).forEach(q => { const k = q.s + '|' + (q.sec || ''); if (!m.has(k)) m.set(k, { k, s: q.s, name: q.sec || SUBJ_SHORT[q.s] + ' 종합', items: [] }); m.get(k).items.push(q); }); const ord = n => { const i = (C.unitOrder || []).indexOf(n); return n.includes('종합') ? 999 : i < 0 ? 500 : i; }; return [...m.values()].sort((a, b) => a.s - b.s || ord(a.name) - ord(b.name)); }
function unitPage() { markNav();
  window.scrollTo(0, 0); $app.classList.remove('wide');
  const U = unitsOf(), cnt = U.filter(u => unitSel.includes(u.k)).reduce((n, u) => n + u.items.length, 0);
  const row = u => { const on = unitSel.includes(u.k), seen = u.items.filter(q => S.seen.includes(q.id)).length, wr = u.items.filter(q => S.wrong.includes(q.id)).length;
    return `<button class="unit ${on ? 'on' : ''}" onclick="toggleUnit('${u.k}')"><span class="ck">${on ? '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M5 12l5 5 9-10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</span><div class="grow"><div class="t">${esc(u.name)}</div><div class="d">${u.items.length}문항 · 푼 문제 ${seen}${wr ? ` · <b style="color:var(--red)">오답 ${wr}</b>` : ''}</div><div class="ub"><i style="width:${seen / u.items.length * 100}%"></i></div></div><span class="go" role="button" tabindex="0" onclick="event.stopPropagation();unitGo('${u.k}')">바로 풀기 ›</span></button>`; };
  $app.innerHTML = topBar('과목·단원별 풀기', `<button class="tlink" onclick="unitSel=${unitSel.length ? '[]' : 'unitsOf().map(u=>u.k)'};unitPage()">${unitSel.length ? '선택 해제' : '전체 선택'}</button>`) + `<div class="pad upage">
    <div class="lead">단원을 여러 개 고르면 한 번에 섞어 풀 수 있어요.</div>
    ${SK.map(s => { const us = U.filter(u => u.s == s); if (!us.length) return ''; const a = acc(s); return `<div class="usec"><div class="uh"><span class="sn">${s}</span><div class="grow"><div class="t">${esc(SUBJ_FULL[s])}</div><div class="d">${us.reduce((n, u) => n + u.items.length, 0)}문항${a !== null ? ' · 정답률 ' + a + '%' : ''}</div></div><button class="tlink" onclick="selSubj(${s})">과목 전체</button></div>${us.map(row).join('')}</div>`; }).join('')}
  </div>`;
  bottom(`<button class="btn" ${cnt ? '' : 'disabled'} onclick="unitStart()">${cnt ? `선택한 ${cnt}문항 풀기` : '단원을 골라 주세요'}</button>`);
}
function toggleUnit(k) { unitSel = unitSel.includes(k) ? unitSel.filter(x => x !== k) : unitSel.concat(k); unitPage(); }
function selSubj(s) { const ks = unitsOf().filter(u => u.s == s).map(u => u.k), all = ks.every(k => unitSel.includes(k)); unitSel = all ? unitSel.filter(k => !ks.includes(k)) : [...new Set(unitSel.concat(ks))]; unitPage(); }
function unitGo(k) { const u = unitsOf().find(x => x.k === k); modeSheet(u.items, u.name); }
function unitStart() { const U = unitsOf().filter(u => unitSel.includes(u.k)); const items = U.flatMap(u => u.items); modeSheet(U.length > 1 ? shuffle(items) : items, U.length === 1 ? U[0].name : `단원 ${U.length}개 함께`); }

