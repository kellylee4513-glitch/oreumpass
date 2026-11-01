/* [screens/bank.js] 문제은행 검색 */
/* 문제은행 */
const BK = { q: '', s: 0, st: 'all' };
function qStatus(id) { return S.wrong.includes(id) ? 'wrong' : S.seen.includes(id) ? 'done' : 'new'; }
function bankList() { const k = BK.q.trim(); return pool(BK.s).filter(q => (!k || (q.q + ' ' + q.o.join(' ') + ' ' + (q.sec || '') + ' ' + (q.c || '')).includes(k)) && (BK.st === 'all' || (BK.st === 'star' ? S.star.includes(q.id) : qStatus(q.id) === BK.st))); }
function bankPage() { markNav();
  window.scrollTo(0, 0); $app.classList.add('wide');
  const chip = (v, l) => `<button class="chip ${BK.st === v ? 'on' : ''}" onclick="BK.st='${v}';bankPage()">${l}</button>`;
  $app.innerHTML = topBar('문제은행', `<span class="tcount" id="bkc"></span>`) + `<div class="pad bank">
    <div class="sbox"><svg viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><input id="bkq" placeholder="키워드로 찾기 (예: 양도소득세, 듀레이션)" value="${esc(BK.q)}" oninput="BK.q=this.value;bankDraw()"></div>
    <div class="chips"><button class="chip ${!BK.s ? 'on' : ''}" onclick="BK.s=0;bankPage()">전 과목</button>${SK.map(s => `<button class="chip ${BK.s == s ? 'on' : ''}" onclick="BK.s=${s};bankPage()">${SUBJ[s]} ${esc(SUBJ_SHORT[s])}</button>`).join('')}</div>
    <div class="chips">${chip('all', '전체')}${chip('new', '안 푼 문제')}${chip('wrong', '틀린 문제')}${chip('done', '맞힌 문제')}${chip('star', '⭐ 북마크')}</div>
    <div id="bkl"></div></div>`;
  tabbar(); bankDraw();
}
function bankDraw() {
  const L = bankList(), el = document.getElementById('bkl'), c = document.getElementById('bkc'); if (c) c.textContent = L.length + '문항';
  const lab = { new: ['안 풂', ''], done: ['맞힘', 'ok'], wrong: ['틀림', 'no'] };
  el.innerHTML = L.length ? `<div class="blist">${L.map((q, i) => { const st = lab[qStatus(q.id)]; return `<button class="bq" onclick="bankOpen(${i})"><div class="bm"><span class="no">Q${pad2(q.id + 1)}</span><span class="tagS">${SUBJ[q.s]} · ${esc(q.sec || SUBJ_SHORT[q.s])}</span>${q.lv ? `<span class="tagL">${q.lv}</span>` : ''}${S.star.includes(q.id) ? '<span class="stx">⭐</span>' : ''}<span class="bst ${st[1]}">${st[0]}</span></div><div class="bt">${esc(q.q.split('\n')[0])}</div></button>`; }).join('')}</div>` : `<div class="empty"><div class="e">${IC.bank()}</div>조건에 맞는 문제가 없어요</div>`;
}
function bankOpen(i) { modeSheet(bankList(), '문제은행', { at: i }); }

