/* [user/install.js] 홈 화면에 추가: 안드로이드는 버튼 한 번에 설치, 아이폰은 누를 곳을 화살표로 안내, 카톡·인스타 안에서는 브라우저로 바로 넘기기 */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; setTimeout(installBar, 1500); });
window.addEventListener('appinstalled', () => { deferredPrompt = null; G.installHidden = true; save(); hideInstallBar(); toast('홈 화면에 추가됐어요 🎉'); });
function isStandalone() { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } }
function showInstall() { return !isStandalone() && !G.installHidden; }

const IN_UA = navigator.userAgent;
const IN_IOS = /iPhone|iPad|iPod/.test(IN_UA) || (/Macintosh/.test(IN_UA) && 'ontouchend' in document);
const IN_AND = /Android/.test(IN_UA);
const IN_KAKAO = /KAKAOTALK/i.test(IN_UA);
const IN_APP = IN_KAKAO || /Instagram|FBAN|FBAV|NAVER|Line\/|DaumApps|everytimeApp|BAND/i.test(IN_UA);
const IOS_VER = (() => { const m = IN_UA.match(/OS (\d+)_/); return m ? +m[1] : 0; })();
const installUrl = () => ((window.OP_CFG || {}).webUrl || (location.origin + location.pathname)) + '?install=1';

