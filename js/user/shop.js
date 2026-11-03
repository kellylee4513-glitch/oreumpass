/* [user/shop.js] 요약노트 PDF 탭: 상품 목록(카드) + 상세 페이지. 결제는 외부 판매 링크로 이동 */
const SHOPS = () => window.SHOP || [];
const shopById = id => SHOPS().find(p => p.id === id);
const shopLive = p => !!(p && !p.soon && /^https:\/\//.test(p.url || ''));
/* 현재 자격증의 요약노트(해설 화면 링크용) */
const shopInfo = () => SHOPS().find(p => p.cert === (C && C.id) && !p.soon) || null;
const shopOn = () => shopLive(shopInfo());
function shopCover(p) {
  const nm = esc(String(p.cv || p.short).replace(/\|/g, ''));
  return `<div class="sp-cv" style="--tint:${p.tint || '#3182F6'}"><i class="sp-dots"></i><i class="sp-spine"></i><i class="sp-frame"></i><span class="sp-vt">${nm}</span><svg class="sp-sun" viewBox="0 0 40 40" aria-hidden="true"><g stroke="#FFC21A" stroke-width="3" stroke-linecap="round"><path d="M20 3v4M20 33v4M3 20h4M33 20h4M8 8l2.8 2.8M29.2 29.2L32 32M8 32l2.8-2.8M29.2 10.8L32 8"/></g><circle cx="20" cy="20" r="10" fill="#FFD43B"/><circle cx="16.5" cy="19" r="1.3" fill="#7A4B00"/><circle cx="23.5" cy="19" r="1.3" fill="#7A4B00"/><path d="M17 22.5q3 2.6 6 0" stroke="#7A4B00" stroke-width="1.3" fill="none" stroke-linecap="round"/><circle cx="14.2" cy="22.3" r="1.5" fill="#FF9F80" opacity=".7"/><circle cx="25.8" cy="22.3" r="1.5" fill="#FF9F80" opacity=".7"/></svg>
    <svg class="sp-mt" viewBox="0 0 74 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40 L0 30 L16 20 L26 26 L44 8 L56 16 L74 4 L74 40 Z" fill="var(--tint)" opacity=".28"/><path d="M0 40 L0 34 L20 26 L34 31 L52 18 L74 24 L74 40 Z" fill="var(--tint)" opacity=".75"/></svg>
    <span class="sp-en">SUMMARY NOTE</span><span class="sp-pdf">PDF</span><i class="sp-gloss"></i></div>`;
}
function pdfShop(asTab) {
  if (!asTab) { go('shop'); return; }
  window.scrollTo(0, 0); $app.classList.remove('wide');
  const cats = (window.SHOP_CATS || []).filter(c => SHOPS().some(p => p.cat === c.id && !p.featured));
  const feat = SHOPS().filter(p => p.featured && !p.soon);
  const priceTxt = p => shopLive(p) ? (p.price ? `${p.list > p.price ? `<s>${won(p.list)}</s> ` : ''}<b>${won(p.price)}</b>` : '<b>판매 중</b>') : '<b class="wait">판매 준비 중</b>';
  const stage = p => `<button class="sp-stage" onclick="shopDetail('${p.id}')">
      <div class="sp-st-txt"><div class="k">시험 전 마지막 정리</div><div class="t">두꺼운 기본서 대신<br><em>핵심만</em> 담은 요약노트</div>
        <div class="sp-st-name">${esc(p.title)}</div>
        <div class="sp-st-row"><span class="sp-st-st">${shopLive(p) ? (p.price ? won(p.price) : '판매 중') : '판매 준비 중'}</span><span class="sp-go">자세히 보기 ›</span></div></div>
      <div class="sp-stcv"><i class="sp-back"></i>${shopCover(p)}</div></button>`;
  const book = p => `<button class="sp-book${p.soon ? ' soon' : ''}" onclick="${p.soon ? `toast('${esc(p.short)} 요약노트는 준비 중이에요')` : `shopDetail('${p.id}')`}">${shopCover(p)}<div class="t">${esc(p.short)}</div><div class="d">${p.soon ? '준비 중' : shopLive(p) ? (p.price ? won(p.price) : '판매 중') : '판매 준비 중'}</div></button>`;
  const ask = `<button class="sp-book sp-ask" onclick="toast('원하는 자격증을 커뮤니티에 남겨 주세요');go('comm')"><span class="sp-plus">＋</span><div class="t">요약노트 요청</div><div class="d">원하는 자격증</div></button>`;
  const rest = SHOPS().filter(p => !(p.featured && !p.soon));
  $app.innerHTML = `<div class="top"><div class="ttl">요약노트</div></div><div class="pad upage lux lux-dark">
    <div class="sp-wrap">${feat.map(stage).join('')}
    <div class="sp-sec"><div class="sp-h"><i></i>곧 나와요</div><div class="sp-shelf">${rest.map(book).join('')}${ask}</div></div></div>
    <div class="foot">${policyLinks()}</div></div>`; tabbar();
}
function shopDetail(id) { markNav(); closeSheet(); stopTimer(); run = null; tab = 'shop';
  const n = shopById(id); if (!n) { pdfShop(true); return; }
  window.scrollTo(0, 0); $app.classList.remove('wide');
  const off = n.list && n.price && n.list > n.price ? Math.round((1 - n.price / n.list) * 100) : 0;
  const items = (n.items || []).map(([t, d], i) => `<div class="sh-it"><span class="no">${i + 1}</span><div class="grow"><div class="t">${esc(t)}</div><div class="d">${esc(d)}</div></div></div>`).join('');
  const pv = (n.previews || []).length
    ? `<div class="sh-pv">${n.previews.map(src => `<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="요약노트 미리보기" loading="lazy"></a>`).join('')}</div>`
    : `<div class="sh-pv empty">미리보기 페이지를 준비하고 있어요</div>`;
  const price = n.price ? `<div class="sh-price">${off ? `<span class="off">${off}%</span><s>${won(n.list)}</s>` : ''}<b>${won(n.price)}</b></div>` : '';
  const buy = shopLive(n)
    ? `<a class="sh-buy" href="${esc(n.url)}" target="_blank" rel="noopener">구매하러 가기</a><div class="sh-note">구매 버튼을 누르면 판매 페이지로 이동해 결제해요.</div>`
    : `<button class="sh-buy off" onclick="toast('판매 준비 중이에요. 조금만 기다려 주세요')">판매 준비 중</button>`;
  $app.innerHTML = topBar('요약노트', '', "go('shop')") + `<div class="pad upage">
    <div class="sh-hero"><div class="k">${esc(n.short)} · PDF</div><div class="t">${esc(n.title)}</div><div class="d">${esc(n.sub || '')}</div>${price}</div>
    <div class="sec">구성</div><div class="card sh-list">${items}</div>
    <div class="sec">미리보기</div>${pv}
    <div class="sec">이런 분께 맞아요</div>
    <div class="card sh-for"><div>· 시험 직전, 두꺼운 기본서를 한 번에 정리하고 싶은 분</div><div>· 세율·기한·공식처럼 헷갈리는 숫자를 반복해서 외우고 싶은 분</div><div>· 출력해서 손으로 채우며 공부하는 분</div></div>
    <div class="sec">앱과 함께 쓰면</div>
    <div class="card sh-for"><div>앱에서 문제를 풀다 틀린 단원은 요약노트의 같은 단원을 보고, 빈칸 학습지로 다시 외워 보세요. 문제 풀이와 정리 회독을 번갈아 하면 오래 기억에 남아요.</div></div>
    ${buy}
    <div class="sec">구매 전 확인해 주세요</div>
    <div class="card sh-pol">
      <div><b>상품 형태</b> 디지털 콘텐츠(PDF)예요. 실물 배송은 없어요.</div>
      <div><b>이용 범위</b> 구매한 본인의 개인 학습용이에요. 파일 공유·재판매·캡처 게시는 금지돼요.</div>
      <div><b>환불</b> 결제 후 파일을 내려받지 않았다면 7일 안에 전액 환불돼요. 내려받거나 열람한 뒤에는 디지털 콘텐츠 특성상 청약철회가 제한돼요. 파일이 열리지 않는 등 판매자 잘못이 있으면 정상 파일로 바꿔 드리거나 환불해 드려요.</div>
      <div><b>참고</b> 개인 학습용 요약 자료로, 공식 기본서를 대신하지 않아요. 세율·한도처럼 자주 바뀌는 숫자는 응시 회차 기준 기본서로 다시 확인해 주세요.</div>
    </div>
    <div class="foot">${policyLinks()}</div></div>`; tabbar();
}
