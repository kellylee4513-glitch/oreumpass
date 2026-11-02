/* [screens/home.js] 홈 화면 · 합격 예측 카드 · 오늘의 OX */
/* ===== 홈 ===== */
function home() {
  const dd = dday(), seen = S.seen.length, remain = Q.length - seen, pro = isPro(), wn = S.wrong.length + S.wrongOx.length;
  const tile = (fn, ic, t, d, tag) => `<button class="tile" onclick="${fn}">${tag || ''}<div class="ico">${ic}</div><div class="t">${t}</div><div class="d">${d}</div></button>`;
  const mini = (fn, ic, t, d, lock) => `<button class="mini ${lock ? 'locked' : ''}" onclick="${fn}">${lock ? `<span class="lk">${IC.lock()}</span>` : ''}<span class="mi">${ic}</span><span class="mt">${t}</span><span class="md">${d}</span></button>`;
  $app.innerHTML = brandBar() + `
  <div class="pad hgrid">
    <div class="b-greet"><div class="h1">${G.name ? esc(G.name) + '님, ' : ''}${esc(C.short)} 합격까지<br>오늘도 한 계단 <em>더 오를</em> 차례!</div>
    ${showInstall() ? `<button class="menu install" onclick="installGuide()"><img src="icon-192.png" alt="" onerror="this.remove()"><div class="grow"><div class="t">홈 화면에 앱 추가하기</div><div class="d">아이콘 한 번이면 바로 문제 풀기</div></div></button><button class="x-close" aria-label="앱 추가 안내 닫기" onclick="G.installHidden=true;save();home()">✕</button>` : ''}</div>
    <div class="b-hero"><div class="hero">
      ${heroArt(seen / Q.length)}
      <button class="set" onclick="examSheet()">${S.exam ? '변경' : '시험일 설정'}</button>
      <div class="k">${esc(C.name)} 시험까지</div>
      <div class="dd">${dd === null ? 'D-day' : dd > 0 ? 'D-' + dd : dd === 0 ? 'D-DAY' : '시험 끝!'}</div>
      <div class="m">${dd === null ? '시험일을 정하면 하루 목표를 계산해 드려요' : dd > 0 ? (remain > 0 ? `하루 ${Math.max(1, Math.ceil(remain / dd))}문제씩이면 1회독 완료` : '1회독 완료! 이제 오답 복습할 차례') : dd === 0 ? '지금까지 푼 문제를 믿어요!' : '수고 많으셨어요'}</div>
      <div class="bank"><div class="tr"><i style="width:${seen / Q.length * 100}%"></i></div><div class="tx">문제은행 ${seen} / ${Q.length} 풀었어요</div></div>
    </div></div>
    <div class="b-plan">${planCard()}</div>
    ${todayWrong().length ? `<div class="b-tw">${twCard()}</div>` : ''}

    <div class="b-play"><div class="sec">문제 풀기</div>
      <div class="grid4">
        ${tile('startMock()', IC.exam(), '실전 모의고사', `${pool(0).length}문항 · ${Math.max(5, Math.round(C.info.minutes / C.info.count * pool(0).length))}분 타이머`, '')}
        ${tile('startQuick()', IC.quick(), '빠른 10문제', '안 푼 문제부터 5분', '')}
        ${tile('subjectSheet()', IC.subject(), '과목·단원별', '원하는 단원만 골라 풀기', '')}
        ${tile('setPage()', IC.sets(), '세트별 실전', `${SET_N}문항 × ${setsOf().length}세트`, '')}
      </div>
      <div class="sec sm">공부 도구</div>
      <div class="grid3m">
        ${mini('bankPage()', IC.bank(), '문제은행', `${Q.length}문항 검색`)}
        ${mini('cardPage()', IC.book(), '개념 카드', `${Q.filter(q => q.c).length}장`)}
        ${mini('notePage()', IC.note(), '단원 정리', '공식·암기 팁')}
      </div>
    </div>

    <div class="b-rev"><div class="sec"><span>맞춤 복습<span class="pro">PRO</span></span></div>
      <div class="grid3m">
        ${mini("startCustom()", IC.target(), '약점 문제집', '20문항 자동', !pro)}
        ${mini(pro ? 'startOx(0)' : "paywall('ox')", IC.ox(), 'OX 퀴즈', `선지 ${OX.length}개`, !pro)}
        ${mini("go('note')", IC.star(), '오답·북마크', wn || S.star.length ? `오답 ${wn} · ★${S.star.length}` : '자동 저장', !pro)}
      </div>
    </div>

    <div class="b-pass"><div class="sec">합격 예측 <button class="sec-link" onclick="reportPage()">리포트 ›</button></div>${passCard()}</div>
    ${OX.length ? `<div class="b-ox"><div class="sec">오늘의 OX 한 문제</div>${dailyOx()}</div>` : ''}

    <div class="b-more"><div class="sec">더 보기</div>
      <div class="card list mlist">
        <button class="li" onclick="examInfoSheet()"><span class="ico">${badge(C, 30)}</span>${esc(C.short)} 시험 안내<span class="r">${C.info.count}문항 · ${C.info.minutes}분 ›</span></button>
        <button class="li" onclick="faqPage()"><span class="ico">${IC.faq()}</span>이용 안내 · FAQ<span class="r">›</span></button>
        <button class="li" onclick="go('certs')"><span class="ico">${IC.cert()}</span>다른 자격증<span class="r">${SOON.map(c => c.short).join('·')} 준비 중 ›</span></button>

      </div>
    </div>
    <div class="foot b-foot">${policyLinks()}더오를패스 · 자격증 CBT<br>※ 시제품이에요. 결제는 실제로 진행되지 않아요.</div>
  </div>`;
  $app.classList.add('wide'); tabbar(); checkBadges(); setTimeout(reviewPopup, 900);
}
function examInfoSheet() { openSheet(`<div class="eh" style="display:flex;gap:12px;align-items:center;margin-bottom:14px">${badge(C, 48)}<div><h3 style="margin:0">${esc(C.name)}</h3><div class="p" style="margin:2px 0 0">${esc(C.info.org)} 주관 · ${esc(C.info.eligibility)}</div></div></div>
  <div class="card examinfo" style="background:var(--bg);box-shadow:none"><div class="eg"><div><b>${C.info.count}</b>문항</div><div><b>${C.info.minutes}</b>분</div><div><b>${esc(C.info.format.replace(/[^0-9]/g, '') || C.info.format)}</b>${C.info.format.replace(/[0-9]/g, '')}</div></div>
  <div class="er"><span class="ok">합격</span>전체 정답률 <b>${PASS.total}% 이상</b><br><span class="no">과락</span>과목별 정답률 <b>${PASS.sub}% 미만</b></div></div>
  ${SK.map(s => `<div class="feat"><span class="ck">${s}</span><span>${esc(SUBJ_FULL[s])}${C.dist ? ` · ${C.dist[s]}문항` : ''}</span></div>`).join('')}
  <div class="note">※ 접수·일정은 ${esc(C.info.org)} 공고를 꼭 확인하세요</div>
  <button class="btn" style="width:100%;margin-top:12px" onclick="closeSheet()">확인</button>`); }

