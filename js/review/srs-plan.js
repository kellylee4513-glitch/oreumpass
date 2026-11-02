/* [review/srs-plan.js] 오답 관리: 간격 반복(SRS) · 오늘의 학습 플랜 */
/* ===== 간격 반복(SRS) · 오늘의 학습 플랜 · 오답 원인 · 개념 카드 ===== */
const SRS_INT = [1, 3, 7, 15, 30];
function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return dkey(d); }
function srsHit(id, ok) { S.srs = S.srs || {}; const o = S.srs[id] || { b: 0, d: '' }; if (ok) { o.b = Math.min(o.b + (o.d ? 1 : 2), SRS_INT.length - 1); o.d = addDays(SRS_INT[o.b]); } else { o.b = 0; o.d = addDays(1); } S.srs[id] = o; }
function dueIds() { const t = dkey(), m = S.srs || {}; return Object.keys(m).map(Number).filter(id => Q[id] && m[id].d && m[id].d <= t).sort((a, b) => m[a].b - m[b].b); }
function planToday() {
  const dd = dday(), remain = Q.length - S.seen.length;
  const nNew = Math.min(remain, dd && dd > 0 ? Math.max(5, Math.ceil(remain / dd)) : S.goal);
  const due = dueIds(); return { nNew, due, nDue: Math.min(due.length, 30), done: today() };
}
function planCard() {
  const p = planToday(), pro = isPro(), target = p.nNew + (pro ? p.nDue : 0), pct = target ? Math.min(1, p.done / target) : 1;
  return `<div class="plan-c">
    <div class="pc-h"><div><div class="pc-k">오늘의 학습 플랜 ${streak() ? `<span class="pc-st">${IC.flame()}${streak()}일 연속</span>` : '<span class="pc-st">오늘이 1일째</span>'}</div><div class="pc-t">${target ? `${target}문제면 오늘 할 일 끝` : '오늘 할 일을 다 했어요!'}</div></div><div class="pc-r"><svg viewBox="0 0 44 44" width="44" height="44"><circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,.18)" stroke-width="5" fill="none"/><circle cx="22" cy="22" r="18" stroke="#F3D27A" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 18}" stroke-dashoffset="${2 * Math.PI * 18 * (1 - pct)}" transform="rotate(-90 22 22)"/></svg><b>${Math.round(pct * 100)}%</b></div></div>
    <div class="pc-list">
      <div class="pc-i"><span class="d1">NEW</span><div class="grow">새 문제<small>${S.exam ? '시험일까지 1회독 페이스' : '하루 목표 기준'}</small></div><b>${p.nNew}</b></div>
      <div class="pc-i ${pro ? '' : 'lk'}"><span class="d2">복습</span><div class="grow">잊을 때쯤 다시 보기<small>1·3·7·15·30일 뒤 다시 출제</small></div>${pro ? `<b>${p.nDue}</b>` : `<span class="tag pro">${IC.lock()} PRO</span>`}</div>
      <button class="pc-i dq" onclick="startDaily()"><span class="d1">5분</span><div class="grow">오늘의 5분 퀴즈<small>매일 새로 바뀌는 5문제</small></div>${S.dq && S.dq.d === dkey() ? `<b>${S.dq.s}/5 ✓</b>` : '<b>›</b>'}</button>
    </div>
    <div class="pc-f"><button class="pc-gl" onclick="goalSheet()">하루 목표 ${S.goal}문제 · 오늘 ${p.done}문제 풀었어요 <u>변경</u></button><button class="pc-go" onclick="startToday()">${p.done ? '이어서 학습하기' : '오늘 학습 시작'}</button></div>
  </div>`;
}
function startToday() { closeSheet();
  const p = planToday(), pro = isPro();
  const fresh = shuffle(pool(0).filter(q => !S.seen.includes(q.id))).slice(0, p.nNew);
  const rev = pro ? p.due.slice(0, 30).map(id => Object.assign({ id }, Q[id])) : [];
  let items = []; const a = rev.slice(), b = fresh.slice(); while (a.length || b.length) { if (a.length) items.push(a.shift()); if (b.length) items.push(b.shift()); if (b.length) items.push(b.shift()); }
  if (!items.length) { items = shuffle(pool(0)).slice(0, 10); toast('오늘 할 일을 다 했어요. 보너스 10문제예요'); }
  startQuiz(items, '오늘의 학습', 'explain');
}

