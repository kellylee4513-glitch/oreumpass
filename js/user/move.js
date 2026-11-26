/* [user/move.js] 새 주소 이사: 옛 주소 → theoreulpass.com 으로 보내면서 이 기기 기록을 같이 옮기기
   - 옛 주소(github.io)에서: OP_CFG.moveOn 이 true 일 때만 이사 화면을 보여 주고 2초 뒤 새 주소로 이동
   - 새 주소에서: 주소 뒤 #mv=… 로 온 기록을 받아 적용 (새 주소에 기록이 이미 있으면 고르게 함)
   - 결제 기록 자체는 토스·서버에 있어요. 비회원 구매 목록은 새 주소에서 서버로 다시 확인해요(guestRecheck) */
const MV = { at: 'kellylee4513-glitch.github.io' };
const mvCfg = () => window.OP_CFG || {};
const mvOld = () => location.hostname === MV.at;
/* 기록 → 주소에 넣을 문자열 (가능하면 압축) */
const b64u = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); const b = atob(s + '==='.slice((s.length + 3) % 4)); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
async function pipeBytes(u8, Stream, kind) { const r = new Blob([u8]).stream().pipeThrough(new Stream(kind)); return new Uint8Array(await new Response(r).arrayBuffer()); }
async function mvPack() {
  const g = JSON.parse(JSON.stringify(G)); delete g.passAll; delete g.passCerts; delete g.passExp; /* 이용권은 서버·주문으로 다시 계산 */
  const raw = new TextEncoder().encode(JSON.stringify({ v: 1, g, go: typeof gOrders === 'function' ? gOrders() : [] }));
  if (typeof CompressionStream === 'function') { try { return 'z' + b64u(await pipeBytes(raw, CompressionStream, 'deflate-raw')); } catch (e) {} }
  return 'p' + b64u(raw);
}
async function mvUnpack(s) {
  const k = s[0], u = unb64u(s.slice(1));
  const bytes = k === 'z' ? await pipeBytes(u, DecompressionStream, 'deflate-raw') : k === 'p' ? u : null;
  if (!bytes) throw 0;
  const d = JSON.parse(new TextDecoder().decode(bytes)); if (!d || d.v !== 1 || !d.g || typeof d.g !== 'object') throw 0;
  return d;
}
/* 기록 크기 요약 (고르기 화면용) */
function mvSum(g) { let n = 0, w = 0; Object.values((g && g.data) || {}).forEach(d => { n += num0(d && d.solved); w += Array.isArray(d && d.wrong) ? d.wrong.length : 0; }); return { n: Math.floor(n), w }; }
const mvHas = g => { const s = mvSum(g); return s.n > 0 || s.w > 0 || Object.values(g.data || {}).some(d => d && ((d.star || []).length || Object.keys(d.memo || {}).length)); };