function passCard() {
  const rate = S.solved ? Math.round(S.correct / S.solved * 100) : null, T = PASS.total, M = PASS.sub;
  const sub = SK.map(s => ({ s, a: acc(s) })), cut = sub.some(x => x.a !== null && x.a < M);
  const st = rate === null ? ['아직 몰라요', 'var(--gray)', '문제를 풀면 합격 가능성을 알려 드려요', 'var(--bg)'] : rate >= T && !cut ? ['합격권', 'var(--green)', '지금 실력이면 합격선을 넘어요', 'var(--green-soft)'] : cut ? ['과락 주의', 'var(--red)', M + '% 미만 과목이 있어요', 'var(--red-soft)'] : ['조금 더', 'var(--orange)', `합격선까지 ${T - rate}%p 남았어요`, 'var(--orange-soft)'];
  const wk = weakest();
  const pp = S.solved >= 10 ? passProb().p : null;
  return `<div class="card pass"><button class="pp-row" onclick="reportPage()"><div class="pp-g">${gaugeSVG(pp || 0, false)}<b>${pp === null ? '?' : pp + '%'}</b></div><div class="grow"><div class="t">합격 확률 (추정)</div><div class="d">${pp === null ? `${10 - S.solved}문제 더 풀면 예측이 열려요` : '정답률·풀이 속도·과락까지 반영한 추정치'}</div></div><span class="chev" aria-hidden="true">›</span></button>
    ${sub.map(({ s, a }) => `<div class="bar"><span class="nm">${SUBJ[s]} <span style="color:var(--gray);font-weight:500">${SUBJ_SHORT[s]}</span></span><span class="tr cutline" style="--cut:${M}%"><i style="width:${a || 0}%;${a !== null && a < M ? 'background:var(--red)' : a !== null && a < T ? 'background:var(--orange)' : ''}"></i></span><span class="v">${a === null ? '-' : a + '%'}</span></div>`).join('')}
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gray);margin-top:2px"><span>┆ 표시는 과락선 ${M}%</span>${wk && wk.a < 100 ? `<a style="color:var(--blue);font-weight:700;cursor:pointer;font-size:13px" onclick="${isPro() ? 'startWeak()' : "paywall('weak')"}">${SUBJ[wk.s]} 약점 집중 ›</a>` : ''}</div>
  </div>`;
}

