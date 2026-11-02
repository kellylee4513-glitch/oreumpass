/* [core/state.js] 상태·저장소: 자격증 레지스트리, 현재 자격증 값, 전역 상태(G/S), localStorage */
/* ===== 자격증 레지스트리 ===== */
const READY = window.CERTS || [];
const SOON = (window.CATALOG_SOON || []).filter(c => !READY.some(r => r.id === c.id));
const ALL_PRICE = 24900, ALL_LIST = 39900; /* 통합 패스 가격(임시) */
const won = n => n.toLocaleString('ko-KR') + '원';

/* 현재 자격증에 맞춰 바뀌는 값들 */
let C, Q, OX, SK, SUBJ, SUBJ_FULL, SUBJ_SHORT, PASS, PDF_LINK;
function useCert(id) {
  C = READY.find(c => c.id === id) || READY[0];
  Q = C.questions; OX = C.ox || [];
  SK = Object.keys(C.subjects).map(Number);
  SUBJ = { 0: '전체' }; SUBJ_FULL = {}; SUBJ_SHORT = {};
  SK.forEach(k => { SUBJ[k] = k + '과목'; SUBJ_FULL[k] = C.subjects[k].full; SUBJ_SHORT[k] = C.subjects[k].short; });
  PASS = C.pass; PDF_LINK = C.pdf || '#';
  G.cur = C.id;
  G.data[C.id] = cleanCert(G.data[C.id]);
  S = G.data[C.id];
  NT.k = ''; BK.s = 0; BK.q = ''; unitSel = [];
  SK.forEach(k => { if (!S.subj[k]) S.subj[k] = { t: 0, c: 0 }; });
}

/* ===== 상태: G(공통) + S(현재 자격증) ===== */
const KEY = 'oreumpass_v3';
const blankCert = () => ({ wrong: [], wrongOx: [], star: [], seen: [], solved: 0, correct: 0, subj: {}, days: {}, hist: [], goal: 10, exam: '', dox: null, goalDone: '' });
const blankG = () => ({ cur: '', name: '', installHidden: false, passAll: false, passCerts: [], data: {} });
let G = blankG(), S = null;
/* 저장된 값(또는 가져온 기록 코드)을 안전한 모양으로 정리 */
const isIds = a => Array.isArray(a) ? [...new Set(a.filter(x => Number.isInteger(x) && x >= 0))] : [];
const isDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const plainObj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const num0 = v => Number.isFinite(+v) && +v >= 0 ? +v : 0;
const safeKey = k => typeof k === 'string' && k.length <= 60 && k !== '__proto__' && k !== 'constructor' && k !== 'prototype';
/* 키를 걸러 새 객체로 다시 만들기(가져온 값은 절대 그대로 쓰지 않음) */
function mapObj(v, keyOk, fn) { const o = {}; Object.entries(plainObj(v)).forEach(([k, x]) => { if (!safeKey(k) || !keyOk(k)) return; const y = fn(x); if (y !== undefined) o[k] = y; }); return o; }
const idKey = k => /^\d{1,5}$/.test(k), anyKey = () => true;
const tc = x => { x = plainObj(x); return { t: num0(x.t), c: Math.min(num0(x.c), num0(x.t)) }; };
function cleanCert(d) {
  d = plainObj(d); const o = blankCert();
  ['wrong', 'wrongOx', 'star', 'seen', 'cardOk'].forEach(k => o[k] = isIds(d[k]));
  ['solved', 'correct'].forEach(k => o[k] = Math.floor(num0(d[k])));
  o.goal = Number.isFinite(+d.goal) && +d.goal >= 1 && +d.goal <= 200 ? Math.floor(+d.goal) : 10;
  o.exam = isDate(d.exam) ? d.exam : '';
  o.goalDone = isDate(d.goalDone) ? d.goalDone : '';
  o.popDay = isDate(d.popDay) ? d.popDay : '';
  o.subj = mapObj(d.subj, idKey, tc);
  o.days = mapObj(d.days, isDate, v => num0(v));
  o.hist = (Array.isArray(d.hist) ? d.hist : []).filter(h => h && isDate(h.d)).slice(0, 30).map(h => ({ d: h.d, l: String(h.l || '').slice(0, 40), s: num0(h.s), t: Math.max(1, num0(h.t)), ms: num0(h.ms) }));
  o.badges = mapObj(d.badges, k => /^[a-z0-9_]{1,20}$/.test(k), v => isDate(v) ? v : undefined);
  o.dq = d.dq && isDate(d.dq.d) ? { d: d.dq.d, s: Math.min(5, num0(d.dq.s)) } : null;
  o.dox = d.dox && isDate(d.dox.d) && typeof d.dox.v === 'boolean' ? { d: d.dox.d, v: d.dox.v } : null;
  o.tw = d.tw && isDate(d.tw.d) ? { d: d.tw.d, ids: isIds(d.tw.ids) } : null;
  o.spd = d.spd && typeof d.spd === 'object' ? { n: Math.floor(num0(d.spd.n)), ms: num0(d.spd.ms) } : { n: 0, ms: 0 };
  o.srs = mapObj(d.srs, idKey, x => { x = plainObj(x); return { b: Math.min(4, Math.floor(num0(x.b))), d: isDate(x.d) ? x.d : '' }; });
  o.ustat = mapObj(d.ustat, anyKey, tc);
  o.qstat = mapObj(d.qstat, idKey, x => { x = plainObj(x); return { t: num0(x.t), w: Math.min(num0(x.w), num0(x.t)) }; });
  o.why = mapObj(d.why, idKey, v => typeof v === 'string' && /^[a-z]{1,12}$/.test(v) ? v : undefined);
  o.setBest = mapObj(d.setBest, idKey, v => Number.isFinite(+v) ? Math.max(0, Math.min(100, Math.round(+v))) : undefined);
  o.memo = mapObj(d.memo, idKey, v => typeof v === 'string' ? v.slice(0, 2000) : undefined);
  return o;
}
function cleanG(v, keepPay) {
  v = plainObj(v); const g = blankG();
  g.cur = READY.some(c => c.id === v.cur) ? v.cur : ''; g.name = String(v.name || '').slice(0, 20); g.installHidden = !!v.installHidden;
  if (keepPay) { g.passAll = !!v.passAll; g.passCerts = Array.isArray(v.passCerts) ? v.passCerts.filter(x => READY.some(c => c.id === x)) : []; }
  Object.entries(plainObj(v.data)).forEach(([k, d]) => { if (safeKey(k) && READY.some(c => c.id === k)) g.data[k] = cleanCert(d); });
  return g;
}
try { const raw = localStorage.getItem(KEY); if (raw) G = cleanG(JSON.parse(raw), true); } catch (e) { try { localStorage.setItem(KEY + '_backup', localStorage.getItem(KEY) || ''); } catch (x) {} G = blankG(); }
let saveWarned = false;
function save() { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) { if (!saveWarned) { saveWarned = true; setTimeout(() => toast('저장 공간이 부족해 기록이 저장되지 않아요'), 50); } } }
/* 다른 탭(설치 앱·브라우저)에서 기록이 바뀌면 새로 불러오기 */
window.addEventListener('storage', e => { if (e.key === KEY && !run) location.reload(); });
const isPro = () => G.passAll || G.passCerts.includes(C.id);

const $app = document.getElementById('app');
let run = null, tab = 'home', wnTab = 'cbt', afterPay = null, timer = null;

