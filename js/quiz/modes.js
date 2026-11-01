/* [quiz/modes.js] 문제 풀이: 해설·시험·오픈북 모드 선택 */
/* ===== 풀이 모드 · 단원별 · 세트별 · 문제은행 · 펜 · FAQ ===== */
const MODE_NAME = { explain: '해설 모드', exam: '시험 모드', open: '오픈북' };
const SET_N = 20;
let PEND = null;
function modeSheet(items, label, extra) {
  if (!items.length) { toast('풀 문제가 없어요'); return; }
  PEND = { items, label, extra: extra || {} };
  const opt = (m, ic, t, d, rec) => `<button class="pick mode" onclick="closeSheet();startPend('${m}')"><span class="mi">${ic}</span><div class="grow"><div class="t">${t}${rec ? ' <span class="tag free">추천</span>' : ''}</div><div class="d">${d}</div></div><span class="chev">›</span></button>`;
  openSheet(`<h3>어떻게 풀까요?</h3><div class="p">${esc(label)} · ${items.length}문항</div>
    ${opt('explain', IC.quick(), '해설 모드', '한 문제 풀 때마다 정답과 해설을 바로 확인해요', true)}
    ${opt('exam', IC.exam(), '시험 모드', '정답을 숨기고 끝까지 푼 뒤 한 번에 채점해요', false)}
    ${opt('open', IC.book(), '오픈북 모드', '정답과 해설을 펼쳐 놓고 개념부터 읽어요 (기록 안 남음)', false)}`);
}
function startPend(m) { const p = PEND; if (!p) return; startQuiz(p.items, p.label, m, p.extra.at || 0); if (p.extra.setNo) run.setNo = p.extra.setNo; }

