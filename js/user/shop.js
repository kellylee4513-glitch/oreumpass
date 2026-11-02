/* [user/shop.js] 요약노트 PDF 탭: 상품 목록(카드) + 상세 페이지. 결제는 외부 판매 링크로 이동 */
const SHOPS = () => window.SHOP || [];
const shopById = id => SHOPS().find(p => p.id === id);
const shopLive = p => !!(p && !p.soon && /^https:\/\//.test(p.url || ''));
/* 현재 자격증의 요약노트(해설 화면 링크용) */
const shopInfo = () => SHOPS().find(p => p.cert === (C && C.id) && !p.soon) || null;
const shopOn = () => shopLive(shopInfo());
function shopCover(p) {
  return `<div class="sp-cv" style="--tint:${p.tint || '#3182F6'}"><span class="vt">${esc(p.cv || p.short)}</span><span class="bk">요약<br>노트</span><span class="pdf">PDF</span></div>`;
}
function pdfShop(asTab) {
  if (!asTab) { go('shop'); return; }
  window.scrollTo(0, 0); $app.classList.remove('wide');
  const cats = (window.SHOP_CATS || []).filter(c => SHOPS().some(p => p.cat === c.id));
  const card = p => `<button class="sp-card${p.soon ? ' soon' : ''}" onclick="${p.soon ? `toast('${esc(p.short)} 요약노트는 준비 중이에요')` : `shopDetail('${p.id}')`}">${shopCover(p)}<div class="grow"><div class="t">${esc(p.title)}</div><div class="d">${p.soon ? '준비 중' : shopLive(p) ? (p.price ? won(p.price) : '판매 중') : '판매 준비 중'}</div></div></button>`;
  $app.innerHTML = `<div class="top"><div class="ttl">요약노트</div></div><div class="pad upage">
    <div class="lead">합격자가 직접 정리한 자격증 요약노트 PDF예요. 출력해서 회독하고, 앱 문제로 확인해 보세요.</div>
    ${cats.map(c => `<div class="sp-sec"><div class="sp-h"><i style="background:${c.dot}"></i>${esc(c.name)}</div><div class="sp-grid">${SHOPS().filter(p => p.cat === c.id).map(card).join('')}</div></div>`).join('')}
    <div class="foot">${policyLinks()}</div></div>`; tabbar();
}
function shopDetail(id) { markNav(); closeSheet(); stopTimer(); run = null; tab = 'shop';
  const n = shopById(id); if (!n) { pdfShop(true); return; }
  window.scrollTo(0, 0); $app.classList.remove('wide');
  const off = n.list && n.price && n.list > n.price ? Math.round((1 - n.price / n.list) * 100) : 0;
  const items = (n.items || []).map(([t, d], i) => `<div class="sh-it"><span class="no">${i + 1}</span><div class="grow"><div class="t">${esc(t)}</div><div class="d">${esc(d)}</div></div></div>`).join('');
  const pv = (n.previews || []).length
    ? `<div class="sh-pv">${n.previews.map(src => `<img src="${esc(src)}" alt="요약노트 미리보기" loading="lazy">`).join('')}</div>`
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
    <div class="card sh-for"><div>· 시험 2~4주 전, 두꺼운 기본서를 한 번에 정리하고 싶은 분</div><div>· 세율·기한·공식처럼 헷갈리는 숫자를 반복해서 외우고 싶은 분</div><div>· 출력해서 손으로 채우며 공부하는 분</div></div>
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
