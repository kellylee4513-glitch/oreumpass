/* 올리기 전 점검 1: 파일 목록·캐시 버전
   사용: (저장소 폴더에서) node tools/check-release.js
   - index.html이 불러오는 스크립트·CSS가 sw.js FILES에 모두 있는지 (빠지면 오프라인·홈 화면 앱에서 깨져요)
   - sw.js FILES에 있는 파일이 실제로 있는지
   - 화면 파일이 바뀌었는데 sw.js CACHE 버전을 안 올렸는지 (이미 열어 둔 사람에게 옛 화면이 남아요) */
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const R = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(R, f), 'utf8');
const fails = [];
const idx = rd('index.html'), sw = rd('sw.js');
const used = [...idx.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)].map(m => m[1]).filter(u => !/^https?:|^\/\//.test(u));
const files = JSON.parse((sw.match(/const FILES = (\[[^\]]*\])/) || [])[1].replace(/'/g, '"'));
used.forEach(u => { if (!files.includes('./' + u)) fails.push('sw.js FILES에 없음: ' + u); });
files.forEach(f => { if (f !== './' && !fs.existsSync(path.join(R, f))) fails.push('sw.js FILES의 파일이 없음: ' + f); });
try {
  const changed = execSync('git diff --name-only origin/main -- ' + files.filter(f => f !== './').join(' '), { cwd: R }).toString().trim();
  const cacheNow = (sw.match(/const CACHE = '([^']+)'/) || [])[1];
  const cacheOld = (execSync('git show origin/main:sw.js', { cwd: R }).toString().match(/const CACHE = '([^']+)'/) || [])[1];
  if (changed && cacheNow === cacheOld) fails.push('화면 파일이 바뀌었는데 sw.js CACHE 버전이 그대로예요 (' + cacheNow + '): ' + changed.split('\n').join(', '));
} catch (e) { console.log('(git 비교는 건너뜀: ' + e.message.split('\n')[0] + ')'); }
console.log(fails.length ? '실패\n- ' + fails.join('\n- ') : '파일 목록·캐시 버전 통과');
process.exit(fails.length ? 1 : 0);
