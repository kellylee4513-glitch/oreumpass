/* [review/wrongnote.js] 오답 관리: 복습노트(오답·OX 오답·북마크) */
/* ===== 복습노트 ===== */
function wrongNote() {
  const cbt = S.wrong.filter(i => Q[i]).map(i => Object.assign({ id: i }, Q[i])), ox = S.wrongOx.filter(i => OX[i]).map(i => Object.assign({ id: i }, OX[i])), st = S.star.filter(i => Q[i]).map(i => Object.assign({ id: i }, Q[i]));
  const list = wnTab === 'cbt' ? cbt : wnTab === 'ox' ? ox : st;
  const retry = wnTab === 'cbt' ? "startQuiz(S.wrong.map(i=>Object.assign({id:i},Q[i])),'오답 다시 풀기')" : wnTab === 'ox' ? "startOx(0,S.wrongOx.map(i=>Object.assign({id:i},OX[i])))" : "startQuiz(S.star.map(i=>Object.assign({id:i},Q[i])),'별표 문제 풀기')";
  $app.innerHTML = brandBar() + `<div class="pad">
    <div class="h1" style="margin-bottom:14px">${esc(C.short)} 복습노트</div>
    <div class="chips" style="margin-bottom:14px"><button class="chip ${wnTab === 'cbt' ? 'on' : ''}" onclick="wnTab='cbt';wrongNote()">오답 ${cbt.length}</button><button class="chip ${wnTab === 'ox' ? 'on' : ''}" onclick="wnTab='ox';wrongNote()">OX 오답 ${ox.length}</button><button class="chip ${wnTab === 'star' ? 'on' : ''}" onclick="wnTab='star';wrongNote()">⭐ 별표 ${st.length}</button></div>
    ${list.length ? `<button class="btn" style="width:100%;margin-bottom:14px" onclick="${retry}">${list.length}문제 다시 풀기</button>` : ''}
    ${list.length ? list.map(it => wnTab === 'ox'
      ? `<div class="witem" role="button" tabindex="0" onclick="this.classList.toggle('open')"><div class="m"><span style="color:var(--red)">${SUBJ[it.s]}</span><span style="color:var(--gray)">탭해서 해설</span></div><div class="q">${esc(it.t)}</div><div class="a"><b>정답 ${it.a ? 'O' : 'X'}</b> ${esc(it.e)}</div></div>`
      : `<div class="witem" role="button" tabindex="0" onclick="this.classList.toggle('open')"><div class="m"><span style="color:${wnTab === 'star' ? '#E0A000' : 'var(--red)'}">${SUBJ[it.s]}</span><span style="color:var(--gray)">탭해서 해설</span></div><div class="q">${esc(it.q)}</div><div class="a xa">${explainHTML(Object.assign({id:it.id},it), null)}</div></div>`).join('')
      : `<div class="empty"><div class="e">${wnTab === 'star' ? IC.star() : IC.note()}</div>${wnTab === 'star' ? '문제 풀 때 ☆를 누르면<br>헷갈리는 문제를 모아 둘 수 있어요' : '아직 틀린 문제가 없어요<br>문제를 풀면 여기에 모여요'}</div>`}
  </div>`; tabbar(); }