/* ===== 옛 주소: 이사 화면 → 새 주소로 ===== */
async function mvGo() {
  if (MV.going) return; MV.going = true;
  let pack = ''; try { pack = await mvPack(); } catch (e) {}
  const q = location.search.replace(/[?&](pay|g|c|paymentKey|orderId|amount)=[^&]*/g, '').replace(/^&/, '?');
  location.replace(String(mvCfg().moveTo || 'https://theoreulpass.com/') + (q === '?' ? '' : q) + (pack ? '#mv=' + pack : ''));
}
function mvScreen() {
  const el = document.createElement('div'); el.className = 'mvs';
  el.innerHTML = `<div class="mvs-in"><div class="mvs-top">
      <div class="mvs-logo"></div><div class="mvs-wm">${typeof WORDMARK === 'string' ? WORDMARK : ''}</div>
      <h1>더오를패스 주소가<br>바뀌었어요</h1>
      <div class="mvs-addr">theoreulpass.com</div>
      <div class="mvs-sub">이 기기에 저장된 기록을 새 주소로 옮겨요</div>
      <div class="mvs-card">
        <div class="feat"><span class="ck">✓</span><span>풀이 기록·오답노트·별표</span></div>
        <div class="feat"><span class="ck">✓</span><span>비회원 구매 (PRO·요약노트)</span></div>
        <div class="feat"><span class="ck">✓</span><span>시험일·목표 설정</span></div>
      </div></div>
    <div class="mvs-bar"><b></b></div>
    <button class="btn" onclick="mvGo()">새 주소로 바로 가기</button>
    <div class="mvs-small">홈 화면에 앱을 설치했다면, 새 주소에서 다시 설치해 주세요</div></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  setTimeout(mvGo, 2200);
}
function moveCheck() {
  try {
    if (mvOld()) {
      if (!mvCfg().moveOn) return;
      if (/[?&](pay|paymentKey)=/.test(location.search)) return; /* 결제하고 돌아온 순간에는 결제부터 마무리 (다음에 열 때 이사) */
      try { if (localStorage.getItem('op_guest_pending')) return; } catch (e) {}
      mvScreen(); return;
    }
    const m = /^#mv=([A-Za-z0-9_-]+)$/.exec(location.hash || ''); if (!m) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    mvUnpack(m[1]).then(mvArrive).catch(() => toast('이전 주소 기록을 가져오지 못했어요. 내 정보 › 기기 간 기록 옮기기를 이용해 주세요'));
  } catch (e) {}
}

/* ===== 새 주소: 도착 ===== */
function mvApply(d) {
  const ng = cleanG(d.g, false); ng.passAll = G.passAll; ng.passCerts = G.passCerts.slice(); ng.passExp = Object.assign({}, G.passExp);
  G = ng; useCert(G.cur && READY.some(c => c.id === G.cur) ? G.cur : READY[0].id); save();
  if (Array.isArray(d.go) && d.go.length && typeof gOrders === 'function') {
    const ok = d.go.filter(o => o && typeof o === 'object' && typeof o.id === 'string' && /^[\w-]{4,80}$/.test(o.id) && typeof o.cert === 'string' && typeof o.item === 'string');
    const have = gOrders(); ok.forEach(o => { if (!have.some(x => x.id === o.id)) have.push(o); }); gSave(have);
    try { syncPurchases(); } catch (e) {}
  }
  closeSheet(); go('home'); setTimeout(() => toast('이전 주소의 기록을 그대로 가져왔어요'), 300);
}
function mvArrive(d) {
  d = { g: cleanG(d.g, false), go: Array.isArray(d.go) ? d.go.slice(0, 50) : [] }; MV.d = d; /* 받은 값은 정리한 뒤에만 사용 */
  if (!mvHas(d.g)) { if (Array.isArray(d.go) && d.go.length) mvApply({ g: G, go: d.go }); return; } /* 옛 주소에 공부 기록이 없으면 구매만 옮김 */
  if (!mvHas(G)) { mvApply(d); return; }
  const a = mvSum(d.g), b = mvSum(G);
  openSheet(`<h3>어느 기록으로 공부할까요?</h3><div class="p">새 주소에도 이 기기에서 공부한 기록이 있어요. 하나만 쓸 수 있어요.</div>
    <div class="mvc"><div class="on"><div class="k">이전 주소 기록</div><div class="v"><b>${a.n}</b>문제 풀이<br>오답 ${a.w}개</div></div>
      <div><div class="k">새 주소 기록</div><div class="v"><b>${b.n}</b>문제 풀이<br>오답 ${b.w}개</div></div></div>
    <button class="btn" style="width:100%" onclick="mvApply(MV.d)">이전 주소 기록 쓰기</button>
    <button class="btn ghost" style="width:100%;margin-top:8px" onclick="mvKeep()">새 주소 기록 쓰기</button>`);
}
function mvKeep() { const d = MV.d; if (d && Array.isArray(d.go) && d.go.length) mvApply({ g: G, go: d.go }); else closeSheet(); }
