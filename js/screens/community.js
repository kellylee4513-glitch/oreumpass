/* [screens/community.js] 커뮤니티: 게시판(자유·합격 후기·시험 후기·질문) · 글 · 댓글 · 좋아요 · 신고 */
const BOARDS = [['all', '전체'], ['free', '자유'], ['pass', '합격 후기'], ['exam', '시험 후기'], ['qna', '질문']];
const boardName = k => (BOARDS.find(b => b[0] === k) || [k, k])[1];
const CM = { board: 'all', cert: 'all', sort: 'new', q: '', page: 0, list: [], more: false, loading: false, err: '' };
const PAGE = 20;
const certLabel = id => id === 'common' ? '공통' : ((READY.find(c => c.id === id) || SOON.find(c => c.id === id) || {}).short || id);
function ago(t) { const s = (Date.now() - new Date(t).getTime()) / 1000; if (s < 60) return '방금'; if (s < 3600) return Math.floor(s / 60) + '분 전'; if (s < 86400) return Math.floor(s / 3600) + '시간 전'; if (s < 86400 * 7) return Math.floor(s / 86400) + '일 전'; return String(t).slice(0, 10).replace(/-/g, '.'); }
function commTab() {
  window.scrollTo(0, 0); $app.classList.remove('wide');
  const head = `<div class="top"><div class="ttl">커뮤니티</div>${authOn() ? `<button class="cm-w" onclick="commWrite()">${IC_PEN}글쓰기</button>` : ''}</div>`;
  if (!authOn()) { const web = authCfg().webUrl; $app.innerHTML = head + `<div class="pad upage"><div class="cm-empty"><div class="e">💬</div>${authSandbox() && web ? `<b>커뮤니티는 웹 앱에서 열려요</b><div>로그인과 커뮤니티는 더오를패스 웹 앱에서 이용할 수 있어요.</div><a class="cm-more" style="display:inline-block;width:auto;padding:12px 18px;margin-top:14px" href="${web}" target="_blank" rel="noopener">웹 앱 열기</a>` : `<b>커뮤니티를 준비하고 있어요</b><div>합격 후기, 시험 후기, 질문을 함께 나눌 수 있는 공간이 곧 열려요.</div>`}</div></div>`; tabbar(); return; }
  const certs = [['all', '전체 자격증'], ...READY.map(c => [c.id, c.short]), ['common', '공통']];
  $app.innerHTML = head + `<div class="pad upage">
    <div class="cm-tabs" role="tablist">${BOARDS.map(([k, l]) => `<button class="${CM.board === k ? 'on' : ''}" onclick="CM.board='${k}';commLoad(true)">${l}</button>`).join('')}</div>
    <div class="cm-bar"><select class="cm-sel" aria-label="자격증" onchange="CM.cert=this.value;commLoad(true)">${certs.map(([k, l]) => `<option value="${k}" ${CM.cert === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <select class="cm-sel" aria-label="정렬" onchange="CM.sort=this.value;commLoad(true)"><option value="new" ${CM.sort === 'new' ? 'selected' : ''}>최신순</option><option value="hot" ${CM.sort === 'hot' ? 'selected' : ''}>인기순</option><option value="cmt" ${CM.sort === 'cmt' ? 'selected' : ''}>댓글순</option></select>
      <form class="cm-q" onsubmit="event.preventDefault();CM.q=this.q.value.trim();commLoad(true)"><input name="q" placeholder="제목 검색" value="${esc(CM.q)}" maxlength="30"></form></div>
    <div id="cmList"><div class="cm-load">불러오는 중…</div></div></div>`;
  tabbar(); commLoad(true);
}
function commRefresh() { if (document.getElementById('cmList')) commLoad(true); }
async function commLoad(reset) {
  if (reset) { CM.page = 0; CM.list = []; }
  const el = document.getElementById('cmList'); if (!el) return;
  try {
    await authInit(); if (!AU.sb) throw new Error(AU.err || 'no');
    let q = AU.sb.from('posts').select('id,board,cert,title,views,likes,comments,pinned,created_at,user_id,profiles!posts_user_id_fkey(nickname)');
    if (CM.board !== 'all') q = q.eq('board', CM.board);
    if (CM.cert !== 'all') q = q.eq('cert', CM.cert);
    if (CM.q) q = q.ilike('title', '%' + CM.q.replace(/[%_,()]/g, '') + '%');
    q = q.order('pinned', { ascending: false });
    q = CM.sort === 'hot' ? q.order('likes', { ascending: false }) : CM.sort === 'cmt' ? q.order('comments', { ascending: false }) : q;
    q = q.order('created_at', { ascending: false }).range(CM.page * PAGE, CM.page * PAGE + PAGE);
    const { data, error } = await q; if (error) throw error;
    CM.more = data.length > PAGE; CM.list = CM.list.concat(data.slice(0, PAGE)); CM.err = '';
  } catch (e) { CM.err = '글을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.'; }
  const row = p => `<button class="cm-row${p.pinned ? ' pin' : ''}" onclick="commOpen(${p.id})"><div class="cm-tags">${p.pinned ? '<span class="tg n">공지</span>' : ''}<span class="tg">${esc(certLabel(p.cert))}</span><span class="tg b">${esc(boardName(p.board))}</span></div><div class="cm-t">${esc(p.title)}${p.comments ? ` <span class="cm-cc">[${p.comments}]</span>` : ''}</div><div class="cm-m">${esc(p.profiles ? p.profiles.nickname : '알 수 없음')} · ${ago(p.created_at)} · 조회 ${p.views} · 좋아요 ${p.likes}</div></button>`;
  const guide = `<div class="card cm-guide"><div class="cm-tags"><span class="tg n">공지</span><span class="tg b">운영</span></div><div class="cm-t">커뮤니티 이용 안내</div><div class="cm-gd">합격 후기, 시험장 팁, 공부 질문을 자유롭게 나눠 주세요.<br>· 시험 문제를 그대로 옮기거나 유료 자료를 올리면 삭제돼요.<br>· 욕설·광고·개인정보가 담긴 글은 신고가 5건 쌓이면 자동으로 숨겨져요.<br>· 문제 오류 제보는 문제 화면의 ⚠ 버튼이 가장 빨라요.</div></div>`;
  el.innerHTML = CM.err ? `<div class="cm-empty">${CM.err}</div>` : CM.list.length
    ? guide + `<div class="card cm-list">${CM.list.map(row).join('')}</div>${CM.more ? `<button class="cm-more" onclick="CM.page++;commLoad(false)">더 보기</button>` : ''}`
    : guide + `<div class="cm-empty"><b>아직 글이 없어요</b><div>첫 글을 남겨 보세요. 합격 후기는 다음 수험생에게 큰 힘이 돼요.</div></div>`;
}
async function commOpen(id) { markNav();
  window.scrollTo(0, 0);
  $app.innerHTML = topBar('커뮤니티', '', "go('comm')") + `<div class="pad upage"><div class="cm-load">불러오는 중…</div></div>`; tabbar();
  try {
    const { data: p, error } = await AU.sb.from('posts').select('*, profiles!posts_user_id_fkey(nickname)').eq('id', id).maybeSingle();
    if (error || !p) throw error || 0;
    AU.sb.rpc('view_post', { pid: id }).then(() => {}, () => {});
    const { data: cs } = await AU.sb.from('comments').select('id,body,created_at,user_id,profiles!comments_user_id_fkey(nickname)').eq('post_id', id).order('created_at');
    let liked = false; if (AU.user) { const { data: lk } = await AU.sb.from('likes').select('post_id').eq('post_id', id).maybeSingle(); liked = !!lk; }
    const mine = AU.user && AU.user.id === p.user_id;
    $app.querySelector('.upage').innerHTML = `<div class="card cm-post"><div class="cm-tags"><span class="tg">${esc(certLabel(p.cert))}</span><span class="tg b">${esc(boardName(p.board))}</span></div>
      <h2 class="cm-h">${esc(p.title)}</h2><div class="cm-m">${esc(p.profiles ? p.profiles.nickname : '알 수 없음')} · ${ago(p.created_at)} · 조회 ${p.views + 1}</div>
      <div class="cm-body">${esc(p.body)}</div>
      <div class="cm-act"><button class="cm-like${liked ? ' on' : ''}" onclick="commLike(${p.id},${liked})">♥ 좋아요 ${p.likes}</button>
        ${mine ? `<button class="cm-lnk" onclick="commWrite(${p.id})">수정</button><button class="cm-lnk" onclick="commDel('post',${p.id})">삭제</button>` : `<button class="cm-lnk" onclick="commReport('post',${p.id})">신고</button>`}</div></div>
      <div class="sec">댓글 ${(cs || []).length}</div>
      <div class="card cm-cmts">${(cs || []).map(c => `<div class="cm-c"><div class="cm-m"><b>${esc(c.profiles ? c.profiles.nickname : '알 수 없음')}</b> · ${ago(c.created_at)}${AU.user && AU.user.id === c.user_id ? ` · <a role="button" tabindex="0" onclick="commDel('comment',${c.id},${p.id})">삭제</a>` : ` · <a role="button" tabindex="0" onclick="commReport('comment',${c.id})">신고</a>`}</div><div class="cm-cb">${esc(c.body)}</div></div>`).join('') || '<div class="cm-m">첫 댓글을 남겨 보세요.</div>'}
        <form class="cm-cf" onsubmit="event.preventDefault();commComment(${p.id},this.b)"><textarea name="b" maxlength="1000" rows="2" placeholder="${AU.user ? '댓글을 입력하세요' : '로그인하고 댓글을 남겨 보세요'}" ${AU.user ? '' : 'readonly onclick="loginSheet()"'}></textarea><button>등록</button></form></div>
      <div class="cm-rule">서로 존중하는 말로 써 주세요. 욕설·광고·개인정보·문제 무단 복제 글은 신고를 받아 숨겨질 수 있어요.</div>`;
  } catch (e) { $app.querySelector('.upage').innerHTML = `<div class="cm-empty">글을 찾을 수 없어요. 삭제되었거나 숨겨진 글일 수 있어요.</div>`; }
}
const needLogin = why => { if (AU.user) return false; loginSheet(why); return true; };
async function commLike(id, liked) {
  if (needLogin('로그인하면 좋아요를 누를 수 있어요.')) return;
  const r = liked ? await AU.sb.from('likes').delete().eq('post_id', id).eq('user_id', AU.user.id) : await AU.sb.from('likes').insert({ post_id: id });
  if (r.error) { toast('잠시 뒤 다시 시도해 주세요'); return; } commOpen(id);
}
async function commComment(id, ta) {
  if (needLogin('로그인하면 댓글을 쓸 수 있어요.')) return;
  const b = ta.value.trim(); if (!b) return;
  const { error } = await AU.sb.from('comments').insert({ post_id: id, body: b });
  if (error) { toast(/10초/.test(error.message) ? '댓글은 10초에 한 번만 쓸 수 있어요' : '댓글을 등록하지 못했어요'); return; } commOpen(id);
}
let delArm = '';
async function commDel(kind, id, back) {
  const key = kind + id; if (delArm !== key) { delArm = key; toast('한 번 더 누르면 삭제돼요'); setTimeout(() => { delArm = ''; }, 2500); return; }
  delArm = ''; const { error } = await AU.sb.from(kind === 'post' ? 'posts' : 'comments').delete().eq('id', id);
  if (error) { toast('삭제하지 못했어요'); return; } toast('삭제했어요'); kind === 'post' ? go('comm') : commOpen(back);
}
function commReport(kind, id) {
  if (needLogin('로그인하면 신고할 수 있어요.')) return;
  openSheet(`<h3>신고하기</h3><div class="p">신고가 여러 번 쌓이면 자동으로 숨겨져요.</div>${['욕설·비방', '광고·홍보', '개인정보 노출', '문제·자료 무단 복제', '기타'].map(r => `<button class="li" onclick="commReportSend('${kind}',${id},'${r}')">${r}<span class="r">›</span></button>`).join('')}`);
}
async function commReportSend(kind, id, reason) {
  const { error } = await AU.sb.from('reports').insert({ target: kind, target_id: id, reason });
  closeSheet(); toast(error ? (/duplicate|unique/.test(error.message) ? '이미 신고한 글이에요' : '신고하지 못했어요') : '신고를 접수했어요');
}
async function commWrite(editId) {
  if (needLogin('로그인하면 글을 쓸 수 있어요.')) return;
  markNav(); let p = { board: CM.board === 'all' ? 'free' : CM.board, cert: C ? C.id : 'common', title: '', body: '' };
  if (editId) { const { data } = await AU.sb.from('posts').select('*').eq('id', editId).maybeSingle(); if (data) p = data; }
  const certs = [...READY.map(c => [c.id, c.short]), ['common', '공통']];
  $app.innerHTML = topBar(editId ? '글 수정' : '글쓰기', '', editId ? `commOpen(${editId})` : "go('comm')") + `<div class="pad upage"><form class="cm-form" onsubmit="event.preventDefault();commSave(this,${editId || 0})">
    <div class="cm-row2"><select name="board" class="cm-sel">${BOARDS.slice(1).map(([k, l]) => `<option value="${k}" ${p.board === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <select name="cert" class="cm-sel">${certs.map(([k, l]) => `<option value="${k}" ${p.cert === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
    <input name="title" class="field" maxlength="80" placeholder="제목 (2~80자)" value="${esc(p.title)}" required>
    <textarea name="body" class="field cm-ta" maxlength="5000" placeholder="내용을 입력하세요. 합격 후기라면 공부 기간, 자주 본 자료, 시험장 팁을 남겨 주시면 큰 도움이 돼요." required>${esc(p.body)}</textarea>
    <div class="cm-rule">시험 문제를 그대로 옮기거나 유료 자료를 올리면 저작권 문제로 숨겨질 수 있어요.</div>
    <button class="btn" style="width:100%">${editId ? '수정하기' : '등록하기'}</button></form></div>`; tabbar();
}
async function commSave(f, editId) {
  const v = { board: f.board.value, cert: f.cert.value, title: f.title.value.trim(), body: f.body.value.trim() };
  if (v.title.length < 2) { toast('제목을 2자 이상 써 주세요'); return; } if (v.body.length < 2) { toast('내용을 2자 이상 써 주세요'); return; }
  const r = editId ? await AU.sb.from('posts').update(v).eq('id', editId).select('id').single() : await AU.sb.from('posts').insert(v).select('id').single();
  if (r.error) { toast(/1분/.test(r.error.message) ? '글은 1분에 한 번만 쓸 수 있어요' : '등록하지 못했어요'); return; }
  toast(editId ? '수정했어요' : '등록했어요'); commOpen(r.data.id);
}
const IC_PEN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>';
