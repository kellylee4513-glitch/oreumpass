/* [stats/study.js] 통계: 기록 탭 */
/* ===== 기록 ===== */
function studyTab() { const rate = S.solved ? Math.round(S.correct / S.solved * 100) : 0, T = PASS.total, M = PASS.sub;
  const others = READY.filter(c => c.id !== C.id && G.data[c.id] && G.data[c.id].solved);
  $app.innerHTML = brandBar() + `<div class="pad">
    <div class="h1" style="margin-bottom:14px">${esc(C.short)} 학습 기록</div>
    <div class="row"><div class="card"><div class="lbl">푼 문제</div><div class="val">${S.solved}<small>문제</small></div></div><div class="card"><div class="lbl">정답률</div><div class="val">${rate}<small>%</small></div></div></div>
    <div class="row"><div class="card"><div class="lbl">연속 학습</div><div class="val fl" style="justify-content:flex-start">${IC.flame()}${streak()}<small>일</small></div></div><div class="card"><div class="lbl">문제은행</div><div class="val">${S.seen.length}<small>/ ${Q.length}</small></div></div></div>
    <div class="sec">과목별 정답률</div>
    <div class="card">${SK.map(s => { const a = acc(s), o = S.subj[s]; return `<div class="bar"><span class="nm">${SUBJ[s]}${a !== null && a < T ? '<span class="weak">' + (a < M ? '과락' : T + ' 미만') + '</span>' : ''}</span><span class="tr"><i style="width:${a || 0}%;${a !== null && a < M ? 'background:var(--red)' : a !== null && a < T ? 'background:var(--orange)' : ''}"></i></span><span class="v">${a === null ? '-' : a + '%'}</span></div><div style="font-size:13px;color:var(--gray);margin:-6px 0 6px">${esc(SUBJ_FULL[s])} · ${o.c}/${o.t}</div>`; }).join('')}</div>
    <button class="menu" style="margin-top:14px" onclick="reportPage()"><div class="ico">${IC.target()}</div><div class="grow"><div class="t">합격 예측 리포트</div><div class="d">합격 확률 · 과목별 예상 점수 · 집중할 단원</div></div><span class="chev" aria-hidden="true">›</span></button>
    ${badgeHTML()}
    ${whyStatsHTML()}
    ${topWrongHTML()}
    <div class="sec">최근 풀이</div>
    <div class="card" style="padding:4px 20px">${S.hist.length ? S.hist.slice(0, 10).map(h => { const p = Math.round(h.s / h.t * 100); return `<div class="hist"><div class="grow"><div class="t">${esc(h.l)}</div><div class="d">${h.d.slice(5).replace('-', '.')} · ${h.t}문제${h.ms ? ' · ' + fmt(h.ms) : ''}</div></div><div class="s" style="color:${p >= T ? 'var(--blue)' : 'var(--red)'}">${p}점</div></div>`; }).join('') : `<div class="empty"><div class="e">${IC.climb()}</div>아직 기록이 없어요<br>문제를 풀면 여기에 쌓여요</div>`}</div>
    ${others.length ? `<div class="sec">다른 자격증</div>${others.map(c => { const d = G.data[c.id]; return `<button class="cc" onclick="pickCert('${c.id}')">${badge(c, 40)}<div class="grow"><div class="t">${esc(c.name)}</div><div class="d">${d.solved}문제 · 정답률 ${Math.round(d.correct / d.solved * 100)}%</div></div><span class="chev" aria-hidden="true">›</span></button>`; }).join('')}` : ''}
  </div>`; tabbar(); }

