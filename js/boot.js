/* [boot.js] 앱 시작 · 서비스 워커 등록 */
/* ===== 시작 ===== */
if (!READY.length) { document.getElementById('app').innerHTML = '<div class="empty">자격증 데이터가 없어요</div>'; }
else if (!G.cur || !READY.some(c => c.id === G.cur)) { useCert(READY[0].id); G.cur = ''; certPicker(true); }
else { useCert(G.cur); go('certs'); }

/* ===== 정책 바로가기 주소: ?p=terms | privacy | refund ===== */
try { const pk = new URLSearchParams(location.search).get('p'); if (READY.length && ['terms', 'privacy', 'refund'].includes(pk)) { if (!C) useCert(READY[0].id); legalPage(pk); } } catch (e) {}

/* ===== 앱 저장(서비스 워커): 내 주소(https)에 올렸을 때만 동작 ===== */
try { if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && !/claude|anthropic/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}


/* ===== 로그인 세션 복원 (설정돼 있을 때만) ===== */
try { if (authOn()) authInit(); } catch (e) {}
try { if (/[?&]pay=/.test(location.search)) payReturn(); } catch (e) {}
