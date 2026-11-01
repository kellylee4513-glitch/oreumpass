/* [screens/home.js] 홈 화면 · 합격 예측 카드 · 오늘의 OX */
/* ===== 홈 ===== */
function home() {
  const dd = dday(), td = today(), g = S.goal, pct = Math.min(1, td / g), st = streak(), wn = S.wrong.length + S.wrongOx.length, seen = S.seen.length, remain = Q.length - seen;
  const week = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d; });
  const wk = weakest(), pro = isPro();
  const subj = `<button class="tile" onclick="subjectSheet()"><span class="tag free">무료</span><div class="ico">${IC.subject()}</div><div class="t">과목·단원별 풀기</div><div class="d">단원을 골라 여러 개 함께</div></button>`;
  const note = `<button class="tile ${pro ? '' : 'locked'}" onclick="go('note')">${pro ? '' : `<span class="tag pro">${IC.lock()}</span>`}<div class="ico">${IC.note()}</div><div class="t">오답노트 · 북마크</div><div class="d">${wn || S.star.length ? `틀린 문제 ${wn} · 북마크 ${S.star.length}` : '틀린 문제가 자동으로 모여요'}</div></button>`;
  $app.innerHTML = brandBar() + `
  <div class="pad hgrid">
    <div class="b-greet"><div class="h1">${G.name ? esc(G.name) + '님, ' : ''}${esc(C.short)} 자격증 합격까지<br>오늘도 한 계단 <em>더 오를</em> 차례!</div>
    ${showInstall() ? `<button class="menu install" onclick="installGuide()"><img src="icon-192.png" alt="" onerror="this.remove()"><div class="grow"><div class="t">홈 화면에 앱 추가하기</div><div class="d">아이콘 한 번이면 바로 문제 풀기</div></div><span class="x" onclick="event.stopPropagation();G.installHidden=true;save();home()">✕</span></button>` : ''}</div>
    <div class="b-hero"><div class="hero">
      ${heroArt(seen / Q.length)}
      <button class="set" onclick="examSheet()">${S.exam ? '변경' : '시험일 설정'}</button>
      <div class="k">${esc(C.name)} 시험까지</div>
      <div class="dd">${dd === null ? 'D-?' : dd > 0 ? 'D-' + dd : dd === 0 ? 'D-DAY' : '시험 끝!'}</div>
      <div class="m">${dd === null ? '시험일을 정하면 하루 목표를 계산해 드려요' : dd > 0 ? (remain > 0 ? `하루 ${Math.max(1, Math.ceil(remain / dd))}문제씩이면 1회독 완료` : '1회독 완료! 이제 오답 복습할 차례') : dd === 0 ? '지금까지 푼 문제를 믿어요!' : '수고 많으셨어요'}</div>
      <div class="bank"><div class="tr"><i style="width:${seen / Q.length * 100}%"></i></div><div class="tx">문제은행 ${seen} / ${Q.length} 풀었어요</div></div>
    </div></div>
    <div class="b-goal"><div class="card gcard">
      <div class="gh"><div class="gt">오늘의 목표</div><button class="gbtn" onclick="goalSheet()"><svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 20h4l10-10-4-4L4 16v4z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>목표 변경</button></div>
      <div class="gb">
        <div class="ring"><svg width="64" height="64"><circle cx="32" cy="32" r="27" stroke="#EEF0F3" stroke-width="7" fill="none"/><circle cx="32" cy="32" r="27" stroke="${pct >= 1 ? '#00C471' : '#3182F6'}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 27}" stroke-dashoffset="${2 * Math.PI * 27 * (1 - pct)}"/></svg><b>${Math.round(pct * 100)}%</b></div>
        <div class="grow"><div class="gv">${td}<small> / ${g}문제</small></div><div class="gs">${pct >= 1 ? '오늘 목표 달성! 🎉' : `목표까지 ${g - td}문제 남았어요`}</div></div>
        <div class="gst">${IC.flame()}<div><b>${st}</b>일</div><small>연속</small></div>
      </div>
      <div class="gw"><span>이번 주</span><div class="streak">${week.map(d => { const k = dkey(d), on = !!S.days[k], t = k === dkey(); return `<div><i class="${on ? 'on' : ''} ${t ? 'today' : ''}">${on ? IC.flame() : ''}</i>${'일월화수목금토'[d.getDay()]}</div>`; }).join('')}</div></div>
    </div></div>

    <div class="b-plan">${planCard()}</div>
    <div class="b-play"><div class="sec">문제 풀기</div>
    <div class="grid2 g3">
      <button class="tile" onclick="startMock()"><span class="tag free">무료</span><div class="ico">${IC.exam()}</div><div class="t">실전 모의고사</div><div class="d">${Q.length}문항 · 실제 시험 시간 비율</div></button>
      <button class="tile" onclick="startQuick()"><span class="tag free">무료</span><div class="ico">${IC.quick()}</div><div class="t">빠른 10문제</div><div class="d">안 푼 문제부터 5분</div></button>
      ${subj}
    </div>
    <div class="grid2 g2b"><button class="menu" onclick="setPage()"><div class="ico">${IC.sets()}</div><div class="grow"><div class="t">세트별 실전 문제</div><div class="d">${SET_N}문항씩 ${setsOf().length}세트 · 점수 기록</div></div><span class="chev">›</span></button><button class="menu" onclick="bankPage()"><div class="ico">${IC.bank()}</div><div class="grow"><div class="t">문제은행 검색</div><div class="d">전체 ${Q.length}문항 · 키워드·상태로 찾기</div></div><span class="chev">›</span></button><button class="menu" onclick="cardPage()"><div class="ico">${IC.book()}</div><div class="grow"><div class="t">1분 개념 카드</div><div class="d">핵심 개념 ${Q.filter(q => q.c).length}장 · 뒤집어 외우기</div></div><span class="chev">›</span></button><button class="menu" onclick="notePage()"><div class="ico">${IC.note()}</div><div class="grow"><div class="t">단권화 요약 노트</div><div class="d">단원별 핵심·공식·암기 팁 한곳에</div></div><span class="chev">›</span></button></div></div>

    <div class="b-rev"><div class="sec"><span>맞춤 복습<span class="pro">PRO</span></span></div>
    <div class="grid2 g3">
      <button class="tile ${pro ? '' : 'locked'}" onclick="${pro ? 'startOx(0)' : "paywall('ox')"}">${pro ? '' : `<span class="tag pro">${IC.lock()}</span>`}<div class="ico">${IC.ox()}</div><div class="t">OX 선지 퀴즈</div><div class="d">선지 ${OX.length}개 빠른 복습</div></button>
      <button class="tile ${pro ? '' : 'locked'}" onclick="startCustom()">${pro ? '' : `<span class="tag pro">${IC.lock()}</span>`}<div class="ico">${IC.target()}</div><div class="t">내 약점 맞춤 문제집</div><div class="d">약한 단원·틀린 문제로 20문항 자동 구성</div></button>
      ${note}
    </div></div>

    ${OX.length ? `<div class="b-ox"><div class="sec">오늘의 OX 한 문제</div>${dailyOx()}</div>` : ''}

    <div class="b-pass"><div class="sec">합격 예측 <a onclick="reportPage()">리포트 ›</a></div>
    ${passCard()}</div>

    <div class="b-info"><div class="sec">시험 안내</div>
    <div class="card examinfo">
      <div class="eh">${badge(C, 48)}<div class="grow"><div style="font-size:17px;font-weight:800">${esc(C.name)}</div><div style="font-size:13px;color:var(--gray);margin-top:2px">${esc(C.info.org)} 주관 · ${esc(C.info.eligibility)}</div></div></div>
      <div class="eg"><div><b>${C.info.count}</b>문항</div><div><b>${C.info.minutes}</b>분</div><div><b>${esc(C.info.format.replace(/[^0-9]/g, '') || C.info.format)}</b>${C.info.format.replace(/[0-9]/g, '')}</div></div>
      <div class="er"><span class="ok">합격</span>전체 정답률 <b>${PASS.total}% 이상</b><br><span class="no">과락</span>과목별 정답률 <b>${PASS.sub}% 미만</b></div>
      <div style="font-size:12px;color:var(--gray);margin-top:10px">※ 접수·일정은 ${esc(C.info.org)} 공고를 꼭 확인하세요</div>
    </div></div>

    <div class="b-more"><div class="sec dsec">더 보기</div>
    <button class="menu" onclick="faqPage()"><div class="ico">${IC.faq()}</div><div class="grow"><div class="t">이용 안내 · 자주 묻는 질문</div><div class="d">무료·PRO 차이, 풀이 모드, 기록 저장 방법</div></div><span class="chev">›</span></button>
    <button class="menu" onclick="certPicker()"><div class="ico">${IC.cert()}</div><div class="grow"><div class="t">다른 자격증도 준비 중이에요</div><div class="d">${SOON.map(c => c.short).join('·')} 곧 열려요 · 기록은 자격증별로 따로 저장돼요</div></div><span class="chev">›</span></button>
    <a class="promo" href="${PDF_LINK}" target="_blank" rel="noopener">${bookArt()}<div class="grow"><div class="t">헷갈리는 개념은 정리본으로</div><div class="d">시험에 나오는 수치·공식만 모은<br>더오를 ${esc(C.short)} 핵심 정리본 PDF</div></div><span class="chev" style="color:#6B7684">›</span></a></div>
    <div class="foot b-foot">${policyLinks()}더오를패스 · 자격증 CBT<br>※ 시제품이에요. 결제는 실제로 진행되지 않아요.</div>
  </div>`;
  $app.classList.add('wide'); tabbar(); checkBadges(); setTimeout(reviewPopup, 900);
}

