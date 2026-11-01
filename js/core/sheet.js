/* [core/sheet.js] 바텀 시트 · 시험일·목표·이름 설정 */
/* ===== 시트 ===== */
function openSheet(html) { markNav(); const sh = document.getElementById('sheet'); sh.innerHTML = '<div class="grab"></div>' + html; document.getElementById('dim').classList.add('show'); sh.classList.add('show'); }
function closeSheet() { document.getElementById('dim').classList.remove('show'); document.getElementById('sheet').classList.remove('show'); }
document.getElementById('dim').onclick = closeSheet;
function examSheet() { openSheet(`<div class="hi">${IC.calendar()}</div><h3>${esc(C.short)} 시험일이 언제예요?</h3><div class="p">D-day와 하루에 풀 문제 수를 계산해 드려요</div>
  <input class="field" type="date" id="exam" value="${S.exam}" min="${dkey()}"><button class="btn" style="width:100%" onclick="S.exam=document.getElementById('exam').value;save();closeSheet();go(tab)">저장하기</button>`); }
function goalSheet() { openSheet(`<div class="hi">${IC.goal()}</div><h3>하루에 몇 문제 풀까요?</h3><div class="p">부담 없는 목표가 오래 가요</div>
  <div class="goals">${[5, 10, 20, 30].map(n => `<button class="${S.goal === n ? 'on' : ''}" onclick="S.goal=${n};save();closeSheet();go(tab)">${n}문제</button>`).join('')}</div>`); }
function nameSheet() { openSheet(`<h3>뭐라고 불러 드릴까요?</h3><div class="p">홈 화면 인사말에 표시돼요</div>
  <input class="field" id="nm" maxlength="10" placeholder="이름 또는 닉네임" value="${esc(G.name)}"><button class="btn" style="width:100%" onclick="G.name=document.getElementById('nm').value.trim();save();closeSheet();go(tab)">저장하기</button>`); }

