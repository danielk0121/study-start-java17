#!/usr/bin/env bash
# 전체 서비스 Docker 이미지 빌드 스크립트
# 실행 위치: 프로젝트 루트에서 실행
#   bash infra/dockerfile/build-all.sh
#
# 옵션:
#   TAG=<버전>  이미지 태그 지정 (기본값: latest)
#     예) TAG=1.0.0 bash infra/dockerfile/build-all.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TAG="${TAG:-latest}"

SERVICES=(
  "auth-service:start-java17-auth-service"
  "bff:start-java17-bff"
  "db-migration:start-java17-db-migration"
  "member-service:start-java17-member-service"
  "order-service:start-java17-order-service"
)

echo "=== Docker 이미지 빌드 시작 (TAG=${TAG}) ==="
echo "프로젝트 루트: ${PROJECT_ROOT}"
echo ""

for entry in "${SERVICES[@]}"; do
  module="${entry%%:*}"
  image="${entry##*:}"

  echo "--- [${module}] 빌드 시작 ---"
  docker build \
    -f "${PROJECT_ROOT}/${module}/Dockerfile" \
    -t "${image}:${TAG}" \
    "${PROJECT_ROOT}"
  echo "--- [${module}] 완료: ${image}:${TAG} ---"
  echo ""
done

echo "=== 전체 빌드 완료 ==="
echo ""
echo "생성된 이미지:"
for entry in "${SERVICES[@]}"; do
  image="${entry##*:}"
  echo "  ${image}:${TAG}"
done
