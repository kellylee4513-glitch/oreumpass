/* [stats/predict.js] 통계: 풀이 속도·단원 통계 · 합격 확률 · 맞춤 문제집 · 리포트 */
/* ===== 초개인화: 속도·단원 통계 · 합격 확률 · 맞춤 문제집 ===== */
const unitKey = q => q.s + '|' + (q.sec || '');
const unitName = q => q.sec || SUBJ_SHORT[q.s] + ' 종합';
function speedHit(ms) { if (!ms || ms < 800) return; S.spd = S.spd || { n: 0, ms: 0 }; S.spd.n++; S.spd.ms += Math.min(ms, 300000); }
function avgSec() { const s = S.spd; return s && s.n >= 3 ? Math.round(s.ms / s.n / 1000) : null; }
function unitAcc(uk) { const o = (S.ustat || {})[uk]; return o && o.t ? o.c / o.t : null; }
function randG(k) { if (k < 1) return randG(k + 1) * Math.pow(Math.random(), 1 / k); const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d); for (;;) { let x, v; do { const u1 = Math.random(), u2 = Math.random(); x = Math.sqrt(-2 * Math.log(u1 || 1e-9)) * Math.cos(2 * Math.PI * u2); v = 1 + c * x; } while (v <= 0); v = v * v * v; const u = Math.random(); if (u < 1 - 0.0331 * x * x * x * x || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v; } }
function randBeta(a, b) { const x = randG(a), y = randG(b); return x / (x + y); }
function passProb() {
  const dist = C.dist || Object.fromEntries(SK.map(s => [s, Math.round(C.info.count / SK.length)])), n = S.solved, sp = avgSec(), lim = C.secPerQ || Math.round(C.info.minutes * 60 / C.info.count);
  const reach = sp && sp > lim ? lim / sp : 1, T = PASS.total / 100, Mn = PASS.sub / 100, N = 2500;
  const tot = Object.values(dist).reduce((a, b) => a + b, 0); let pass = 0; const sums = {}; SK.forEach(s => sums[s] = 0);
  for (let i = 0; i < N; i++) { let score = 0, ok = true;
    for (const s of SK) { const o = S.subj[s] || { t: 0, c: 0 }, p = randBeta(o.c + 2, o.t - o.c + 2) * reach, m = dist[s] || 0; let k = 0; for (let j = 0; j < m; j++) if (Math.random() < p) k++; score += k; sums[s] += k / (m || 1); if (m && k / m < Mn) ok = false; }
    if (ok && score / tot >= T) pass++; }
  return { p: Math.round(pass / N * 100), n, sp, lim, reach, conf: n < 20 ? 0 : n < 60 ? 1 : 2, subs: SK.map(s => ({ s, est: Math.round(sums[s] / N * 100), q: dist[s] })) };
}
function weakUnits() { const m = new Map(); pool(0).forEach(q => { const k = unitKey(q); if (!m.has(k)) m.set(k, { k, name: unitName(q), s: q.s, n: 0 }); m.get(k).n++; }); return [...m.values()].map(u => { const o = (S.ustat || {})[u.k]; return Object.assign(u, { t: o ? o.t : 0, a: o && o.t ? Math.round(o.c / o.t * 100) : null }); }).filter(u => u.t >= 2).sort((a, b) => a.a - b.a); }
function buildCustom() {
  const due = new Set(dueIds()), srs = S.srs || {};
  const sc = pool(0).map(q => { const ua = unitAcc(unitKey(q)); let w = 1 - (ua === null ? 0.5 : ua); if (S.wrong.includes(q.id)) w += 1; if (due.has(q.id)) w += 0.8; if (!S.seen.includes(q.id) && ua !== null && ua < PASS.total / 100) w += 0.4; if (srs[q.id] && srs[q.id].b >= 3) w -= 0.8; if ((S.why || {})[q.id] === 'concept') w += 0.3; return { q, w: w + Math.random() * 0.15 }; });
  return sc.sort((a, b) => b.w - a.w).slice(0, 20).map(x => x.q);
}
function startCustom() { if (!isPro()) { paywall('weak'); return; } if (S.solved < 5) { toast('5문제 이상 풀면 내 약점을 분석해 드려요'); startToday(); return; } modeSheet(buildCustom(), '내 약점 맞춤 문제집'); }

function gaugeSVG(p, big) { const r = big ? 86 : 40, w = r * 2 + 24, sw = big ? 16 : 9, L = Math.PI * r, col = p >= 70 ? '#00B862' : p >= 40 ? '#FF9500' : '#F04452';
  return `<svg viewBox="0 0 ${w} ${r + sw}" width="${w}" height="${r + sw}"><path d="M${12} ${r + sw / 2}a${r} ${r} 0 0 1 ${2 * r} 0" fill="none" stroke="#EEF0F3" stroke-width="${sw}" stroke-linecap="round"/><path d="M${12} ${r + sw / 2}a${r} ${r} 0 0 1 ${2 * r} 0" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - p / 100)}" class="gArc"/></svg>`; }
