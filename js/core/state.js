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
  if (!G.data[C.id]) G.data[C.id] = blankCert();
  S = G.data[C.id];
  SK.forEach(k => { if (!S.subj[k]) S.subj[k] = { t: 0, c: 0 }; });
}

/* ===== 상태: G(공통) + S(현재 자격증) ===== */
const KEY = 'oreumpass_v3';
const blankCert = () => ({ wrong: [], wrongOx: [], star: [], seen: [], solved: 0, correct: 0, subj: {}, days: {}, hist: [], goal: 10, exam: '', dox: null, goalDone: '' });
const blankG = () => ({ cur: '', name: '', installHidden: false, passAll: false, passCerts: [], data: {} });
let G = blankG(), S = null;
try { const v = JSON.parse(localStorage.getItem(KEY)); if (v) G = Object.assign(blankG(), v); } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) {} }
const isPro = () => G.passAll || G.passCerts.includes(C.id);

const $app = document.getElementById('app');
let run = null, tab = 'home', wnTab = 'cbt', afterPay = null, timer = null;