/* 오늘의 OX */
function doxIdx() { const k = dkey() + C.id; return [...k].reduce((a, c) => a + c.charCodeAt(0), 0) % OX.length; }
function dailyOx() { const idx = doxIdx(), x = OX[idx], done = S.dox && S.dox.d === dkey(), ok = done && S.dox.v === x.a;
  return `<div class="card dox"><div class="hd"><span class="tag free">${SUBJ[x.s]}</span><span style="font-size:13px;color:var(--gray);font-weight:600">매일 새 문제</span></div>
  <div class="dst">${esc(x.t)}</div>
  <div class="bt"><button class="o ${done && S.dox.v === true ? 'hit' : ''}" ${done ? 'disabled' : ''} onclick="doxAns(true)">O</button><button class="x ${done && S.dox.v === false ? 'hit' : ''}" ${done ? 'disabled' : ''} onclick="doxAns(false)">X</button></div>
  ${done ? `<div class="res" style="background:${ok ? 'var(--green-soft)' : 'var(--red-soft)'}"><b style="color:${ok ? 'var(--green)' : 'var(--red)'}">${ok ? '정답이에요!' : '아쉬워요 · 정답 ' + (x.a ? 'O' : 'X')}</b> ${esc(x.e)}</div>
   ${isPro() ? `<button class="lock" style="background:var(--blue-soft);color:var(--blue)" onclick="startOx(0)"><span>OX 선지 ${OX.length}개 이어서 풀기</span><span>›</span></button>` : `<button class="lock" onclick="paywall('ox')"><span>${IC.lock()} OX 선지 ${OX.length}개 더 풀어보기</span><span>›</span></button>`}` : ''}</div>`; }
function doxAns(v) { const idx = doxIdx(), x = OX[idx]; S.dox = { d: dkey(), v }; record(x.s, v === x.a); if (v !== x.a && !S.wrongOx.includes(idx)) S.wrongOx.push(idx); save(); home(); }


function todayWrong() { return S.tw && S.tw.d === dkey() ? S.tw.ids.filter(id => Q[id] && S.wrong.includes(id)) : []; }
function twCard() { const t = todayWrong(); if (!t.length) return ''; return `<button class="twc" onclick="startQuiz(todayWrong().map(id => Object.assign({ id }, Q[id])), '오늘 틀린 문제', 'explain')"><span class="twi">${IC.note()}</span><div class="grow"><div class="t">오늘 틀린 ${t.length}문제, 잊기 전에 한 번 더</div><div class="d">지금 다시 풀면 기억이 훨씬 오래가요 · 무료</div></div><span class="twb">다시 풀기</span></button>`; }
