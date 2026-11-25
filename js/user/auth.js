/* [user/auth.js] 로그인(카카오·구글, Supabase Auth) · 프로필 · 학습 기록 동기화 */
const AU = { sb: null, user: null, nick: '', ready: false, err: '', syncT: null, lastSync: '' };
const authCfg = () => window.OP_CFG || {};
const authSandbox = () => /claude|anthropic/.test(location.hostname) || location.protocol === 'file:' && !window.__allowFileAuth;
const authCfgOn = () => !!(authCfg().sbUrl && authCfg().sbKey);
const authOn = () => !!(authCfg().sbUrl && authCfg().sbKey) && !authSandbox();
function loadSbLib() {
  if (window.supabase && window.supabase.createClient) return Promise.resolve();
  return new Promise((ok, no) => { const s = document.createElement('script'); s.src = authCfg().sbLib; s.onload = ok; s.onerror = () => no(new Error('lib')); document.head.appendChild(s); });
}
async function authInit() {
  if (!authOn() || AU.sb) return;
  try {
    await loadSbLib();
    AU.sb = window.supabase.createClient(authCfg().sbUrl, authCfg().sbKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });
    AU.sb.auth.onAuthStateChange((ev, session) => { const u = session && session.user || null; const was = AU.user && AU.user.id; AU.user = u; if (u && u.id !== was) setTimeout(afterLogin, 0); if (!u) { AU.nick = ''; } authRefreshUI(); });
    const { data } = await AU.sb.auth.getSession(); AU.user = data.session && data.session.user || null;
    AU.ready = true; if (AU.user) await afterLogin(); authRefreshUI();
  } catch (e) { AU.err = '서버에 연결하지 못했어요'; AU.ready = true; authRefreshUI(); }
}
function authRefreshUI() { if (run) return; if (tab === 'my' && document.querySelector('.prof')) myTab(); if (tab === 'comm' && typeof commRefresh === 'function') commRefresh(); }
/* 로그인 페이지 (전체 화면) — 로그인이 필요한 곳은 모두 여기로 */
function loginSheet(why) { loginPage(why); }
function loginPage(why) {
  closeSheet(); markNav(); window.scrollTo(0, 0); $app.classList.remove('wide');
  const from = ['comm', 'my', 'home', 'study', 'note', 'shop'].includes(tab) ? tab : 'my';
  const web = authCfg().webUrl;
  const benefit = (ic, t, d) => `<div class="lp-b"><span class="lp-ic">${ic}</span><div><b>${t}</b><span>${d}</span></div></div>`;
  const buttons = authOn()
    ? `<button class="lg-btn kakao" onclick="authLogin('kakao','${from}')"><span class="lg-ic">${IC_KAKAO}</span>카카오로 시작하기</button>
       <button class="lg-btn google" onclick="authLogin('google','${from}')"><span class="lg-ic">${IC_GOOGLE}</span>Google로 시작하기</button>`
    : authSandbox() && web
      ? `<a class="lg-btn web" href="${web}" target="_blank" rel="noopener">웹 앱에서 로그인하기</a><div class="lg-note">이 화면에서는 보안 정책 때문에 로그인할 수 없어요.</div>`
      : `<div class="lg-note">로그인은 곧 열려요. 지금은 이 기기에 기록이 저장돼요.</div>`;
  $app.innerHTML = topBar('로그인', '', `go('${from}')`) + `<div class="pad upage lp">
    <div class="lp-hero"><img src="icon-192.png" alt="" class="lp-logo"><div class="lp-wm">${WORDMARK}</div>
      <h1>${esc(why || '로그인하고 합격까지\n이어서 공부해요').replace(/\n/g, '<br>')}</h1></div>
    <div class="card lp-list">
      ${benefit(IC.phone(), '어디서나 이어 풀기', '휴대폰에서 푼 기록을 PC에서도 그대로 봐요')}
      ${benefit(IC.note(), '오답·별표 안전하게 보관', '기기를 바꾸거나 브라우저를 지워도 남아요')}
      ${benefit(IC_CHAT, '커뮤니티 참여', '합격 후기·시험 후기·질문을 남기고 댓글을 달아요')}
    </div>
    <div class="lp-btns">${buttons}</div>
    <button class="lp-skip" onclick="go('${from === 'my' ? 'home' : from}')">로그인 없이 둘러보기</button>
    <div class="lg-note">처음 로그인하면 자동으로 가입돼요. 가입하면 <a role="button" tabindex="0" onclick="legalPage('terms')">이용약관</a>과 <a role="button" tabindex="0" onclick="legalPage('privacy')">개인정보처리방침</a>에 동의한 것으로 봐요. 비밀번호는 받지 않고, 카카오·구글에서 받은 이메일과 닉네임만 회원 확인에 써요.</div>
  </div>`; tabbar();
}
async function authLogin(provider, from) {
  try { try { sessionStorage.setItem('op_after', from || 'my'); } catch (e) {} await authInit(); if (!AU.sb) throw 0;
    const { error } = await AU.sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin + location.pathname } });
    if (error) throw error;
  } catch (e) { toast('로그인을 시작하지 못했어요. 잠시 뒤 다시 해 주세요'); }
}
async function authLogout() {
  if (AU.pending || AU.syncT) { try { await syncPush(true); } catch (e) {} } /* 못 올린 기록은 계정에 먼저 올려 두고 */
  try { if (AU.sb) await AU.sb.auth.signOut(); } catch (e) {} AU.user = null; AU.nick = ''; AU.pending = false;
  /* 계정으로 산 PRO는 이 기기에서 닫아요(같은 기기를 다음 사람이 쓰면 열려 있으면 안 됨). 비회원으로 이 기기에서 산 것은 다시 반영 */
  G.passAll = false; G.passCerts = []; G.passExp = {}; save(true);
  try { if (typeof syncPurchases === 'function') await syncPurchases(); } catch (e) {}
  openSheet(`<h3>로그아웃했어요</h3><div class="p">이 기기에 남은 학습 기록(오답·별표·풀이 기록)도 지울까요?<br>다른 사람과 같은 기기를 쓴다면 지우는 걸 추천해요. 계정에 저장된 기록은 그대로 남아 있어서, 다시 로그인하면 돌아와요.</div>
    <button class="btn" style="width:100%" onclick="logoutWipe()">이 기기 기록 지우기</button>
    <button class="btn ghost" style="width:100%;margin-top:8px" onclick="closeSheet();go('my')">남겨 두기</button>`);
}
function logoutWipe() { const cur = G.cur; const pay = { passAll: G.passAll, passCerts: G.passCerts, passExp: G.passExp }; G = Object.assign(blankG(), pay, { cur }); if (C) useCert(C.id); save(true); closeSheet(); toast('이 기기 기록을 지웠어요'); go('my'); }
async function afterLogin() {
  if (!AU.sb || !AU.user) return;
  try { const { data } = await AU.sb.from('profiles').select('nickname').eq('id', AU.user.id).maybeSingle(); AU.nick = data ? data.nickname : ''; } catch (e) {}
  await syncPull();
  try { if (typeof syncPurchases === 'function') await syncPurchases(); } catch (e) {}
  try { if (typeof payResume === 'function') payResume(); } catch (e) {}
  let back = ''; try { back = sessionStorage.getItem('op_after') || ''; sessionStorage.removeItem('op_after'); } catch (e) {}
  if (back && !run) { toast((AU.nick || '회원') + '님, 로그인했어요'); go(back); } else authRefreshUI();
}
function nickSheet() {
  if (!AU.user) { loginSheet(); return; }
  openSheet(`<h3>닉네임 바꾸기</h3><div class="p">커뮤니티에 보이는 이름이에요. 2~12자로 정해 주세요.</div><input id="nkIn" class="field" maxlength="12" value="${esc(AU.nick)}"><button class="btn" style="width:100%" onclick="nickSave()">저장</button>`);
}
async function nickSave() {
  const v = (document.getElementById('nkIn').value || '').trim();
  if (v.length < 2 || v.length > 12) { toast('2~12자로 정해 주세요'); return; }
  const { error } = await AU.sb.from('profiles').update({ nickname: v }).eq('id', AU.user.id);
  if (error) { toast('저장하지 못했어요'); return; } AU.nick = v; closeSheet(); toast('닉네임을 바꿨어요'); authRefreshUI();
}
/* ===== 기록 동기화: 서버 한 줄(progress) ↔ 기기(G) ===== */
const syncPayload = () => { const g = JSON.parse(JSON.stringify(G)); delete g.passAll; delete g.passCerts; delete g.passExp; return g; };
function mergeCert(a, b) {
  a = cleanCert(a); b = cleanCert(b); const o = cleanCert(Object.assign({}, a, b));
  if (a.bv !== b.bv) return a.bv > b.bv ? a : b; /* 문제은행 버전이 다르면 최신 쪽만 */
  ['wrong', 'wrongOx', 'star', 'seen', 'cardOk'].forEach(k => o[k] = [...new Set([...(a[k] || []), ...(b[k] || [])])]);
  ['solved', 'correct'].forEach(k => o[k] = Math.max(a[k], b[k]));
  o.days = Object.assign({}, a.days, b.days); Object.keys(a.days).forEach(d => o.days[d] = Math.max(a.days[d] || 0, b.days[d] || 0));
  ['srs', 'qstat', 'why', 'memo', 'setBest', 'ustat', 'badges', 'subj'].forEach(k => o[k] = Object.assign({}, a[k], b[k]));
  o.hist = histJoin(a.hist, b.hist);
  o.exam = b.exam || a.exam; return cleanCert(o);
}
/* 같은 풀이 기록이 합칠 때마다 두 번씩 쌓이지 않게 */
const histKey = h => [h.d, h.l, h.s, h.t, h.ms].join('|');
function histJoin(...lists) { const m = new Map(); lists.forEach(l => (l || []).forEach(h => { if (!m.has(histKey(h))) m.set(histKey(h), h); })); return [...m.values()].sort((x, y) => (y.d > x.d ? 1 : y.d < x.d ? -1 : 0)).slice(0, 30); }

