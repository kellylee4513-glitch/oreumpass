/* [user/my.js] 사용자: 내 정보 탭 · 기록 초기화 */
/* ===== 내 정보 ===== */
function myTab() {
  const mine = READY.filter(c => G.passAll || (G.passCerts.includes(c.id) && !((G.passExp || {})[c.id] < Date.now())));
  $app.innerHTML = `<div class="top"><div class="ttl">내 정보</div></div><div class="pad">
    <div class="card prof"><div class="av">${IC.user()}</div><div class="grow"><div style="font-size:18px;font-weight:800">${G.name ? esc(G.name) : '수험생'}님</div><div style="font-size:14px;color:var(--gray);margin-top:3px">${G.passAll ? '전체 PRO 이용 중' : mine.length ? mine.map(c => c.short + (proLeft(c.id) ? ` PRO ${proLeft(c.id)}일 남음` : ' PRO')).join('·') : '무료 이용 중'}</div></div><button class="tag free" onclick="nameSheet()">이름 변경</button></div>
    ${authCfgOn() ? (AU.user ? `<div class="card acct"><div class="grow"><div class="t">${esc(AU.nick || '회원')} <span class="pv">${esc((AU.user.app_metadata && AU.user.app_metadata.provider) === 'kakao' ? '카카오' : 'Google')}</span></div><div class="d">${AU.lastSync ? '학습 기록이 계정에 저장되고 있어요' : '학습 기록을 계정과 맞추는 중이에요'}</div></div><div class="acct-b"><button class="tag free" onclick="nickSheet()">닉네임 변경</button><button class="tag" onclick="authLogout()">로그아웃</button></div></div>` : `<button class="card acct login" onclick="loginPage()"><div class="grow"><div class="t">로그인하고 기록 이어 보기</div><div class="d">카카오·Google로 3초 만에 시작해요. 휴대폰과 PC에서 같은 기록을 볼 수 있어요.</div></div><span class="r">›</span></button>`) : ''}
    
    <div class="sec" style="margin-top:6px">${esc(C.short)} 설정</div>
    <div class="card list" style="padding:4px 20px">
      <button class="li" onclick="go('certs')"><span class="ico">${badge(C, 32)}</span>공부 중인 자격증<span class="r">${esc(C.name)} ›</span></button>
      <button class="li" onclick="examSheet()"><span class="ico">${IC.calendar()}</span>시험일<span class="r">${S.exam ? S.exam.replace(/-/g, '.') : '설정 안 함'} ›</span></button>
      <button class="li" onclick="goalSheet()"><span class="ico">${IC.goal()}</span>하루 목표<span class="r">${S.goal}문제 ›</span></button>

    </div>
    <div class="card list" style="padding:4px 20px">
      ${AU.user ? `<button class="li" onclick="ordersPage()"><span class="ico">${IC.note()}</span>구매 내역<span class="r">${(PAY.orders || []).filter(o => o.status !== 'ready').length}건 ›</span></button>` : ''}
      <button class="li" onclick="faqPage()"><span class="ico">${IC.faq()}</span>이용 안내 · FAQ<span class="r">›</span></button>
      <button class="li" onclick="kakaoAsk()"><span class="ico">${IC.faq()}</span>카카오톡으로 문의하기<span class="r">›</span></button>
      <button class="li" onclick="syncSheet()"><span class="ico">${IC.phone()}</span>기기 간 기록 옮기기<span class="r">아이폰·안드로이드·PC ›</span></button>
      <button class="li" onclick="installGuide()"><span class="ico">${IC.phone()}</span>홈 화면에 추가<span class="r">›</span></button>
      <button class="li danger" onclick="resetAll()"><span class="ico"></span>${esc(C.short)} 학습 기록 초기화</button>
      ${AU.user ? `<button class="li danger" onclick="withdrawPage()"><span class="ico"></span>회원 탈퇴</button>` : ''}
    </div>
    <div class="foot">${policyLinks()}문제는 기출 원문이 아니라 출제 포인트를 바탕으로 직접 만든 문항입니다.<br>${AU.user ? '학습 기록과 구매 내역은 계정에 저장돼요.' : '로그인하지 않으면 학습 기록은 이 브라우저에 저장돼요.'}</div>
  </div>`; tabbar(); }
let resetArm = false;
function resetAll() { if (!resetArm) { resetArm = true; toast('한 번 더 누르면 ' + C.short + ' 기록이 초기화돼요'); setTimeout(() => resetArm = false, 2500); return; } G.data[C.id] = blankCert(); useCert(C.id); save(); resetArm = false; toast('기록을 초기화했어요'); go('home'); }


