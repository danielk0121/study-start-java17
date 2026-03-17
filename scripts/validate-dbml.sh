#!/usr/bin/env bash
# DBML 문법 검증 스크립트
# 사용법: bash scripts/validate-dbml.sh [파일...]
#   인수 없이 실행하면 docs/ 하위 모든 .dbml 파일 검증
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DBML_CLI="$REPO_ROOT/node_modules/.bin/dbml2sql"

# @dbml/cli 설치 여부 확인
if [[ ! -x "$DBML_CLI" ]]; then
  echo "[validate-dbml] @dbml/cli not found. Run: npm install"
  exit 1
fi

# 검증 대상 파일 수집
if [[ $# -gt 0 ]]; then
  FILES=("$@")
else
  TMPFILE="$(mktemp)"
  find "$REPO_ROOT/docs" -name "*.dbml" > "$TMPFILE"
  FILES=()
  while IFS= read -r f; do
    FILES+=("$f")
  done < "$TMPFILE"
  rm -f "$TMPFILE"
fi

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "[validate-dbml] No .dbml files found."
  exit 0
fi

PASS=0
FAIL=0
for FILE in "${FILES[@]}"; do
  # dbml2sql 는 exit code 0을 항상 반환하므로, stdout의 ERROR: 문자열로 오류 판단
  OUTPUT="$("$DBML_CLI" --db mysql "$FILE" 2>&1)"
  if echo "$OUTPUT" | grep -q "ERROR:"; then
    echo "[validate-dbml] ✗  $FILE"
    echo "$OUTPUT" | sed 's/^/    /'
    ((FAIL++)) || true
  else
    echo "[validate-dbml] ✓  $FILE"
    ((PASS++)) || true
  fi
done

echo ""
echo "[validate-dbml] Result: ${PASS} passed, ${FAIL} failed"
if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
