#!/usr/bin/env bash
# 새 주소(theoreulpass.com)도 main과 같게 맞추기
# 사용: oreumpass 폴더에서 main을 push한 직후  bash tools/sync-site.sh
# 하는 일: theoreulpass-site 저장소의 SOURCE 파일에 지금 origin/main 커밋 번호를 적어 올린다
#          → 그 저장소의 GitHub Action이 oreumpass main을 가져와 theoreulpass.com 에 배포 (1~2분)
# 잊어도 매시간 자동 확인이 따라잡지만, 바로 반영하려면 꼭 실행한다.
set -euo pipefail
cd "$(dirname "$0")/.."
git fetch -q origin main
SHA=$(git rev-parse origin/main)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git clone -q --depth 1 https://github.com/kellylee4513-glitch/theoreulpass-site.git "$TMP/site"
cd "$TMP/site"
printf 'oreumpass main 배포 기록 (tools/sync-site.sh 가 갱신)\n%s\n%s\n' "$SHA" "$(date '+%Y-%m-%d %H:%M:%S')" > SOURCE
git -c user.name=kellylee4513-glitch -c user.email=kellylee4513-glitch@users.noreply.github.com commit -q -am "sync oreumpass ${SHA:0:7}"
git push -q origin main
echo "새 주소 배포 요청함: oreumpass ${SHA:0:7} → 1~2분 뒤 https://theoreulpass.com/deployed.txt 가 이 번호면 완료"
