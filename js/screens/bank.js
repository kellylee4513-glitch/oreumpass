/* [screens/bank.js] 문제은행 검색 */
/* 문제은행 */
const BK = { q: '', s: 0, st: 'all', imp: 0, n: 40 };
/* 중요도: 꿈라 원본 빈출 표시 + 기출 출제 횟수로 매긴 등급 (3 필수 · 2 빈출 · 1 기본) */
function impOf(q) { return q.star || 1; }
function qStatus(id) { return S.wrong.includes(id) ? 'wrong' : S.seen.includes(id) ? 'done' : 'new'; }
function bankList() { const k = BK.q.trim(); return pool(BK.s).filter(q => (!k || (q.q + ' ' + q.o.join(' ') + ' ' + (q.sec || '') + ' ' + (q.c || '')).includes(k)) && (BK.st === 'all' || (BK.st === 'star' ? S.star.includes(q.id) : qStatus(q.id) === BK.st)) && (!BK.imp || impOf(q) === BK.imp)).sort((a, b) => impOf(b) - impOf(a) || a.id - b.id); }
function bankPage() { markNav();
  window.scrollTo(0, 0); $app.classList.add('wide');
  const chip = (st, imp, l) => `<button class="chip ${BK.st === st && BK.imp === imp ? 'on' : ''}" onclick="BK.st='${st}';BK.imp=${imp};BK.n=40;bankPage()">${l}</button>`;
  $app.innerHTML = topBar('문제은행', `<span class="tcount" id="bkc"></span>`) + `<div class="pad bank">
    <div class="sbox"><svg viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><input id="bkq" placeholder="키워드로 찾기 (예: 양도소득세, 듀레이션)" value="${esc(BK.q)}" oninput="BK.q=this.value;BK.n=40;bankDraw()"></div>
    <div class="chips"><button class="chip ${!BK.s ? 'on' : ''}" onclick="BK.s=0;BK.n=40;bankPage()">전 과목</button>${SK.map(s => `<button class="chip ${BK.s == s ? 'on' : ''}" onclick="BK.s=${s};BK.n=40;bankPage()">${SUBJ[s]} ${esc(SUBJ_SHORT[s])}</button>`).join('')}</div>
    <div class="chips">${chip('all', 0, '전체')}${chip('all', 3, '<b class="i3">★★★</b> 필수')}${chip('all', 2, '<b class="i2">★★</b> 빈출')}${chip('wrong', 0, '틀린 문제')}${chip('star', 0, '북마크')}${chip('new', 0, '안 푼 문제')}${chip('done', 0, '맞힌 문제')}</div>
    <div id="bkl"></div></div>`;
  tabbar(); bankDraw();
}
function bankDraw() {
  const L = bankList(), el = document.getElementById('bkl'), c = document.getElementById('bkc'); if (c) c.textContent = L.length + '문항';
  const lab = { new: ['안 풂', ''], done: ['맞힘', 'ok'], wrong: ['틀림', 'no'] };
  el.innerHTML = L.length ? `<div class="blist">${L.slice(0, BK.n).map((q, i) => { const st = lab[qStatus(q.id)]; return `<button class="bq" onclick="bankOpen(${i})"><div class="bm">${impOf(q) > 1 ? `<span class="imp i${impOf(q)}">${'★'.repeat(impOf(q))}</span>` : ''}<span class="no">Q${pad2(q.id + 1)}</span><span class="bsec">${esc(q.sec || SUBJ_SHORT[q.s])}</span>${S.star.includes(q.id) ? '<span class="stx">⭐</span>' : ''}<span class="bst ${st[1]}">${st[0]}</span></div><div class="bt">${esc(q.q.split('\n')[0])}</div></button>`; }).join('')}</div>${L.length > BK.n ? `<button class="btn ghost bk-more" onclick="BK.n+=40;bankDraw()">더 보기 (${L.length - BK.n}문항 남음)</button>` : ''}` : `<div class="empty"><div class="e">${IC.bank()}</div>조건에 맞는 문제가 없어요</div>`;
}
function bankOpen(i) { modeSheet(bankList(), '문제은행', { at: i }); }

