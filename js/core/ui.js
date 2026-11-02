/* [core/ui.js] 공통 UI 유틸: 날짜·토스트·셔플·기록(record)·탭바·상단바·화면 이동(go) */
/* ===== 유틸 ===== */
const pad2 = n => String(n).padStart(2, '0');
function dkey(d = new Date()) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function today() { return S.days[dkey()] || 0; }
function streakOf(days) { let n = 0, d = new Date(); if (!days[dkey(d)]) d.setDate(d.getDate() - 1); while (days[dkey(d)]) { n++; d.setDate(d.getDate() - 1); } return n; }
function streak() { return streakOf(S.days); }
function dday(ex) { ex = ex === undefined ? S.exam : ex; if (!ex) return null; return Math.round((new Date(ex + 'T00:00:00') - new Date(dkey() + 'T00:00:00')) / 864e5); }
function acc(s) { const o = S.subj[s]; return o && o.t ? Math.round(o.c / o.t * 100) : null; }
function weakest() { const t = SK.map(s => ({ s, a: acc(s) })).filter(x => x.a !== null); return t.length ? t.reduce((m, x) => x.a < m.a ? x : m) : null; }
function toast(m) { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1800); }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fmt(ms) { const s = Math.max(0, Math.floor(ms / 1000)); return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60); }
function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
function shuffle(a) { return a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]); }
function pool(s) { return Q.map((q, i) => Object.assign({ id: i }, q)).filter(q => !s || q.s === s); }
function record(s, ok, qid) {
  S.solved++; if (ok) S.correct++; S.subj[s].t++; if (ok) S.subj[s].c++;
  const k = dkey(); S.days[k] = (S.days[k] || 0) + 1;
  if (qid !== undefined && !S.seen.includes(qid)) S.seen.push(qid);
  if (qid !== undefined && !ok) { const d = dkey(); if (!S.tw || S.tw.d !== d) S.tw = { d, ids: [] }; if (!S.tw.ids.includes(qid)) S.tw.ids.push(qid); }
  if (qid !== undefined) { srsHit(qid, ok); const uk = unitKey(Q[qid]); S.ustat = S.ustat || {}; const u = S.ustat[uk] = S.ustat[uk] || { t: 0, c: 0 }; u.t++; if (ok) u.c++; }
  if (S.days[k] >= S.goal && S.goalDone !== k) { S.goalDone = k; setTimeout(celebrate, 350); }
}
function celebrate() { const c = document.createElement('div'); c.className = 'confetti'; const col = ['#3182F6', '#FFB800', '#F04452', '#00C471', '#FF8A00']; for (let i = 0; i < 60; i++) { const e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.background = col[i % 5]; e.style.animationDelay = Math.random() * .5 + 's'; e.style.animationDuration = 1.2 + Math.random() + 's'; c.appendChild(e); } document.body.appendChild(c); setTimeout(() => c.remove(), 2800); toast('오늘 목표 ' + S.goal + '문제 달성! 🎉'); }
function badge(c, size) { return certIcon(c, size || 44); }

function bottom(html) { document.querySelectorAll('.bottom,.tabbar').forEach(e => e.remove()); if (!html) return; const b = document.createElement('div'); b.className = 'bottom'; b.innerHTML = '<div class="wrap"><div class="side-logo"><img src="icon-192.png" alt="">' + WORDMARK + '</div>' + html + '</div>'; document.body.appendChild(b); }
const TI = { certs: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="2.2"/><rect x="13" y="3" width="8" height="8" rx="2.2"/><rect x="3" y="13" width="8" height="8" rx="2.2"/><circle cx="17" cy="17" r="4.2"/></svg>', home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.3 2.6a1 1 0 011.4 0l8.5 8a1 1 0 01-.7 1.7H19v8a1.7 1.7 0 01-1.7 1.7h-3.1v-5.5h-4.4V22H6.7A1.7 1.7 0 015 20.3v-8H3.5a1 1 0 01-.7-1.7z"/></svg>',
  study: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="12" width="4.5" height="9" rx="1.5"/><rect x="9.75" y="7" width="4.5" height="14" rx="1.5"/><rect x="16.5" y="3" width="4.5" height="18" rx="1.5"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm3 5a1 1 0 000 2h8a1 1 0 100-2zm0 4a1 1 0 000 2h5a1 1 0 100-2z"/></svg>',
  my: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.5"/><path d="M3.5 20.5c0-4 3.8-7 8.5-7s8.5 3 8.5 7a1 1 0 01-1 1h-15a1 1 0 01-1-1z"/></svg>' };
function tabbar() { enterAnim(); document.querySelectorAll('.bottom,.tabbar').forEach(e => e.remove()); const b = document.createElement('nav'); b.className = 'tabbar'; b.innerHTML = '<div class="wrap"><div class="side-logo"><img src="icon-192.png" alt="">' + WORDMARK + '</div>' + [['home', '홈'], ['certs', '자격증'], ['study', '기록'], ['note', '복습노트'], ['my', '내 정보']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" onclick="go('${k}')">${TI[k]}${l}</button>`).join('') + '</div>'; document.body.appendChild(b); }
function topBar(title, right, backFn) { return `<div class="top"><button class="back" onclick="${backFn || 'go(tab)'}" aria-label="뒤로"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="#191F28" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="ttl">${title}</div><div class="right" id="tr">${right || ''}</div></div>`; }
function go(t) { closeSheet(); stopTimer(); run = null; $app.classList.remove('wide'); if (t === 'note' && !isPro()) { paywall('wrong'); return; } tab = t; window.scrollTo(0, 0); ({ home, certs: () => certPicker(false), study: studyTab, note: wrongNote, my: myTab })[t](); }
const lockTag = () => `<span class="tag pro">${IC.lock()} PRO</span>`;
function brandBar() { return `<div class="top"><div class="logo"><img src="icon-192.png" alt="" onerror="this.remove()">${WORDMARK}</div><button class="switch" onclick="go('certs')">${badge(C, 22)}<span>${esc(C.short)}</span><svg width="14" height="14" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`; }


/* 키보드: 버튼 역할을 하는 카드도 Enter·Space로 누를 수 있게 */
document.addEventListener('keydown', e => { const t = e.target; if ((e.key === 'Enter' || e.key === ' ') && t && t.getAttribute && t.getAttribute('role') === 'button' && t.tagName !== 'BUTTON') { e.preventDefault(); t.click(); } });
