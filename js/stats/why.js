/* [stats/why.js] 통계: 오답 원인 태그와 분석 */
/* 오답 원인 태그 */
const WHY = [['concept', '개념을 몰랐어요'], ['confuse', '헷갈렸어요'], ['calc', '계산 실수'], ['read', '문제를 잘못 읽었어요']];
function whyHTML(id) { const cur = (S.why || {})[id]; return `<div class="why"><div class="wl">왜 틀렸을까요? <small>골라 두면 약점 분석에 반영돼요</small></div><div class="wc">${WHY.map(([k, l]) => `<button class="${cur === k ? 'on' : ''}" onclick="setWhy(${id},'${k}')">${l}</button>`).join('')}</div></div>`; }
function setWhy(id, k) { S.why = S.why || {}; S.why[id] = S.why[id] === k ? undefined : k; save(); const el = document.querySelector('.why'); if (el) el.outerHTML = whyHTML(id); }
function whyStatsHTML() {
  const w = S.why || {}, cnt = {}; Object.values(w).forEach(k => { if (k) cnt[k] = (cnt[k] || 0) + 1; }); const tot = Object.values(cnt).reduce((a, b) => a + b, 0);
  const tip = { concept: '개념 카드로 기본기를 먼저 다져요. 오픈북 모드로 해설부터 읽는 것도 좋아요.', confuse: '비슷한 개념끼리 비교하는 연습이 필요해요. 오답노트의 보기별 함정 체크를 다시 보세요.', calc: '계산 문제는 공식만 외우면 끝나지 않아요. 세트별 문제로 손으로 직접 풀어 보세요.', read: '‘옳지 않은 것’, ‘모두 고르면’ 같은 조건에 펜 필기로 동그라미를 쳐 보세요.' };
  if (!tot) return `<div class="sec">내가 틀리는 이유</div><div class="card"><div class="empty" style="padding:18px 0"><div class="e">${IC.target()}</div>문제를 틀렸을 때 이유를 골라 두면<br>나만의 약점 분석이 만들어져요</div></div>`;
  const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
  return `<div class="sec">내가 틀리는 이유</div><div class="card">${WHY.map(([k, l]) => { const p = Math.round((cnt[k] || 0) / tot * 100); return `<div class="bar"><span class="nm" style="width:120px">${l}</span><span class="tr"><i style="width:${p}%;${k === top ? '' : 'background:#B0B8C1'}"></i></span><span class="v">${cnt[k] || 0}</span></div>`; }).join('')}<div class="whytip"><b>더오를 처방</b>${tip[top]}</div></div>`;
}

