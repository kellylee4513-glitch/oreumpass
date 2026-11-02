/* [core/nav.js] 뒤로가기(안드로이드 버튼·아이폰 스와이프) */
/* ===== 안드로이드 뒤로가기 · 아이폰 스와이프 뒤로가기 ===== */
let navDepth = false;
function markNav() { try { if (!navDepth) { history.pushState({ op: 1 }, ''); navDepth = true; } } catch (e) {} }
window.addEventListener('popstate', () => {
  navDepth = false;
  const sh = document.getElementById('sheet');
  if (sh && sh.classList.contains('show')) { closeSheet(); if (onSub()) markNav(); return; }
  if (run && NT.back && document.querySelector('.nt-h')) { NT.back = false; drawQ(); return; }
  if (run || onSub()) { stopTimer(); run = null; quitArm = false; $app.classList.remove('wide'); go(tab === 'home' || !tab ? 'home' : tab); return; }
  try { history.back(); } catch (e) {}
});
function onSub() { return !document.querySelector('.tabbar') || !!document.querySelector('.top .back'); }