function passCard() {
  const rate = S.solved ? Math.round(S.correct / S.solved * 100) : null, T = PASS.total, M = PASS.sub;
  const sub = SK.map(s => ({ s, a: acc(s) })), cut = sub.some(x => x.a !== null && x.a < M);
  const st = rate === null ? ['아직 몰라요', 'var(--gray)', '문제를 풀면 합격 가능성을 알려 드려요', 'var(--bg)'] : rate >= T && !cut ? ['합격권', 'var(--green)', '지금 실력이면 합격선을 넘어요', 'var(--green-soft)'] : cut ? ['과락 주의', 'var(--red)', M + '% 미만 과목이 있어요', 'var(--red-soft)'] : ['조금 더', 'var(--orange)', `합격선까지 ${T - rate}%p 남았어요`, 'var(--orange-soft)'];
  const wk = weakest();
  const pp = S.solved >= 20 ? passProb().p : null;
  return `<div class="card pass"><button class="pp-row" onclick="reportPage()"><div class="pp-g">${gaugeSVG(pp || 0, false)}<b>${pp === null ? '?' : pp + '%'}</b></div><div class="grow"><div class="t">합격 확률 (추정)</div><div class="d">${pp === null ? `${20 - S.solved}문제 더 풀면 예측이 열려요` : '정답률·풀이 속도·과락까지 반영한 추정치'}</div></div><span class="chev">›</span></button>
    <div style="display:flex;align-items:flex-end;justify-content:space-between"><div><div class="lbl">현재 정답률</div><div class="val" style="font-size:30px">${rate === null ? '-' : rate}<small>%</small></div></div><div style="text-align:right"><span class="tag" style="background:${st[3]};color:${st[1]};font-size:13px">${st[0]}</span><div style="font-size:13px;color:var(--gray);margin-top:6px">${st[2]}</div></div></div>
    <div class="gauge"><i style="width:${rate || 0}%;background:${st[1]}"></i><span class="mk" style="left:${T}%"><em>합격 ${T}</em></span></div>
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

