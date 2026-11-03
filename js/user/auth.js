/* [user/auth.js] 로그인(카카오·구글, Supabase Auth) · 프로필 · 학습 기록 동기화 */
const AU = { sb: null, user: null, nick: '', ready: false, err: '', syncT: null, lastSync: '' };
const authCfg = () => window.OP_CFG || {};
const authSandbox = () => /claude|anthropic/.test(location.hostname) || location.protocol === 'file:' && !window.__allowFileAuth;
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
    <div class="lg-note">처음 로그인하면 자동으로 가입돼요. 가입하면 <a role="button" tabindex="0" onclick="toast('정식 출시 전에 공개돼요')">이용약관</a>과 <a role="button" tabindex="0" onclick="toast('정식 출시 전에 공개돼요')">개인정보처리방침</a>에 동의한 것으로 봐요. 이메일이나 비밀번호는 저장하지 않아요.</div>
  </div>`; tabbar();
}
async function authLogin(provider, from) {
  try { try { sessionStorage.setItem('op_after', from || 'my'); } catch (e) {} await authInit(); if (!AU.sb) throw 0;
    const { error } = await AU.sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin + location.pathname } });
    if (error) throw error;
  } catch (e) { toast('로그인을 시작하지 못했어요. 잠시 뒤 다시 해 주세요'); }
}
async function authLogout() { try { if (AU.sb) await AU.sb.auth.signOut(); } catch (e) {} AU.user = null; AU.nick = ''; toast('로그아웃했어요'); go('my'); }
async function afterLogin() {
  if (!AU.sb || !AU.user) return;
  try { const { data } = await AU.sb.from('profiles').select('nickname').eq('id', AU.user.id).maybeSingle(); AU.nick = data ? data.nickname : ''; } catch (e) {}
  await syncPull();
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
const syncPayload = () => { const g = JSON.parse(JSON.stringify(G)); delete g.passAll; delete g.passCerts; return g; };
function mergeCert(a, b) {
  a = cleanCert(a); b = cleanCert(b); const o = cleanCert(Object.assign({}, a, b));
  if (a.bv !== b.bv) return a.bv > b.bv ? a : b; /* 문제은행 버전이 다르면 최신 쪽만 */
  ['wrong', 'wrongOx', 'star', 'seen', 'cardOk'].forEach(k => o[k] = [...new Set([...(a[k] || []), ...(b[k] || [])])]);
  ['solved', 'correct'].forEach(k => o[k] = Math.max(a[k], b[k]));
  o.days = Object.assign({}, a.days, b.days); Object.keys(a.days).forEach(d => o.days[d] = Math.max(a.days[d] || 0, b.days[d] || 0));
  ['srs', 'qstat', 'why', 'memo', 'setBest', 'ustat', 'badges', 'subj'].forEach(k => o[k] = Object.assign({}, a[k], b[k]));
  o.hist = [...(a.hist || []), ...(b.hist || [])].sort((x, y) => (y.d > x.d ? 1 : -1)).slice(0, 30);
  o.exam = b.exam || a.exam; return cleanCert(o);
}
async function syncPull() {
  try {
    const { data, error } = await AU.sb.from('progress').select('data, updated_at').eq('user_id', AU.user.id).maybeSingle();
    if (error) throw error;
    if (data && data.data) {
      const remote = cleanG(data.data, false);
      Object.keys(remote.data).forEach(k => { G.data[k] = G.data[k] ? mergeCert(G.data[k], remote.data[k]) : remote.data[k]; });
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
  const doIt = async () => { try { const { error } = await AU.sb.from('progress').upsert({ user_id: AU.user.id, data: syncPayload(), updated_at: new Date().toISOString() }); if (!error) AU.lastSync = new Date().toISOString(); } catch (e) {} };
  if (now) return doIt(); AU.syncT = setTimeout(doIt, 4000);
}
const IC_KAKAO = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#191919" d="M12 3.5c-5 0-9 3.1-9 7 0 2.5 1.7 4.7 4.2 5.9l-.9 3.4c-.1.3.3.6.6.4l4-2.6h1.1c5 0 9-3.1 9-7s-4-7.1-9-7.1z"/></svg>';
const IC_GOOGLE = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6a4.8 4.8 0 01-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z"/><path fill="#34A853" d="M12 22.5c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10.5 10.5 0 0012 22.5z"/><path fill="#FBBC05" d="M6.2 14.1a6.3 6.3 0 010-4.2V7.2H2.7a10.5 10.5 0 000 9.6z"/><path fill="#EA4335" d="M12 5.7c1.5 0 2.9.5 4 1.6l3-3A10.5 10.5 0 002.7 7.2l3.5 2.7C7 7.5 9.3 5.7 12 5.7z"/></svg>';
const IC_CHAT = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M4 4.5A2.5 2.5 0 016.5 2h11A2.5 2.5 0 0120 4.5v9a2.5 2.5 0 01-2.5 2.5H11l-4.4 3.6c-.5.4-1.1 0-1.1-.6V16h-.1A2.5 2.5 0 013 13.5z"/></svg>';
