/* 더오름패스 자격증 목록
   - 문제 파일이 있는 자격증(ready:true)은 각자 파일(certs/○○.js)에서 등록돼요.
   - 여기 있는 건 "준비 중"으로 보이는 자격증이에요. 문제 파일을 만들면 여기서 지우면 돼요. */
window.CERTS=window.CERTS||[];
window.CATALOG_SOON=[
 {id:'fund',   name:'펀드투자권유자문인력', short:'펀드', cat:'금융', color:'#7C5CFF'},
 {id:'stock',  name:'증권투자권유자문인력', short:'증권', cat:'금융', color:'#00A8A8'},
 {id:'deriv',  name:'파생상품투자권유자문인력', short:'파생', cat:'금융', color:'#FF7A1A'},
 {id:'analyst',name:'금융투자분석사', short:'분석', cat:'금융', color:'#E8384C'},
 {id:'history',name:'한국사능력검정시험', short:'한능검', cat:'공통', color:'#B5762E'},
 {id:'comp',   name:'컴퓨터활용능력', short:'컴활', cat:'공통', color:'#16B871'},
 {id:'adsp',   name:'ADsP 데이터분석 준전문가', short:'ADsP', cat:'IT·데이터', color:'#3D5AFE'},
 {id:'sqld',   name:'SQLD SQL 개발자', short:'SQLD', cat:'IT·데이터', color:'#0091EA'}
];
