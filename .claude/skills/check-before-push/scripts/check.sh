#!/usr/bin/env bash
# CI(.github/workflows/ci.yml)와 같은 순서로 lint → build를 실행하고 결과를 요약한다.
# 사용법: bash .claude/skills/check-before-push/scripts/check.sh
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1

status=0

echo "=== 1/2 코드 검사 (npm run lint) ==="
if npm run lint; then
  echo "LINT: PASS"
else
  echo "LINT: FAIL"
  status=1
fi

echo
echo "=== 2/2 실제로 만들어 보기 (npm run build) ==="
if [ ! -f .env.local ]; then
  echo "경고: .env.local이 없습니다. 환경 변수 부족으로 build가 실패할 수 있습니다(코드 문제가 아닐 수 있음)."
fi
if npm run build; then
  echo "BUILD: PASS"
else
  echo "BUILD: FAIL"
  status=1
fi

echo
if [ $status -eq 0 ]; then echo "RESULT: PASS"; else echo "RESULT: FAIL"; fi
exit $status
