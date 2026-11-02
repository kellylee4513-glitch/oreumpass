/* [screens/picker.js] 첫 화면: 자격증 선택 */
/* ===== 자격증 선택 (첫 화면) ===== */
function certPicker(first) {
  stopTimer(); run = null; window.scrollTo(0, 0); $app.classList.add('wide');
  const totalQ = READY.reduce((n, c) => n + c.questions.length, 0);
  const big = c => { const d = G.data[c.id], pro = G.passAll || G.passCerts.includes(c.id), dd = d ? dday(d.exam) : null, seen = d ? d.seen.length : 0, pct = Math.round(seen / c.questions.length * 100);
    const subs = Object.entries(c.subjects).map(([k, v]) => `<span><i>${k}</i>${esc(v.short)}</span>`).join('');
    const tag = pro ? '<span class="tag on">PRO</span>' : dd !== null && dd >= 0 ? `<span class="tag free">D-${dd}</span>` : '<span class="rc-open">무료 오픈</span>';
    return `<button class="rc ${G.cur === c.id && !first ? 'on' : ''}" style="--cc:${c.accent || c.color}" onclick="pickCert('${c.id}')">
      <svg class="rc-deco" viewBox="0 0 220 120" aria-hidden="true"><path d="M0 104 L40 86 L70 94 L110 60 L140 70 L180 34 L220 14" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div class="rc-top">${badge(c, 56)}<div class="grow"><div class="rc-cat">${esc(c.info.org)} · ${esc(c.desc || c.cat)}</div><div class="rc-name">${esc(c.name)}</div></div>${tag}</div>
      <div class="rc-subs">${subs}</div>
      <div class="rc-meta"><span><b>${c.info.count}</b>문항 · <b>${c.info.minutes}</b>분</span><span>${esc(c.info.format)}</span><span>평균 <b>${c.pass.total}</b> · 과락 <b>${c.pass.sub}</b></span><span>${esc(c.info.eligibility)}</span></div>
      ${seen ? `<div class="rc-bar"><i style="width:${pct}%"></i></div>` : ''}
      <div class="rc-foot"><span class="rc-n">자체 제작 <b>${c.questions.length}</b>문항 · 해설 포함</span>${seen ? `<span class="rc-cta">${seen}문제 풀었어요 · 이어서 풀기</span>` : ''}</div>
    </button>`; };
  const tile = c => `<button class="sc" onclick="toast('${esc(c.name)} 문제를 열심히 만들고 있어요')">${badge(c, 48)}<div class="grow"><div class="sc-top"><span class="sc-name">${esc(c.name)}</span><span class="sc-tag">준비 중</span></div><div class="sc-d">${esc(c.org || c.cat)}${c.desc ? ' · ' + esc(c.desc) : ''}</div>${c.meta ? `<div class="sc-m">${c.meta.map(m => `<span>${esc(m)}</span>`).join('')}</div>` : ''}</div></button>`;
  $app.innerHTML = `<div class="top ftop"><div class="logo"><img src="icon-192.png" alt="" onerror="this.remove()">${WORDMARK}</div></div>
  <div class="pad fwrap pk1">
    <section class="flist">
      <h1 class="pk-h">공부할 자격증을 골라 주세요</h1>
      ${READY.map(big).join('')}
      ${SOON.length ? `<div class="fl-h sm">곧 열려요 <span>${SOON.length}개</span></div><div class="sgrid2">${SOON.map(tile).join('')}</div>` : ''}
      
      <div class="foot">문제는 출제 논점을 바탕으로 더오를이 직접 만든 문항이에요.</div>
    </section>
  </div>`;
  bottom('');
  if (first) document.querySelectorAll('.bottom,.tabbar').forEach(e => e.remove()); else tabbar();
}

function pickCert(id) { const same = G.cur === id; useCert(id); save(); tab = 'home'; $app.classList.remove('wide'); go('home'); toast(same ? C.name + ' 이어서 공부해요' : C.name + '(으)로 바꿨어요'); }


function quickStart(id) { useCert(id); G.cur = id; save(); tab = 'home'; $app.classList.remove('wide'); const all = pool(0), un = shuffle(all.filter(q => !S.seen.includes(q.id))); startQuiz(un.concat(shuffle(all.filter(q => S.seen.includes(q.id)))).slice(0, 10), C.short + ' 바로 풀기', 'explain'); }
