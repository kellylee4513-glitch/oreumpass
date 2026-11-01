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
      <div class="rc-foot"><span class="rc-n">자체 제작 <b>${c.questions.length}</b>문항 · 해설 포함</span><span class="rc-cta">${seen ? `${seen}문제 풀었어요 · 이어서 →` : '무료로 시작하기 →'}</span></div>
    </button>`; };
  const tile = c => `<button class="sc" onclick="toast('${esc(c.name)} 문제를 열심히 만들고 있어요')">${badge(c, 48)}<div class="grow"><div class="sc-top"><span class="sc-name">${esc(c.name)}</span><span class="sc-tag">준비 중</span></div><div class="sc-d">${esc(c.org || c.cat)}${c.desc ? ' · ' + esc(c.desc) : ''}</div>${c.meta ? `<div class="sc-m">${c.meta.map(m => `<span>${esc(m)}</span>`).join('')}</div>` : ''}</div></button>`;
  $app.innerHTML = `<div class="top ftop"><div class="logo"><img src="icon-192.png" alt="" onerror="this.remove()">${WORDMARK}</div></div>
  <div class="pad fwrap">
    <section class="fhero lp">
      <svg class="lp-line" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="lpg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3D27A" stop-opacity=".22"/><stop offset="1" stop-color="#F3D27A" stop-opacity="0"/></linearGradient></defs><path d="M0 150 L60 128 L110 136 L170 96 L220 104 L280 58 L330 66 L400 16 V160 H0Z" fill="url(#lpg)"/><path d="M0 150 L60 128 L110 136 L170 96 L220 104 L280 58 L330 66 L400 16" fill="none" stroke="#F3D27A" stroke-opacity=".45" stroke-width="2"/></svg>
      <div class="lp-top"><span class="lp-badge"><i></i>2026 개정 세법 반영</span></div>
      <h1>합격까지<br>한 계단씩, <em>더 오를</em></h1>
      <p>기출을 외우는 대신,<br>왜 틀렸는지 고쳐 주는 자격증 문제집</p>
      ${READY[0] ? `<button class="fh-cta" onclick="quickStart('${READY[0].id}')"><span class="grow"><b>${esc(READY[0].name)}</b><span>바로 문제 풀기</span></span><span class="go">→</span></button><div class="fh-sub">가입 없이 바로 · 10문제 5분 · 해설 무료</div>` : ''}
      <div class="lp-stats"><div><b>${totalQ}</b><span>자체 제작 문항</span></div><i></i><div><b>${READY.reduce((n, c) => n + c.questions.filter(q => q.m).length, 0)}</b><span>10초 암기 팁</span></div><i></i><div><b>0원</b><span>해설 이용료</span></div></div>
      <ul class="lp-feat"><li><span>01</span>오늘 풀 분량을 앱이 정해 줘요</li><li><span>02</span>틀린 문제는 1·3·7일 뒤 다시 나와요</li><li><span>03</span>합격 확률을 숫자로 보여 줘요</li></ul>
    </section>
    <section class="flist">
      <div class="fl-h">${first ? '어떤 자격증을 준비하나요?' : '공부할 자격증을 골라 주세요'}</div>
      ${READY.map(big).join('')}
      ${SOON.length ? `<div class="fl-h sm">곧 열려요 <span>${SOON.length}개</span></div><div class="sgrid2">${SOON.map(tile).join('')}</div>` : ''}
      ${G.passAll ? '' : `<button class="allpass" onclick="paywall('all')"><div class="ap-ic">${IC.trophy()}</div><div class="grow"><div class="t">더오를패스 ALL</div><div class="d">모든 자격증 PRO · 새 자격증도 자동 포함</div></div><span class="go">${won(ALL_PRICE)}</span></button>`}
      <div class="foot">문제는 출제 논점을 바탕으로 더오를이 직접 만든 문항이에요.</div>
    </section>
  </div>`;
  bottom('');
  if (first) document.querySelectorAll('.bottom,.tabbar').forEach(e => e.remove()); else tabbar();
}

function pickCert(id) { const same = G.cur === id; useCert(id); save(); tab = 'home'; $app.classList.remove('wide'); go('home'); toast(same ? C.name + ' 이어서 공부해요' : C.name + '(으)로 바꿨어요'); }


function quickStart(id) { useCert(id); G.cur = id; save(); tab = 'home'; $app.classList.remove('wide'); const all = pool(0), un = shuffle(all.filter(q => !S.seen.includes(q.id))); startQuiz(un.concat(shuffle(all.filter(q => S.seen.includes(q.id)))).slice(0, 10), C.short + ' 바로 풀기', 'explain'); }
