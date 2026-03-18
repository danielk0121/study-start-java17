# k3s 로컬 테스트 가이드

쿠버네티스를 전혀 모르는 백엔드 개발자 기준으로 Mac에서 k3d를 사용해 로컬 k3s 클러스터에 Spring Boot 앱을 띄우는 가이드다.

---

## 사전 준비

- Docker Desktop 실행 중
- k3d 설치 완료 (`brew install k3d`)
- kubectl 설치 완료 (`brew install kubectl`)

---

## 1단계 — 클러스터 생성

```bash
# 워커 노드 2개로 클러스터 생성
k3d cluster create mycluster --agents 2

# 노드 확인
kubectl get nodes
```

정상 생성 시 아래처럼 3개 노드가 보인다:

```
NAME                     STATUS   ROLES           AGE   VERSION
k3d-mycluster-server-0   Ready    control-plane   ...   v1.34.5+k3s1
k3d-mycluster-agent-0    Ready    <none>           ...   v1.34.5+k3s1
k3d-mycluster-agent-1    Ready    <none>           ...   v1.34.5+k3s1
```

`docker ps`로 확인하면 컨테이너 5개가 떠 있다:

| 컨테이너 | 역할 |
|---|---|
| k3d-mycluster-server-0 | k3s 컨트롤 플레인 + 실제 Pod 실행 |
| k3d-mycluster-agent-0 | 워커 노드 |
| k3d-mycluster-agent-1 | 워커 노드 |
| k3d-mycluster-serverlb | kubectl 요청을 server-0으로 포워딩하는 로드밸런서 |
| k3d-mycluster-tools | 클러스터 생성/삭제 시 사용하는 헬퍼 (평소엔 noop) |

---

## 2단계 — Docker 이미지 빌드 및 클러스터에 주입

k3d는 로컬 Docker 이미지를 직접 참조하지 못한다. `k3d image import`로 클러스터 안에 밀어넣어야 한다.

```bash
# JAR 빌드
./gradlew bootJar

# Docker 이미지 빌드
docker build -t my-app:1.0 .

# k3d 클러스터에 이미지 주입
k3d image import my-app:1.0 -c mycluster
```

---

## 3단계 — Deployment 작성

Pod를 어떻게 실행할지 정의하는 리소스다.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: my-app:1.0
          imagePullPolicy: Never   # 로컬 이미지 사용 (외부에서 pull 안 함)
          ports:
            - containerPort: 8080
```

---

## 4단계 — Service 작성

Pod에 외부에서 접근할 수 있도록 포트를 여는 리소스다.

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-svc
spec:
  type: NodePort
  selector:
    app: my-app
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 30080   # 외부에서 접근할 포트 (30000~32767 범위)
```

---

## 5단계 — 배포 및 확인

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Pod 상태 확인
kubectl get pods

# Service 확인
kubectl get svc
```

---

## 6단계 — 접근

k3d는 NodePort를 로컬호스트로 자동 포워딩한다.

```bash
curl http://localhost:30080
```

---

## 클러스터 정리

```bash
# 클러스터 삭제
k3d cluster delete mycluster
```
