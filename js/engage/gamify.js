/* [engage/gamify.js] 게이미피케이션: 5분 퀴즈 · 배지 · 복습 알림 · 애니메이션 */
/* ===== 게이미피케이션: 오늘의 5분 퀴즈 · 배지 · 복습 알림 ===== */
function seedRand(seed) { let x = seed % 2147483647; if (x <= 0) x += 2147483646; return () => (x = x * 16807 % 2147483647) / 2147483647; }
function dailyItems() { const k = dkey() + C.id, r = seedRand([...k].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0); return pool(0).map(q => [r(), q]).sort((a, b) => a[0] - b[0]).slice(0, 5).map(x => x[1]); }
function startDaily() { startQuiz(dailyItems(), '오늘의 5분 퀴즈', 'explain'); run.daily = true; }
const BADGES = [
  ['s3', '3일 연속', '3일 연속 공부했어요', () => streak() >= 3], ['s7', '일주일 개근', '7일 연속 공부했어요', () => streak() >= 7], ['s10', '10일 불꽃', '10일 연속 공부했어요', () => streak() >= 10], ['s30', '한 달 완주', '30일 연속 공부했어요', () => streak() >= 30],
  ['q10', '첫걸음', '10문제를 풀었어요', () => S.solved >= 10], ['q50', '탄력 받는 중', '50문제를 풀었어요', () => S.solved >= 50], ['q100', '백 문제 돌파', '100문제를 풀었어요', () => S.solved >= 100], ['q300', '문제은행 정복자', '300문제를 풀었어요', () => S.solved >= 300],
  ['pass', '합격권 진입', '모의고사·세트에서 합격선을 넘었어요', () => (S.hist || []).some(h => h.t >= 10 && h.s / h.t * 100 >= PASS.total)], ['card', '개념 수집가', '개념 카드 20장을 외웠어요', () => (S.cardOk || []).length >= 20],
  ['why', '자기 분석가', '틀린 이유를 10번 기록했어요', () => Object.values(S.why || {}).filter(Boolean).length >= 10], ['daily', '5분의 기적', '오늘의 5분 퀴즈를 끝냈어요', () => !!S.dq]];
function checkBadges(silent) { S.badges = S.badges || {}; const got = []; BADGES.forEach(([id, n, d, f]) => { try { if (!S.badges[id] && f()) { S.badges[id] = dkey(); got.push(n); } } catch (e) {} }); if (got.length) { save(); if (!silent) setTimeout(() => toast('🏅 배지 획득: ' + got.join(', ')), 600); } }
function badgeHTML() { const b = S.badges || {}, n = Object.keys(b).length; return `<div class="sec">획득한 배지 <span style="font-size:14px;color:var(--gray);font-weight:600">${n} / ${BADGES.length}</span></div><div class="bdg">${BADGES.map(([id, nm, d]) => `<div class="bg ${b[id] ? 'on' : ''}" title="${d}"><div class="bi">${b[id] ? IC.medal() : IC.lock()}</div><div class="bn">${nm}</div><div class="bd">${b[id] ? b[id].slice(5).replace('-', '.') + ' 획득' : d}</div></div>`).join('')}</div>`; }
function reviewPopup() {
  const due = dueIds(); if (!due.length || S.popDay === dkey() || document.getElementById('sheet').classList.contains('show')) return;
  S.popDay = dkey(); save();
  openSheet(`<div class="hi">${IC.climb()}</div><h3>잊기 직전인 문제가<br>${due.length}개 돌아왔어요</h3><div class="p">틀렸던 문제를 1·3·7·15·30일 간격으로 다시 보여 드려요. 지금 풀면 기억이 훨씬 오래가요.</div>
    ${isPro() ? `<button class="btn" style="width:100%;margin-top:6px" onclick="closeSheet();startReview()">지금 ${Math.min(due.length, 30)}문제 복습하기</button>` : `<button class="btn" style="width:100%;margin-top:6px" onclick="closeSheet();paywall('wrong')">${IC.lock()} PRO로 복습 열기</button>`}
    <button class="btn ghost" style="width:100%;margin-top:8px" onclick="closeSheet()">나중에 할게요</button>`);
}
function startReview() { const ids = dueIds().slice(0, 30); if (!ids.length) { toast('지금 복습할 문제가 없어요'); return; } startQuiz(ids.map(id => Object.assign({ id }, Q[id])), '망각 곡선 복습', 'explain'); }
function enterAnim() { requestAnimationFrame(() => { const p = $app.querySelector('.pad'); if (p) p.classList.add('in'); }); }
function buzz(ok) { try { navigator.vibrate && navigator.vibrate(ok ? 18 : [30, 40, 30]); } catch (e) {} }

