/* [quiz/highlight.js] 해설 키워드 하이라이트 */
/* ===== 해설 강화: 키워드 하이라이트 · 공식 상자 · 10초 암기 팁 ===== */
function hl(t) { return esc(t).replace(/(&quot;|‘|“|')([^'’”&]{1,24})(&quot;|’|”|')/g, '<mark>$1$2$3</mark>').replace(/(\d[\d,.]*\s?(%|만원|억원|원|년|개월|일|배|세|명))/g, '<mark class="n">$1</mark>'); }