/* ===== 세 갈래 합치기: '지난번에 맞춰 둔 기록(base)'과 비교해서, 이 기기와 서버 중 실제로 바뀐 쪽을 살려요 =====
   - 이 기기에서 오프라인으로 공부한 기록 → 서버 예전 값에 덮이지 않음
   - 오답노트에서 지운 문제·별표, 기록 초기화 → 다른 기기와 합쳐도 되살아나지 않음
   - 두 기기에서 따로 푼 문제 수 → 서로 더해짐 */
const J = x => JSON.stringify(x === undefined ? null : x);
function set3(base, a, b) {
  const B = new Set(base), A = new Set(a), R = new Set(b), out = new Set();
  [...a, ...b].forEach(x => { const gone = B.has(x) && (!A.has(x) || !R.has(x)); if (!gone) out.add(x); });
  return [...out];
}
const dsum = (x, y, z) => Math.max(0, (z || 0) + ((x || 0) - (z || 0)) + ((y || 0) - (z || 0)));
const tsum = (x, y, z, f) => { x = x || {}; y = y || {}; z = z || {}; const o = {}; f.forEach(k => o[k] = dsum(x[k], y[k], z[k])); return o; };
function map3(base, a, b, both) {
  const o = {};
  new Set([...Object.keys(a), ...Object.keys(b), ...Object.keys(base)]).forEach(k => {
    const ca = J(a[k]) !== J(base[k]), cb = J(b[k]) !== J(base[k]);
    const v = ca && cb && both && a[k] !== undefined && b[k] !== undefined ? both(a[k], b[k], base[k]) : ca ? a[k] : b[k];
    if (v !== undefined) o[k] = v;
  });
  return o;
}
function mergeCert3(z, a, b) {
  a = cleanCert(a); b = cleanCert(b);
  if (a.bv !== b.bv) return a.bv > b.bv ? a : b;
  if (!z) return mergeCert(a, b); /* 처음 한 번은 예전 방식 */
  z = cleanCert(z); if (z.bv !== a.bv) return mergeCert(a, b);
  const o = blankCert();
  ['wrong', 'wrongOx', 'star', 'seen', 'cardOk'].forEach(k => o[k] = set3(z[k], a[k], b[k]));
  ['solved', 'correct'].forEach(k => o[k] = dsum(a[k], b[k], z[k]));
  o.correct = Math.min(o.correct, o.solved);
  o.days = map3(z.days, a.days, b.days, (x, y, w) => dsum(x, y, w));
  o.subj = map3(z.subj, a.subj, b.subj, (x, y, w) => tsum(x, y, w, ['t', 'c']));
  o.ustat = map3(z.ustat, a.ustat, b.ustat, (x, y, w) => tsum(x, y, w, ['t', 'c']));
  o.qstat = map3(z.qstat, a.qstat, b.qstat, (x, y, w) => tsum(x, y, w, ['t', 'w']));
  ['srs', 'why', 'memo', 'setBest', 'badges'].forEach(k => o[k] = map3(z[k], a[k], b[k]));
  const hk = l => (l || []).map(histKey), hm = new Map([...(a.hist || []), ...(b.hist || [])].map(h => [histKey(h), h]));
  o.hist = histJoin(set3(hk(z.hist), hk(a.hist), hk(b.hist)).map(k => hm.get(k)));
  o.spd = J(a.spd) !== J(z.spd) && J(b.spd) !== J(z.spd) ? tsum(a.spd, b.spd, z.spd, ['n', 'ms']) : J(a.spd) !== J(z.spd) ? a.spd : b.spd;
  ['goal', 'exam', 'goalDone', 'popDay', 'dq', 'dox', 'tw', 'bv'].forEach(k => o[k] = J(a[k]) !== J(z[k]) ? a[k] : b[k]);
  return cleanCert(o);
}
/* 지난번에 서버와 맞춰 둔 기록: 계정마다 따로 보관 */
const baseKey = () => 'op_sync_base_' + (AU.user ? AU.user.id : '');
function baseGet() { try { return JSON.parse(localStorage.getItem(baseKey()) || 'null'); } catch (e) { return null; } }
function baseSet(g) { try { localStorage.setItem(baseKey(), JSON.stringify(g)); } catch (e) {} }
async function syncPull() {
  try {
    const { data, error } = await AU.sb.from('progress').select('data, updated_at').eq('user_id', AU.user.id).maybeSingle();
    if (error) throw error;
    if (data && data.data) {
      const remote = cleanG(data.data, false), base = baseGet(), bd = base && base.data || null;
      Object.keys(remote.data).forEach(k => { G.data[k] = G.data[k] ? mergeCert3(bd && bd[k], G.data[k], remote.data[k]) : remote.data[k]; });
      if (!G.name && remote.name) G.name = remote.name;
      if (C) { S = G.data[C.id] = cleanCert(G.data[C.id]); }
      save(true);
    }
    await syncPush(true);
  } catch (e) { AU.err = '기록을 불러오지 못했어요'; }
}
async function syncPush(now) {
  if (!AU.sb || !AU.user) return;
  clearTimeout(AU.syncT);
  AU.pending = true;
  const doIt = async () => {
    AU.syncT = null; if (!AU.user) return; const p = syncPayload();
    try { const { error } = await AU.sb.from('progress').upsert({ user_id: AU.user.id, data: p, updated_at: new Date().toISOString() }); if (error) throw error; AU.lastSync = new Date().toISOString(); AU.pending = false; baseSet(p); }
    catch (e) { AU.pending = true; } /* 실패하면 인터넷이 돌아올 때·앱을 닫을 때·다음에 열 때 다시 올려요 */
  };
  if (now) return doIt(); AU.syncT = setTimeout(doIt, 4000);
}
/* 올리지 못한 기록 다시 올리기: 인터넷 복구, 앱을 내리거나 닫을 때 */
window.addEventListener('online', () => { if (AU.pending) syncPush(true); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && (AU.pending || AU.syncT)) syncPush(true); });
window.addEventListener('pagehide', () => { if (AU.pending || AU.syncT) syncPush(true); });
const IC_KAKAO = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#191919" d="M12 3.5c-5 0-9 3.1-9 7 0 2.5 1.7 4.7 4.2 5.9l-.9 3.4c-.1.3.3.6.6.4l4-2.6h1.1c5 0 9-3.1 9-7s-4-7.1-9-7.1z"/></svg>';
const IC_GOOGLE = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6a4.8 4.8 0 01-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z"/><path fill="#34A853" d="M12 22.5c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10.5 10.5 0 0012 22.5z"/><path fill="#FBBC05" d="M6.2 14.1a6.3 6.3 0 010-4.2V7.2H2.7a10.5 10.5 0 000 9.6z"/><path fill="#EA4335" d="M12 5.7c1.5 0 2.9.5 4 1.6l3-3A10.5 10.5 0 002.7 7.2l3.5 2.7C7 7.5 9.3 5.7 12 5.7z"/></svg>';
const IC_CHAT = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M4 4.5A2.5 2.5 0 016.5 2h11A2.5 2.5 0 0120 4.5v9a2.5 2.5 0 01-2.5 2.5H11l-4.4 3.6c-.5.4-1.1 0-1.1-.6V16h-.1A2.5 2.5 0 013 13.5z"/></svg>';
