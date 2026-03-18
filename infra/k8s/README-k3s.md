# k3s 로컬 테스트 환경

Mac에서 k3d로 k3s 클러스터를 띄우고 Spring Boot 앱을 배포하는 로컬 테스트 환경이다.

## 사전 준비

```bash
brew install k3d
brew install kubectl
```

Docker Desktop이 실행 중이어야 한다.

## 클러스터 생성

```bash
# 워커 노드 2개로 생성
k3d cluster create mycluster --agents 2

# 노드 확인
kubectl get nodes
```

## 파일 구조

```
infra/k8s/
  deploy.sh        # 전체 배포 자동화 스크립트
  deployment.yaml  # 앱 Pod 정의 (replicas: 2)
  service.yaml     # 앱 NodePort (30080)
  mysql.yaml       # MySQL 8.0 Deployment + Service
  redis.yaml       # Redis 7 Deployment + Service
```

## 배포

```bash
bash infra/k8s/deploy.sh
```

스크립트가 아래 순서로 자동 실행된다:

1. Docker 이미지 빌드 (`my-app:1.0`)
2. k3d 클러스터에 이미지 주입
3. MySQL, Redis, 앱, Service 순으로 배포

## 접근

```bash
curl http://localhost:30080
```

## 상태 확인 명령어

```bash
# Pod 상태 실시간 모니터링
kubectl get pods -w

# 특정 Pod 로그 확인
kubectl logs <pod-name>

# Pod 상세 정보 (이벤트, 에러 확인)
kubectl describe pod <pod-name>

# 전체 리소스 확인
kubectl get all
```

## Spring 프로파일

k8s 환경에서는 `application-k8s.yml` 프로파일이 활성화된다 (`SPRING_PROFILES_ACTIVE=k8s`).
`localhost` 대신 쿠버네티스 Service 이름으로 접근한다:

| 로컬 (local 프로파일) | k8s 프로파일 |
|---|---|
| `localhost:3306` | `mysql-svc:3306` |
| `localhost:6379` | `redis-svc:6379` |

## readinessProbe

앱 Pod는 `/actuator/health` 응답이 200이 될 때까지 트래픽을 받지 않는다.
MySQL, Redis가 완전히 뜨기 전에 앱이 먼저 시작되더라도 자동으로 대기한다.

```
앱 Pod 시작 → 30초 대기 → 10초마다 health 체크 → 정상 확인 후 트래픽 허용
```

## k9s — 터미널 UI 대시보드

k9s는 터미널에서 쿠버네티스 클러스터 상태를 실시간으로 보여주는 TUI 도구다.
`kubectl get pods`, `kubectl logs`, `kubectl describe` 등을 일일이 입력하는 대신 키보드로 탐색하며 한눈에 확인할 수 있다.

### 설치

```bash
brew install k9s
```

### 실행

```bash
k9s
```

### 주요 단축키

| 키 | 동작 |
|---|---|
| `:pod` + Enter | Pod 목록 보기 |
| `:deploy` + Enter | Deployment 목록 보기 |
| `:svc` + Enter | Service 목록 보기 |
| `l` | 선택한 Pod 로그 보기 |
| `d` | 선택한 리소스 describe |
| `ctrl+d` | 선택한 리소스 삭제 |
| `ctrl+c` | k9s 종료 |
| `/` | 이름으로 필터링 |
| `esc` | 이전 화면으로 돌아가기 |

kubectl 명령어 대비 Pod 로그 확인, 에러 이벤트 탐색이 훨씬 빠르다.

---

## 클러스터 정리

```bash
k3d cluster delete mycluster
```
