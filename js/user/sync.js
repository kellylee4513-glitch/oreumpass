/* [user/sync.js] 사용자: 기기 간 기록 옮기기(기록 코드) */
/* ===== 기기 간 기록 옮기기 (서버 없이 코드로) ===== */
function exportCode() { const j = JSON.stringify(G); return 'OREUM1:' + btoa(unescape(encodeURIComponent(j))); }
function syncSheet() {
  openSheet(`<div class="hi">${IC.phone()}</div><h3>다른 기기로 기록 옮기기</h3><div class="p">아이폰 ↔ 안드로이드 ↔ PC, 사파리 ↔ 홈 화면 앱 사이에서 풀이 기록·오답노트·북마크를 그대로 옮겨요</div>
    <div class="feat"><span class="ck">1</span><span>지금 기기에서 <b>내 기록 코드 복사</b>를 눌러요</span></div>
    <div class="feat"><span class="ck">2</span><span>카톡 나에게 보내기·메모 앱으로 새 기기에 보내요</span></div>
    <div class="feat"><span class="ck">3</span><span>새 기기에서 <b>기록 코드 붙여넣기</b>에 넣어요</span></div>
    <button class="btn" style="width:100%;margin:12px 0 10px" onclick="copyText(exportCode(),'기록 코드를 복사했어요')">내 기록 코드 복사</button>
    <textarea id="imp" class="field memo" style="height:84px;padding:12px" placeholder="여기에 기록 코드를 붙여넣어요 (OREUM1:…)"></textarea>
    <button class="btn ghost" style="width:100%" onclick="importCode()">기록 코드 붙여넣기</button>
    <div class="note">붙여넣으면 이 기기의 기록이 코드 속 기록으로 바뀌어요. 로그인 기능이 생기면 자동으로 이어지게 할게요.</div>`);
}
let impArm = false;
function importCode() {
  const v = (document.getElementById('imp').value || '').trim();
  try { if (!v.startsWith('OREUM1:')) throw 0; const g = JSON.parse(decodeURIComponent(escape(atob(v.slice(7))))); if (!g || typeof g !== 'object' || !g.data) throw 0;
    if (!impArm) { impArm = true; toast('한 번 더 누르면 이 기기 기록이 바뀌어요'); setTimeout(() => impArm = false, 2500); return; }
    impArm = false; const ng = cleanG(g, false); ng.passAll = G.passAll; ng.passCerts = G.passCerts.slice(); G = ng; useCert(G.cur && READY.some(c => c.id === G.cur) ? G.cur : READY[0].id); save(); closeSheet(); toast('기록을 옮겨 왔어요'); go('home');
  } catch (e) { toast('기록 코드가 올바르지 않아요'); }
}

