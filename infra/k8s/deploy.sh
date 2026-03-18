#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGE_NAME="my-app:1.0"
CLUSTER_NAME="mycluster"

echo "=== 1. Docker 이미지 빌드 ==="
cd "$SCRIPT_DIR/../.."
docker build -t $IMAGE_NAME .

echo ""
echo "=== 2. k3d 클러스터에 이미지 주입 ==="
k3d image import $IMAGE_NAME -c $CLUSTER_NAME

echo ""
echo "=== 3. 쿠버네티스 리소스 배포 ==="
kubectl apply -f "$SCRIPT_DIR/mysql.yaml"
kubectl apply -f "$SCRIPT_DIR/redis.yaml"
kubectl apply -f "$SCRIPT_DIR/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/service.yaml"

echo ""
echo "=== 4. Pod 상태 확인 ==="
kubectl get pods
echo ""
echo "배포 완료. 앱 기동까지 약 30초 소요됩니다."
echo "접근: http://localhost:30080"
echo "상태 모니터링: kubectl get pods -w"
