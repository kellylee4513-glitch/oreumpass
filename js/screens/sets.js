/* [screens/sets.js] 세트별 실전 문제 */
/* 세트별 */
function hashN(n) { let x = (n + 1) * 2654435761 % 4294967296; x ^= x >>> 13; return x; }
function setsOf() { const ord = pool(0).sort((a, b) => hashN(a.id) - hashN(b.id)); const out = []; for (let i = 0; i < ord.length; i += SET_N) out.push(ord.slice(i, i + SET_N)); if (out.length > 1 && out[out.length - 1].length < SET_N / 2) { const last = out.pop(); out[out.length - 1] = out[out.length - 1].concat(last); } return out; }
function setPage() { markNav();
  window.scrollTo(0, 0); $app.classList.remove('wide'); const sets = setsOf(), best = S.setBest || {};
  $app.innerHTML = topBar('세트별 실전 문제') + `<div class="pad upage">
    <div class="lead">실제 시험처럼 과목이 섞인 ${SET_N}문항 세트예요. 세트마다 최고 점수를 기록해요.</div>
    ${sets.map((it, i) => { const n = i + 1, b = best[n], seen = it.filter(q => S.seen.includes(q.id)).length, sub = SK.map(s => it.filter(q => q.s == s).length);
      return `<button class="setc" onclick="modeSheet(setsOf()[${i}],'세트 ${n}',{setNo:${n}})"><div class="sno"><small>SET</small>${pad2(n)}</div><div class="grow"><div class="t">실전 세트 ${n}</div><div class="d">${it.length}문항 · ${sub.map((c, k) => `${SK[k]}과목 ${c}`).join(' · ')}</div><div class="ub"><i style="width:${seen / it.length * 100}%"></i></div></div><div class="sbest ${b === undefined ? '' : b >= PASS.total ? 'ok' : 'no'}">${b === undefined ? '<em>미응시</em>' : `<b>${b}</b><em>최고점</em>`}</div></button>`; }).join('')}
    <div class="note" style="margin-top:12px">문제가 늘어나면 세트도 자동으로 늘어나요.</div>
  </div>`; tabbar();
}

