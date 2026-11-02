/* [user/shop.js] 정리본 PDF 판매 페이지 (결제는 외부 판매 링크로 이동) */
/* 상품 정보는 certs/*.js 의 note 항목에서 읽어요: { url, price, list, title, items:[[제목,설명]], previews:[이미지 경로] } */
const shopInfo = () => C.note || null;
const shopOn = () => { const n = shopInfo(); return !!(n && /^https:\/\//.test(n.url || '')); };
function shopEntry(cls) { const n = shopInfo(); if (!n) return ''; return `<button class="li${cls ? ' ' + cls : ''}" onclick="pdfShop()"><span class="ico">${IC.book()}</span>${esc(C.short)} 핵심 정리본 PDF<span class="r">${shopOn() ? (n.price ? won(n.price) : '') : '준비 중'} ›</span></button>`; }
function pdfShop() { markNav();
  window.scrollTo(0, 0); $app.classList.remove('wide');
  const n = shopInfo(); if (!n) { go('home'); return; }
  const off = n.list && n.price && n.list > n.price ? Math.round((1 - n.price / n.list) * 100) : 0;
  const items = (n.items || []).map(([t, d], i) => `<div class="sh-it"><span class="no">${i + 1}</span><div class="grow"><div class="t">${esc(t)}</div><div class="d">${esc(d)}</div></div></div>`).join('');
  const pv = (n.previews || []).length
    ? `<div class="sh-pv">${n.previews.map(src => `<img src="${esc(src)}" alt="정리본 미리보기" loading="lazy">`).join('')}</div>`
    : `<div class="sh-pv empty">미리보기 페이지를 준비하고 있어요</div>`;
  const price = n.price ? `<div class="sh-price">${off ? `<span class="off">${off}%</span><s>${won(n.list)}</s>` : ''}<b>${won(n.price)}</b></div>` : '';
  const buy = shopOn()
    ? `<a class="sh-buy" href="${esc(n.url)}" target="_blank" rel="noopener">구매하러 가기</a><div class="sh-note">구매 버튼을 누르면 판매 페이지로 이동해 결제해요.</div>`
    : `<button class="sh-buy off" onclick="toast('판매 준비 중이에요. 조금만 기다려 주세요')">판매 준비 중</button>`;
  $app.innerHTML = topBar('핵심 정리본 PDF') + `<div class="pad upage">
    <div class="sh-hero"><div class="k">${esc(C.name)} · PDF</div><div class="t">${esc(n.title || C.short + ' 핵심 정리본')}</div><div class="d">${esc(n.sub || '시험 범위를 표와 도식으로 압축하고, 빈출 포인트를 빈칸으로 다시 외우는 세트예요.')}</div>${price}</div>
    <div class="sec">구성</div><div class="card sh-list">${items}</div>
    <div class="sec">미리보기</div>${pv}
    <div class="sec">이런 분께 맞아요</div>
    <div class="card sh-for"><div>· 시험 2~4주 전, 두꺼운 기본서를 한 번에 정리하고 싶은 분</div><div>· 세율·기한·공식처럼 헷갈리는 숫자를 반복해서 외우고 싶은 분</div><div>· 출력해서 손으로 채우며 공부하는 분</div></div>
    <div class="sec">앱과 함께 쓰면</div>
    <div class="card sh-for"><div>앱에서 문제를 풀다 틀린 단원은 정리본의 같은 단원을 보고, 빈칸 학습지로 다시 외워 보세요. 문제 풀이와 정리 회독을 번갈아 하면 오래 기억에 남아요.</div></div>
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
