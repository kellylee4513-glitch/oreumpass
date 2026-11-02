/* [stats/topwrong.js] 통계: 내가 자주 틀린 문제 TOP 10 */
/* 기록: 내가 자주 틀린 문제 */
function topWrongHTML() {
  const qs = S.qstat || {}, L = Object.keys(qs).map(Number).filter(id => qs[id].w > 0 && Q[id]).sort((a, b) => qs[b].w - qs[a].w || qs[b].w / qs[b].t - qs[a].w / qs[a].t).slice(0, 10);
  return `<div class="sec">내가 자주 틀린 문제 TOP 10${L.length ? `<button class="sec-link" onclick="modeSheet(topWrongList(),'자주 틀린 문제')">다시 풀기 ›</button>` : ''}</div>
  <div class="card" style="padding:6px 20px">${L.length ? L.map((id, i) => `<div class="tw"><span class="rk ${i < 3 ? 'top' : ''}">${i + 1}</span><div class="grow"><div class="t">${esc(Q[id].q.split('\n')[0])}</div><div class="d">${SUBJ[Q[id].s]} · ${qs[id].t}번 풀어 ${qs[id].w}번 틀림</div></div><span class="wr">${Math.round(qs[id].w / qs[id].t * 100)}%</span></div>`).join('') : `<div class="empty" style="padding:22px 0"><div class="e">${IC.target()}</div>문제를 풀면 내가 약한 문제가 여기 쌓여요</div>`}
  <div class="soon">전체 수험생 오답률 TOP 10은 회원 기능이 열리면 함께 보여 드려요</div></div>`;
}
function topWrongList() { const qs = S.qstat || {}; return Object.keys(qs).map(Number).filter(id => qs[id].w > 0 && Q[id]).sort((a, b) => qs[b].w - qs[a].w).slice(0, 10).map(id => Object.assign({ id }, Q[id])); }

