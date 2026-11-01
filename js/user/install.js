/* [user/install.js] 홈 화면에 추가(아이폰·안드로이드 안내) */
/* ===== 홈 화면에 추가 ===== */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; });
window.addEventListener('appinstalled', () => { G.installHidden = true; save(); toast('홈 화면에 추가됐어요'); });
function isStandalone() { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } }
function showInstall() { return !isStandalone() && !G.installHidden; }
function installGuide() { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(() => { deferredPrompt = null; }); return; }
  const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document), inApp = /Instagram|FBAN|FBAV|KAKAOTALK|NAVER/.test(ua);
  const step = (n, t) => `<div class="feat"><span class="ck">${n}</span><span>${t}</span></div>`; let body;
  if (inApp) body = step(1, '오른쪽 위 <b>⋯ 메뉴</b>를 눌러요') + step(2, '<b>다른 브라우저로 열기</b>를 눌러요 (아이폰은 Safari, 안드로이드는 Chrome)') + step(3, '열린 화면에서 이 버튼을 한 번 더 눌러요');
  else if (ios && /CriOS|FxiOS|EdgiOS/.test(ua)) body = step(1, '주소창 오른쪽 <b>공유 버튼(□↑)</b>을 눌러요') + step(2, '<b>홈 화면에 추가</b>를 눌러요 (안 보이면 Safari로 열어 주세요)') + step(3, '오른쪽 위 <b>추가</b>를 누르면 끝!');
  else if (/SamsungBrowser/.test(ua)) body = step(1, '아래쪽 <b>≡ 메뉴</b>를 눌러요') + step(2, '<b>현재 페이지 추가 → 홈 화면</b>을 눌러요') + step(3, '<b>추가</b>를 누르면 끝!');
  else if (ios) body = step(1, 'Safari 아래쪽 <b>공유 버튼(□↑)</b>을 눌러요') + step(2, '목록을 내려서 <b>홈 화면에 추가</b>를 눌러요') + step(3, '오른쪽 위 <b>추가</b>를 누르면 끝!');
  else body = step(1, 'Chrome 오른쪽 위 <b>⋮ 메뉴</b>를 눌러요') + step(2, '<b>홈 화면에 추가</b> 또는 <b>앱 설치</b>를 눌러요') + step(3, '<b>설치</b>를 누르면 끝!');
  openSheet(`<div class="hi"><img src="icon-192.png" alt="" style="width:72px;height:72px;border-radius:18px;box-shadow:0 6px 16px rgba(11,26,61,.3)" onerror="this.remove()"></div><h3>홈 화면에 추가하면<br>앱처럼 바로 열려요</h3><div class="p">${inApp ? '인스타·카톡 안에서는 추가가 안 돼서, 브라우저로 먼저 열어야 해요' : '링크 찾을 필요 없이 아이콘 한 번으로 문제 풀기'}</div>${body}<div style="height:14px"></div><button class="btn" style="width:100%" onclick="closeSheet()">알겠어요</button>`); }

