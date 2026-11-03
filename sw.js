/* 더오를패스 서비스 워커: 앱 화면과 문제 파일을 저장해 두고 빠르게(오프라인에서도) 열기 */
const CACHE = 'oreumpass-v80';
const FONT_CACHE = 'oreumpass-fonts-v1'; /* 글꼴은 크기가 커서 한 번 받으면 따로 오래 보관 */
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './css/app.css', './certs/catalog.js', './certs/tuunsa.js', './certs/shop.js', './js/core/icons.js', './js/core/state.js', './js/core/ui.js', './js/screens/picker.js', './js/screens/home.js', './js/quiz/practice.js', './js/quiz/mock.js', './js/quiz/result.js', './js/quiz/ox.js', './js/stats/study.js', './js/review/wrongnote.js', './js/user/my.js', './js/quiz/modes.js', './js/screens/units.js', './js/screens/sets.js', './js/screens/bank.js', './js/quiz/pen.js', './js/stats/topwrong.js', './js/screens/faq.js', './js/screens/legal.js', './js/user/sync.js', './js/core/nav.js', './js/review/srs-plan.js', './js/stats/why.js', './js/review/cards.js', './js/stats/predict.js', './js/quiz/highlight.js', './js/review/notes.js', './js/engage/gamify.js', './js/core/sheet.js', './js/user/install.js', './js/user/pay.js', './js/user/shop.js', './js/user/auth.js', './js/screens/community.js', './js/core/config.js', './js/boot.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONT_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* 새 버전이 있으면 받아 오고, 인터넷이 안 되면 저장된 파일로 열기 */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  if (e.request.url.includes('/fonts/')) { e.respondWith(caches.open(FONT_CACHE).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; })))); return; }
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; })
      .catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
