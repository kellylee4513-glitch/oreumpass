/* [quiz/pen.js] 문제 풀이: 펜 필기 */
/* 펜 필기 */
function togglePen() { run.pen = !run.pen; drawQ(); }
function mountPen() {
  const card = document.querySelector('.qcard'); if (!card || card.querySelector('.inkc')) return;
  card.style.position = 'relative';
  const cv = document.createElement('canvas'); cv.className = 'inkc'; const bar = document.createElement('div'); bar.className = 'inkbar';
  bar.innerHTML = `<span>펜 필기 중</span>${['#F04452', '#3182F6', '#191F28'].map((c, i) => `<button class="sw ${i === 0 ? 'on' : ''}" style="background:${c}" data-c="${c}" aria-label="${['빨강', '파랑', '검정'][i]} 펜"></button>`).join('')}<button class="tx" data-a="clr">지우기</button><button class="tx" data-a="end">닫기</button>`;
  card.appendChild(cv); card.appendChild(bar);
  const dpr = window.devicePixelRatio || 1, W = card.clientWidth, H = card.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const g = cv.getContext('2d'); g.scale(dpr, dpr); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 2.6; g.strokeStyle = '#F04452';
  let on = false;
  const pt = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  cv.onpointerdown = e => { on = true; cv.setPointerCapture(e.pointerId); const [x, y] = pt(e); g.beginPath(); g.moveTo(x, y); };
  cv.onpointermove = e => { if (!on) return; const [x, y] = pt(e); g.lineTo(x, y); g.stroke(); };
  cv.onpointerup = cv.onpointercancel = () => on = false;
  bar.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.c) { g.strokeStyle = b.dataset.c; bar.querySelectorAll('.sw').forEach(x => x.classList.toggle('on', x === b)); } if (b.dataset.a === 'clr') g.clearRect(0, 0, W, H); if (b.dataset.a === 'end') togglePen(); };
}