function reportPage() {
  markNav(); window.scrollTo(0, 0); $app.classList.remove('wide');
  if (S.solved < 20) { $app.innerHTML = topBar('합격 예측 리포트') + `<div class="pad"><div class="card" style="text-align:center;padding:30px 20px"><div class="e" style="width:72px;height:72px;margin:0 auto 10px">${IC.target()}</div><div style="font-size:19px;font-weight:800">${20 - S.solved}문제만 더 풀면 열려요</div><div style="color:var(--gray);font-size:14px;margin-top:6px;line-height:1.6">정확한 예측을 위해 최소 20문제의<br>정답률과 풀이 속도가 필요해요</div><div class="ub" style="margin:18px auto 0;max-width:240px"><i style="width:${S.solved / 20 * 100}%"></i></div><button class="btn" style="margin-top:18px;width:100%" onclick="startToday()">문제 풀러 가기</button></div></div>`; tabbar(); return; }
  const r = passProb(), W = weakUnits().slice(0, 3), T = PASS.total, M = PASS.sub, cov = Math.round(S.seen.length / Q.length * 100);
  const msg = r.p >= 80 ? '지금 시험 봐도 합격 가능성이 높아요' : r.p >= 50 ? '합격선 근처예요. 약점만 잡으면 돼요' : r.p >= 20 ? '조금만 더 오르면 합격권이에요' : '지금은 기초를 쌓을 때예요';
  $app.innerHTML = topBar('합격 예측 리포트') + `<div class="pad">
    <div class="card rp-h"><div class="rp-g">${gaugeSVG(r.p, true)}<div class="rp-n"><b>${r.p}</b><small>%</small></div></div>
      <div class="rp-k">지금 시험 보면 합격 확률</div><div class="rp-m">${msg}</div>
      <span class="rp-c c${r.conf}">${['데이터 부족', '참고용 · 문제를 더 풀수록 정확해져요', '신뢰도 높음'][r.conf]}</span></div>
    <div class="sec">과목별 예상 점수</div>
    <div class="card">${r.subs.map(x => `<div class="bar"><span class="nm">${SUBJ[x.s]} <span style="color:var(--gray);font-weight:500">${x.q}문항</span></span><span class="tr cutline" style="--cut:${M}%"><i style="width:${x.est}%;${x.est < M ? 'background:var(--red)' : x.est < T ? 'background:var(--orange)' : ''}"></i></span><span class="v">${x.est}점</span></div>`).join('')}<div style="font-size:12px;color:var(--gray);margin-top:4px">실제 시험 배점(${r.subs.map(x => x.q).join('·')}문항)으로 2,500번 모의 시험을 돌린 결과예요</div></div>
    <div class="row"><div class="card"><div class="lbl">평균 풀이 속도</div><div class="val">${r.sp === null ? '-' : r.sp}<small>초</small></div><div class="rp-s ${r.sp && r.sp > r.lim ? 'no' : 'ok'}">${r.sp === null ? '아직 측정 중' : r.sp > r.lim ? `시험 기준 ${r.lim}초보다 느려요` : `시험 기준 ${r.lim}초 안이에요`}</div></div><div class="card"><div class="lbl">학습 범위</div><div class="val">${cov}<small>%</small></div><div class="rp-s ${cov < 50 ? 'no' : 'ok'}">문제은행 ${S.seen.length}/${Q.length}</div></div></div>
    <div class="sec">집중해야 할 단원</div>
    <div class="card" style="padding:6px 20px">${W.length ? W.map((u, i) => `<div class="tw"><span class="rk ${i === 0 ? 'top' : ''}">${i + 1}</span><div class="grow"><div class="t">${esc(u.name)}</div><div class="d">${SUBJ[u.s]} · ${u.t}번 풀이</div></div><span class="wr" style="color:${u.a < M ? 'var(--red)' : u.a < T ? 'var(--orange)' : 'var(--green)'}">${u.a}%</span></div>`).join('') : '<div class="soon">단원마다 2문제 이상 풀면 분석돼요</div>'}</div>
    <button class="upsell" style="margin-top:16px" onclick="startCustom()"><div class="deco">${IC.target()}</div><div class="t">내 약점만 모은<br>맞춤 문제집 20문항</div><div class="d">약한 단원·틀린 문제·잊을 때가 된 문제로 자동 구성</div><span class="go">${isPro() ? '' : IC.lock() + ' '}맞춤 문제집 풀기</span></button>
    <div class="note" style="margin-top:12px">예측은 지금까지의 정답률과 풀이 속도로 계산한 추정치예요. 실제 시험 결과를 보장하지 않아요.</div>
  </div>`; tabbar();
}

