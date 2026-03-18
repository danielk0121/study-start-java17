# kubectl / k3d 명령어 참조

로컬 k3d 환경에서 실제 사용한 명령어 모음.

---

## k3d — 클러스터 관리

```bash
# 클러스터 생성 (워커 노드 2개)
k3d cluster create mycluster --agents 2

# 클러스터 목록 및 상태 확인
k3d cluster list

# 클러스터 시작 / 중지
k3d cluster start mycluster
k3d cluster stop mycluster

# 클러스터 삭제
k3d cluster delete mycluster

# 로컬 Docker 이미지를 클러스터에 주입
# k3d는 로컬 이미지를 직접 참조하지 못하므로 반드시 이 명령어로 주입
k3d image import my-app:1.0 -c mycluster
```

---

## kubectl — 배포 / 조회

```bash
# yaml 파일(들) 일괄 적용
kubectl apply -f infra/k8s/

# Pod 목록 확인
kubectl get pods

# 노드 목록 확인
kubectl get nodes

# 노드 상세 정보 (taint, 리소스 압박 등 확인)
kubectl describe node <node-name>

# 이미지 태그 업데이트 (재배포)
kubectl set image deployment/my-app my-app=my-app:2.0

# 롤아웃 완료 대기
kubectl rollout status deployment/my-app

# 모든 Pod 삭제 (Deployment가 자동으로 재생성)
kubectl delete pods --all
```

---

## kubectl — 로그 / 컨테이너 접속

```bash
# Pod 로그 실시간 출력
kubectl logs -f <pod-name>

# 컨테이너 bash 접속
kubectl exec -it <pod-name> -- bash

# Redis CLI 접속 (Pod 이름 자동 조회)
kubectl exec -it $(kubectl get pod -l app=redis -o jsonpath='{.items[0].metadata.name}') -- redis-cli

# MySQL 접속 (Pod 이름 자동 조회)
kubectl exec -it $(kubectl get pod -l app=mysql -o jsonpath='{.items[0].metadata.name}') -- mysql -u root -proot start_java17
```

---

## kubectl — 포트 포워딩

로컬 포트를 클러스터 내부 서비스에 연결한다. **포그라운드 명령어**이므로 `&`를 붙여 백그라운드로 실행한다.

```bash
# 앱 서버
kubectl port-forward svc/my-app-svc 30080:8080 &

# MySQL (DataGrip 등 로컬 DB 툴 연결용)
kubectl port-forward svc/mysql-svc 3306:3306 &

# Redis
kubectl port-forward svc/redis-svc 6379:6379 &

# 실행 중인 포트 포워딩 목록 확인
ps aux | grep "port-forward" | grep -v grep

# 모든 포트 포워딩 종료
pkill -f "port-forward"
```

---

## k9s — 터미널 UI 대시보드

```bash
# 실행
k9s
```

주요 단축키:

| 키 | 동작 |
|---|---|
| `:pod` | Pod 목록으로 이동 |
| `:deploy` | Deployment 목록으로 이동 |
| `:svc` | Service 목록으로 이동 |
| `l` | 선택한 Pod 로그 보기 |
| `s` | 선택한 Pod 쉘 접속 |
| `d` | 선택한 리소스 describe |
| `ctrl+d` | 선택한 리소스 삭제 |
| `q` | 종료 |

---

## 전체 배포 플로우 요약

```bash
# 1. 이미지 빌드
docker build -t my-app:2.0 .

# 2. 클러스터에 이미지 주입
k3d image import my-app:2.0 -c mycluster

# 3. 이미지 업데이트 및 롤아웃
kubectl set image deployment/my-app my-app=my-app:2.0
kubectl rollout status deployment/my-app

# 4. 포트 포워딩 후 확인
kubectl port-forward svc/my-app-svc 30080:8080 &
curl http://localhost:30080/actuator/health
```