/* 카톡·인스타 등 앱 안 브라우저 → 진짜 브라우저(사파리·크롬)로 한 번에 넘기기 */
function openExternal() {
  const u = installUrl();
  if (IN_KAKAO) { location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(u); return; }
  if (IN_AND) { location.href = 'intent://' + u.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end'; return; }
  try { navigator.clipboard.writeText(u.replace('?install=1', '')); toast('주소를 복사했어요. Safari에 붙여 넣어 열어 주세요'); } catch (e) { toast('Safari를 열고 주소창에 붙여 넣어 주세요'); }
}

function installGuide() {
  hideInstallBar();
  /* ① 안드로이드 크롬·삼성·엣지: 버튼 한 번이면 설치창이 바로 떠요 */
  if (deferredPrompt) { const p = deferredPrompt; p.prompt(); p.userChoice.then(c => { if (c && c.outcome === 'accepted') { G.installHidden = true; save(); } }).finally(() => { deferredPrompt = null; }); return; }
  const step = (n, t) => `<div class="feat"><span class="ck">${n}</span><span>${t}</span></div>`;
  const head = (t, d) => `<div class="hi"><img src="icon-192.png" alt="" style="width:72px;height:72px;border-radius:18px;box-shadow:0 6px 16px rgba(11,26,61,.3)" onerror="this.remove()"></div><h3>${t}</h3><div class="p">${d}</div>`;
  /* ② 카톡·인스타 안: 브라우저로 넘기는 버튼 하나 */
  if (IN_APP) {
    const canJump = IN_KAKAO || IN_AND;
    openSheet(head('브라우저에서 열면<br>홈 화면에 추가할 수 있어요', canJump ? '아래 버튼을 누르면 ' + (IN_IOS ? 'Safari' : 'Chrome') + '로 바로 열려요. 열리면 추가 방법을 이어서 알려 드릴게요.' : '이 앱 안에서는 추가가 안 돼서 Safari로 먼저 열어야 해요.')
      + (canJump ? `<button class="btn" style="width:100%;margin-top:8px" onclick="openExternal()">${IN_IOS ? 'Safari' : 'Chrome'}로 열기</button>`
        : step(1, '오른쪽 위·아래의 <b>⋯ 메뉴</b>를 눌러요') + step(2, '<b>Safari로 열기</b> 또는 <b>다른 브라우저로 열기</b>를 눌러요') + `<button class="btn ghost" style="width:100%;margin-top:8px" onclick="openExternal()">주소 복사하기</button>`)
      + `<button class="btn ghost" style="width:100%;margin-top:8px" onclick="closeSheet()">다음에 할게요</button>`);
    return;
  }
  /* ③ 아이폰: 애플 정책상 자동 설치가 안 돼서, 누를 곳을 화살표로 짚어 줘요 */
  if (IN_IOS) {
    const chromeIos = /CriOS|EdgiOS|FxiOS/.test(IN_UA);
    if (chromeIos) { closeSheet(); iosCoach('top', '주소창 오른쪽 <b>공유 버튼(□↑)</b>을 누르고,<br><b>홈 화면에 추가</b> → <b>추가</b>를 눌러요'); return; }
    if (IOS_VER >= 26) { closeSheet(); iosCoach('br', '오른쪽 아래 <b>⋯</b> → <b>공유</b> → 아래로 내려서<br><b>홈 화면에 추가</b> → <b>추가</b>를 눌러요'); return; }
    closeSheet(); iosCoach('bc', '아래쪽 <b>공유 버튼(□↑)</b>을 누르고,<br>목록을 내려 <b>홈 화면에 추가</b> → <b>추가</b>'); return;
  }
  /* ④ 그 밖(PC, 설치창이 아직 준비 안 된 안드로이드) */
  let body;
  if (/SamsungBrowser/.test(IN_UA)) body = step(1, '아래쪽 <b>≡ 메뉴</b>를 눌러요') + step(2, '<b>현재 페이지 추가 → 홈 화면</b>을 눌러요') + step(3, '<b>추가</b>를 누르면 끝!');
  else if (IN_AND) body = step(1, 'Chrome 오른쪽 위 <b>⋮ 메뉴</b>를 눌러요') + step(2, '<b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 눌러요') + step(3, '<b>설치</b>를 누르면 끝!');
  else body = step(1, '주소창 오른쪽의 <b>설치 아이콘(⊕ 또는 모니터 모양)</b>을 눌러요') + step(2, '<b>설치</b>를 누르면 바탕화면에 아이콘이 생겨요') + step(3, '휴대폰에서는 이 주소를 열고 같은 버튼을 눌러 주세요');
  openSheet(head('홈 화면에 추가하면<br>앱처럼 바로 열려요', '링크 찾을 필요 없이 아이콘 한 번으로 문제 풀기') + body + `<div style="height:14px"></div><button class="btn" style="width:100%" onclick="closeSheet()">알겠어요</button>`);
}

/* 아이폰 화면 위에 반투명 막 + 누를 곳을 가리키는 화살표 */
function iosCoach(pos, text) {
  const old = document.getElementById('ioscoach'); if (old) old.remove();
  const d = document.createElement('div'); d.id = 'ioscoach'; d.className = 'ioscoach ' + pos;
  d.innerHTML = `<div class="ic-card"><img src="icon-192.png" alt="" onerror="this.remove()"><div class="ic-t">홈 화면에 추가하기</div><div class="ic-d">${text}</div><div class="ic-s">추가하면 앱처럼 전체 화면으로 열려요</div><button class="ic-x" onclick="document.getElementById('ioscoach').remove()">닫기</button></div><div class="ic-arrow">${pos === 'top' ? '↑' : '↓'}</div>`;
  d.addEventListener('click', e => { if (e.target === d) d.remove(); });
  document.body.appendChild(d);
}

/* 안드로이드: 설치 가능해지면 아래쪽에 ‘설치’ 띠를 잠깐 띄움 (닫으면 3일 동안 안 띄움) */
function installBar() {
  if (!deferredPrompt || !showInstall() || document.getElementById('instbar')) return;
  try { if (Date.now() - (+localStorage.getItem('op_instbar_x') || 0) < 3 * 864e5) return; } catch (e) {}
  const b = document.createElement('div'); b.id = 'instbar'; b.className = 'instbar';
  b.innerHTML = `<img src="icon-192.png" alt="" onerror="this.remove()"><div class="grow"><b>더오를패스 앱 설치</b><span>홈 화면에서 바로 열기 · 용량 거의 없음</span></div><button class="ib-go" onclick="installGuide()">설치</button><button class="ib-x" aria-label="닫기" onclick="try{localStorage.setItem('op_instbar_x',Date.now())}catch(e){};hideInstallBar()">✕</button>`;
  document.body.appendChild(b);
}
function hideInstallBar() { const b = document.getElementById('instbar'); if (b) b.remove(); }

/* 카톡에서 넘어온 경우(?install=1): 브라우저에서 열리자마자 이어서 안내 */
try { if (/[?&]install=1/.test(location.search)) { history.replaceState(null, '', location.pathname); if (!isStandalone()) setTimeout(installGuide, IN_IOS ? 800 : 2500); } } catch (e) {}