/* ===== 구매 내역 ===== */
async function ordersPage() { markNav(); window.scrollTo(0, 0);
  try { await syncPurchases(); } catch (e) {}
  const st = { paid: ['결제 완료', 'ok'], canceled: ['환불 완료', ''], failed: ['결제 실패', 'no'] };
  const L = (PAY.orders || []).filter(o => o.status !== 'ready');
  const d = t => t ? new Date(t).toLocaleDateString('ko-KR') : '';
  $app.innerHTML = topBar('구매 내역', '', "go('my')") + `<div class="pad upage">
    ${L.length ? `<div class="card list" style="padding:4px 20px">${L.map(o => `<div class="li" style="display:block;padding:14px 0"><div style="display:flex;justify-content:space-between;gap:10px"><b style="font-size:15px">${esc(o.order_name)}</b><span class="bst ${(st[o.status] || ['', ''])[1]}">${(st[o.status] || [o.status])[0]}</span></div><div style="font-size:13px;color:var(--gray);margin-top:4px">${won(o.amount)} · ${d(o.approved_at || o.created_at)} · 주문번호 ${esc(o.id)}</div>${o.status === 'paid' && (o.item === 'note' || o.item === 'bundle') ? `<button class="btn ghost" style="margin-top:10px;width:100%" onclick="noteDownload('${o.cert}')">요약노트 PDF 내려받기</button>` : ''}</div>`).join('')}</div>`
      : `<div class="empty">아직 구매 내역이 없어요</div>`}
    <div class="card" style="font-size:13px;color:var(--sub);line-height:1.6">환불은 결제 후 7일 이내에 카카오톡 채널이나 고객센터로 주문번호와 함께 요청해 주세요. <a role="button" tabindex="0" onclick="legalPage('refund')" style="text-decoration:underline">환불 규정 보기</a></div>
    <button class="btn ka-btn" onclick="kakaoAsk()">카카오톡으로 환불·결제 문의</button>
  </div>`; tabbar();
}


/* ===== 회원 탈퇴 ===== */
function withdrawPage() { if (!AU.user) { go('my'); return; } markNav(); window.scrollTo(0, 0);
  $app.innerHTML = topBar('회원 탈퇴', '', "go('my')") + `<div class="pad upage">
    <div class="card" style="padding:20px">
      <div style="font-size:17px;font-weight:800;margin-bottom:10px">탈퇴하기 전에 확인해 주세요</div>
      <div style="font-size:14px;line-height:1.7;color:var(--sub)">
      · 계정에 저장된 <b>학습 기록·닉네임·커뮤니티 글과 댓글</b>이 모두 지워지고 되돌릴 수 없어요.<br>
      · 남아 있는 <b>PRO 이용 기간</b>과 <b>요약노트 다시 받기</b>도 함께 사라져요. 환불이 필요하면 탈퇴 전에 먼저 문의해 주세요.<br>
      · 결제 기록은 전자상거래법에 따라 5년 동안 보관한 뒤 파기해요. 이 기록은 회원 정보와 연결되지 않아요.<br>
      · 이 기기에 저장된 학습 기록은 남아 있어요. 지우려면 탈퇴 뒤 ‘학습 기록 초기화’를 눌러 주세요.</div>
    </div>
    <div class="sec">확인을 위해 <b>탈퇴</b>라고 입력해 주세요</div>
    <input id="wdIn" class="inp" style="width:100%;box-sizing:border-box;padding:14px;border-radius:12px;border:1px solid var(--line);font-size:16px" placeholder="탈퇴" autocomplete="off">
    <button class="btn" id="wdBtn" style="width:100%;margin-top:12px;background:var(--red)" onclick="withdrawGo()">회원 탈퇴하기</button>
    <button class="btn ghost" style="width:100%;margin-top:8px" onclick="kakaoAsk()">탈퇴 전에 문의하기</button>
  </div>`; tabbar(); }
async function withdrawGo() {
  const v = (document.getElementById('wdIn') || {}).value || '';
  if (v.trim() !== '탈퇴') { toast('‘탈퇴’라고 입력해 주세요'); return; }
  const b = document.getElementById('wdBtn'); if (b) { b.disabled = true; b.textContent = '처리하는 중이에요'; }
  try {
    await payFn({ action: 'delete_account', confirm: '탈퇴' });
    try { await AU.sb.auth.signOut(); } catch (e) {}
    AU.user = null; AU.nick = ''; G.passCerts = []; G.passExp = {}; PAY.orders = []; PAY.owned = {}; save(true);
    toast('탈퇴가 완료됐어요. 그동안 이용해 주셔서 고마워요'); go('my');
  } catch (e) { if (b) { b.disabled = false; b.textContent = '회원 탈퇴하기'; } toast('탈퇴를 처리하지 못했어요. 잠시 뒤 다시 해 주세요'); }
}
