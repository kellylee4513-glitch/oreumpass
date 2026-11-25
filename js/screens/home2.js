/* [screens/home2.js] 홈: 오늘 할 일 하나만 크게 (D-day 띠 · 오늘 할 일 · 합격선까지 · 다른 방법으로 풀기) */
const HM_MOUNT = '<svg class="hm-mt" viewBox="0 0 120 60" aria-hidden="true"><path d="M0 60 L38 22 L56 40 L78 14 L120 60Z" fill="#6E86C8"/><path d="M78 14 L86 24 L80 22 L72 26Z" fill="#fff"/></svg>';

/* 이번 주 월~일 공부 여부 */
function hmWeek() {
  const now = new Date(), mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const tk = dkey();
  return ['월', '화', '수', '목', '금', '토', '일'].map((n, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i); const k = dkey(d);
    const st = k === tk ? 'now' : (S.days[k] ? 'done' : '');
    return `<span class="hm-d ${st}" aria-label="${n}요일${S.days[k] ? ' 공부함' : ''}">${n}${st === 'done' ? '<i aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M2.2 5.2 4.2 7 7.8 3"/></svg></i>' : ''}</span>`;
  }).join('');
}

function hmExamLabel() {
  if (!S.exam) return '';
  const d = new Date(S.exam + 'T00:00:00');
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function hmHero() {
  const dd = dday(), seen = S.seen.length, pct = Math.round(seen / Q.length * 100);
  const big = dd === null ? 'D-day' : dd > 0 ? 'D-' + dd : dd === 0 ? 'D-DAY' : '시험 끝!';
  const side = dd === null
    ? `<button class="hm-pill hm-set" onclick="examSheet()">시험일 정하기 ›</button>`
    : `<button class="hm-pill" onclick="examSheet()" aria-label="시험일 변경">${hmExamLabel()} <u>변경</u></button>`;
  return `<div class="hm-hero">${HM_MOUNT}
    <div class="hm-hl">
      <div class="hm-k">${esc(C.name)} 시험까지</div>
      <div class="hm-dd"><b>${big}</b>${side}</div>
      <div class="hm-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="문제은행 진도"><i style="width:${pct}%"></i></div>
      <div class="hm-bk">문제은행 <b>${seen}</b> / ${Q.length} 풀었어요</div>
    </div></div>`;
}

function hmToday() {
  const p = planToday(), pro = isPro(), target = p.nNew + (pro ? p.nDue : 0), done = p.done;
  const left = Math.max(0, target - done), ratio = target ? Math.min(1, done / target) : 1;
  const sec = avgSec() || 60, mins = Math.max(1, Math.round(left * sec / 60));
  const R = 24, L = 2 * Math.PI * R, st = streak(), wn = S.wrong.length;
  const title = left ? `${left}문제만 풀면 끝` : '오늘 할 일을 다 했어요!';
  const sub = left ? `${done ? `오늘 ${done}문제 풀었어요 · ` : ''}약 ${mins}분 남음` : `오늘 ${done}문제 풀었어요. 더 풀어도 좋아요`;
  return `<div class="hm-today">
    <div class="hm-th">
      <div class="grow">
        <div class="hm-tk">${IC.flame()}오늘 할 일${st ? `<span> · ${st}일 연속</span>` : ''}</div>
        <div class="hm-tt">${title}</div>
        <div class="hm-ts">${sub}</div>
      </div>
      <div class="hm-ring" aria-label="오늘 ${done}/${target}문제"><svg viewBox="0 0 58 58"><circle cx="29" cy="29" r="${R}" class="bg"/><circle cx="29" cy="29" r="${R}" class="fg" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - ratio)}"/></svg><div>${left ? `<b>${done}</b><span>/${target}</span>` : '<b class="hm-ok" aria-hidden="true">✓</b><span>완료</span>'}</div></div>
    </div>
    <div class="hm-week">${hmWeek()}</div>
    <div class="hm-chips">
      <button class="hm-chip nw" onclick="startQuick()"><span><i></i>새 문제</span><b>${p.nNew}<small>개</small></b></button>
      <button class="hm-chip wr" onclick="go('note')"><span><i></i>틀린 문제</span><b>${wn}<small>개</small></b></button>
    </div>
    <button class="hm-go" onclick="startToday()">${done ? '이어서 학습하기' : '오늘 학습 시작'}</button>
  </div>`;
}

function hmPass() {
  const T = PASS.total, M = PASS.sub;
  if (S.solved < 10) {
    return `<button class="hm-pass hm-empty" onclick="startQuick()"><div class="hm-pe-g">${hmGauge(0)}<b>?</b></div>
      <div class="grow"><div class="hm-pk">지금 시험 보면 예상 점수</div><div class="hm-pt">${10 - S.solved}문제만 더 풀면 알려 드려요</div><div class="hm-pn">합격선 ${T}점 · 과목별 ${M}점 미만은 과락</div></div></button>`;
  }
  const rate = Math.round(S.correct / S.solved * 100);
  const sub = SK.map(s => ({ s, a: acc(s) }));
  const cut = sub.filter(x => x.a !== null && x.a < M);
  const diff = rate - T;
  const tag = cut.length ? ['과락 주의', 'red'] : diff >= 0 ? ['합격권', 'green'] : ['조금 더', 'orange'];
  const head = diff >= 0 ? `합격선보다 <em class="${tag[1]}">${diff}점 위</em>` : `합격선까지 <em class="${tag[1]}">${-diff}점</em>`;
  const note = cut.length ? `${cut.map(x => SUBJ[x.s]).join('·')} ${M}점 미만이에요` : `합격선 ${T}점 · 과목별 과락 없음`;
  return `<div class="hm-pass">
    <button class="hm-ph" onclick="reportPage()">
      <div class="hm-pg">${hmGauge(rate, tag[1])}<b>${rate}<small>점</small></b></div>
      <div class="grow"><div class="hm-pk">지금 시험 보면 예상 점수<span class="hm-more">리포트 ›</span></div>
        <div class="hm-pt">${head} <span class="hm-tag ${tag[1]}">${tag[0]}</span></div>
        <div class="hm-pn">${note}</div></div>
    </button>
    <div class="hm-subj">${sub.map(({ s, a }) => `<div class="hm-sj ${a !== null && a < M ? 'cut' : ''}"><div><span>${SUBJ[s]}</span><b>${a === null ? '-' : a}<small>${a === null ? '' : '점'}</small></b></div><div class="hm-sb" style="--pass:${T}%"><i style="width:${a || 0}%"></i></div></div>`).join('')}</div>
  </div>`;
}

function hmGauge(v, col) {
  const r = 36, L = Math.PI * r;
  return `<svg viewBox="0 0 88 52" aria-hidden="true"><path d="M8 46 A36 36 0 0 1 80 46" class="bg"/><path d="M8 46 A36 36 0 0 1 80 46" class="fg ${col || ''}" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - Math.max(0, Math.min(100, v)) / 100)}"/></svg>`;
}

function hmPlay() {
  const pro = isPro();
  const t = (fn, ic, n, d, tag) => `<button class="hm-tile" onclick="${fn}">${tag || ''}<span class="hm-ti">${ic}</span><b>${n}</b><small>${d}</small></button>`;
  return `<div class="hm-sec">다른 방법으로 풀기</div>
    <div class="hm-tiles">
      ${t('startQuick()', IC.quick(), '빠른 10', '5분')}
      ${t('subjectSheet()', IC.subject(), '단원별', '골라 풀기')}
      ${t('setPage()', IC.sets(), '세트별', SET_N + '문항')}
      ${t('startMock()', IC.exam(), '모의고사', Math.min(C.info.count, pool(0).length) + '문항', pro ? '' : '<span class="hm-pro">PRO</span>')}
    </div>
    <button class="hm-all" onclick="go('play')"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="6.5" height="6.5" rx="2"/><rect x="11.5" y="2" width="6.5" height="6.5" rx="2" opacity=".55"/><rect x="2" y="11.5" width="6.5" height="6.5" rx="2" opacity=".55"/><rect x="11.5" y="11.5" width="6.5" height="6.5" rx="2" opacity=".3"/></svg>풀이 방법 전체 보기<span class="hm-allsub">문제은행 · 개념 카드 · OX</span><span class="hm-chev" aria-hidden="true">›</span></button>`;
}


/* 요약노트 PDF 판매 카드 (휴대폰: 로그인 안내 바로 아래, PC: 오른쪽 칸 아래) */
function hmNote() {
  const n = (window.SHOP || []).find(x => x.cert === C.id && !x.soon);
  if (!n) return '';
  const own = n.cert && typeof noteOwned === 'function' && noteOwned(n.cert);
  const off = n.list && n.price && n.list > n.price ? Math.round((1 - n.price / n.list) * 100) : 0;
  const thumb = n.previews && n.previews[0] ? `<img src="${esc(n.previews[0])}" alt="" loading="lazy">` : '';
  if (own) return `<button class="hm-note own" onclick="noteDownload('${n.cert}')"><span class="hm-nt">${thumb}</span>
    <span class="grow"><span class="hm-nk">구매한 요약노트</span><b class="hm-nn">${esc(n.title)}</b><span class="hm-ns">언제든 다시 내려받을 수 있어요</span></span>
    <span class="hm-nb">PDF 받기</span></button>`;
  return `<button class="hm-note" onclick="shopDetail('${n.id}')"><span class="hm-nt">${thumb}</span>
    <span class="grow"><span class="hm-nk">더오를 요약노트 <span>PDF</span></span><b class="hm-nn">${esc(n.short || n.title)} 요약노트</b><span class="hm-ns">${(n.tags || []).slice(0, 3).map(esc).join(' · ')}</span>
    <span class="hm-np">${off ? `<em>${off}%</em><s>${won(n.list)}</s>` : ''}<b>${won(n.price)}</b></span></span>
    <span class="hm-nb">보기 ›</span></button>`;
}

function home() {
  $app.innerHTML = brandBar() + `<div class="pad hm">
    ${topNudge() ? `<div class="hm-nudge">${topNudge()}</div>` : ''}
    ${hmNote() ? `<div class="hm-nw">${hmNote()}</div>` : ''}
    <div class="hm-l">${hmHero()}${hmToday()}</div>
    <div class="hm-r">${hmPass()}${hmPlay()}</div>
    <div class="foot hm-foot">${policyLinks()}</div>
  </div>`;
  $app.classList.add('wide'); tabbar(); checkBadges(); setTimeout(reviewPopup, 900);
}
