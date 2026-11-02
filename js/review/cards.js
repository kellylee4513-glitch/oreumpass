/* [review/cards.js] 오답 관리: 1분 개념 카드 */
/* 1분 개념 카드 */
let CD = null;
function cardPage() {
  const deck = pool(0).filter(q => q.c); if (!deck.length) { toast('개념 카드가 아직 없어요'); return; }
  const known = S.cardOk || [], order = deck.filter(q => !known.includes(q.id)).concat(deck.filter(q => known.includes(q.id)));
  CD = { deck: order, i: 0, flip: false }; drawCard();
}
function drawCard() {
  markNav(); window.scrollTo(0, 0); $app.classList.remove('wide');
  const q = CD.deck[CD.i], n = CD.deck.length, known = (S.cardOk || []).length;
  $app.innerHTML = topBar('1분 개념 카드', `<span class="tcount">${CD.i + 1} / ${n}</span>`) + `<div class="pad">
    <div class="prog"><i style="width:${(CD.i + 1) / n * 100}%"></i></div>
    <div class="fc ${CD.flip ? 'flip' : ''}" role="button" tabindex="0" onclick="CD.flip=!CD.flip;drawCard()">
      <div class="fc-in">
        <div class="fc-f"><div class="fc-tag">${SUBJ[q.s]} · ${esc(q.sec || SUBJ_SHORT[q.s])}</div><div class="fc-q">${esc(q.q.split('\n')[0])}</div><div class="fc-hint">탭해서 핵심 개념 보기</div></div>
        <div class="fc-b"><div class="fc-tag">정답 ${NUM[q.a]}${q.t ? ' · ' + esc(q.t) : ''}</div><div class="fc-a">${esc(q.o[q.a])}</div><div class="fc-c">${esc(q.c)}</div></div>
      </div>
    </div>
    <div class="fc-meta">외운 카드 ${known} / ${CD.deck.length}</div>
  </div>`;
  bottom(CD.flip ? `<button class="btn ghost" onclick="cardNext(false)">다시 볼래요</button><button class="btn" onclick="cardNext(true)">알았어요</button>` : `<button class="btn" onclick="CD.flip=true;drawCard()">개념 보기</button>`);
}
function cardNext(ok) { const id = CD.deck[CD.i].id; S.cardOk = S.cardOk || []; if (ok && !S.cardOk.includes(id)) S.cardOk.push(id); if (!ok) S.cardOk = S.cardOk.filter(x => x !== id); save();
  if (CD.i + 1 < CD.deck.length) { CD.i++; CD.flip = false; drawCard(); } else { toast(`카드 ${CD.deck.length}장을 다 봤어요`); CD = null; go('home'); } }

