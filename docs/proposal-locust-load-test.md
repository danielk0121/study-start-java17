# 제안: Locust 부하 테스트 — 샘플 랜덤 데이터 활용 e2e 시나리오

## 목표

MSA 전환 후 실제 트래픽 패턴과 유사한 e2e 시나리오로 부하 테스트를 수행한다.
DB에 이미 적재된 샘플 데이터(회원, 상품, 주문 100건)를 활용하며, 인증이 필요한 엔드포인트까지 커버한다.

---

## 테스트 대상 아키텍처

```
Locust (부하 생성)
    │
    ▼
Nginx (80 포트) → member-service (8080)
                → order-service  (8081)
                → auth-service   (8082)
                → bff            (8000)
```

---

## 시나리오 구성

### 시나리오 1: 인증 플로우 (auth-service)

```
1. POST /auth/login          → AccessToken + RefreshToken 발급
2. POST /auth/refresh        → AccessToken 갱신
3. POST /auth/validate       → 토큰 유효성 확인
```

### 시나리오 2: 회원 조회 플로우 (member-service)

인증 후 JWT를 Authorization 헤더에 포함해 호출한다.

```
1. GET /members/me           → 내 정보 조회 (JWT 필요)
2. GET /members/{id}         → 특정 회원 조회 (JWT 필요)
3. GET /members/page         → 페이지 조회 (JWT 필요)
```

### 시나리오 3: 주문/상품 조회 플로우 (order-service)

```
1. GET /orders               → 주문 목록 조회 (JWT 필요)
2. GET /orders/{id}          → 주문 상세 조회 (JWT 필요)
3. GET /stats/monthly        → 월별 주문 통계
4. GET /stats/daily          → 일별 주문 통계
```

### 시나리오 4: BFF 통합 조회 플로우 (bff)

```
1. GET /bff/members/{id}/with-orders → 회원 + 주문 통합 조회
```

### 시나리오 5: 회원가입 → 로그인 → 조회 e2e (전체 흐름)

```
1. POST /members             → 랜덤 이메일로 회원가입
2. POST /auth/login          → 로그인 → JWT 발급
3. GET  /members/me          → 내 정보 조회
4. GET  /orders/page         → 주문 목록 페이지 조회
```

---

## 디렉터리 구조

```
tests/
└── locust/
    ├── locustfile.py         # 메인 진입점 — TaskSet 조합
    ├── scenarios/
    │   ├── auth.py           # 인증 시나리오
    │   ├── member.py         # 회원 시나리오
    │   ├── order.py          # 주문/통계 시나리오
    │   └── bff.py            # BFF 통합 시나리오
    ├── data/
    │   └── seed.py           # 샘플 데이터 ID 범위 상수
    └── requirements.txt      # locust 의존성
```

---

## 코드 예시

### requirements.txt

```
locust==2.29.0
```

### data/seed.py

DB 샘플 데이터(V2, V3 마이그레이션)의 ID 범위를 상수로 관리한다.

```python
# V2/V3 마이그레이션으로 생성된 샘플 데이터 범위
MEMBER_ID_RANGE = (1, 10)       # 회원 10명
PRODUCT_ID_RANGE = (1, 5)       # 상품 5개
ORDER_ID_RANGE = (1, 100)       # 주문 100건
```

### scenarios/auth.py

```python
import random
from locust import TaskSet, task

class AuthTasks(TaskSet):

    def on_start(self):
        """태스크 시작 전 로그인해서 토큰 획득"""
        self.token = self._login()

    def _login(self):
        member_id = random.randint(*MEMBER_ID_RANGE)
        resp = self.client.post("/auth/login", json={
            "email": f"user{member_id}@example.com",
            "password": "password123"
        })
        if resp.status_code == 200:
            return resp.json().get("accessToken")
        return None

    @task(3)
    def login(self):
        self._login()

    @task(1)
    def validate_token(self):
        if self.token:
            self.client.post("/auth/validate", json={"token": self.token})
```

### locustfile.py

```python
from locust import HttpUser, between
from scenarios.auth import AuthTasks
from scenarios.member import MemberTasks
from scenarios.order import OrderTasks
from scenarios.bff import BffTasks

class RegularUser(HttpUser):
    """일반 사용자 — 조회 위주"""
    wait_time = between(1, 3)
    tasks = {
        AuthTasks: 1,
        MemberTasks: 3,
        OrderTasks: 3,
        BffTasks: 2,
    }

class HeavyUser(HttpUser):
    """헤비 유저 — 반복 조회 + 통계"""
    wait_time = between(0.5, 1)
    tasks = {
        OrderTasks: 5,
        BffTasks: 3,
    }
```

---

## 실행 방법

### 사전 준비

```bash
# Python 가상환경 생성 및 의존성 설치
cd tests/locust
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 로컬 실행 (Web UI)

```bash
# 대상 서버가 로컬에서 실행 중일 때
locust -f locustfile.py --host=http://localhost:80

# 브라우저에서 UI 접속
open http://localhost:8089
```

### CLI 모드 (자동화 / CI)

```bash
locust -f locustfile.py \
  --host=http://localhost:80 \
  --headless \
  --users=50 \
  --spawn-rate=5 \
  --run-time=60s \
  --html=report.html \
  --csv=results
```

### 파라미터 설명

| 파라미터 | 설명 | 권장값 |
|---|---|---|
| `--users` | 동시 접속 가상 사용자 수 | 50~200 |
| `--spawn-rate` | 초당 사용자 증가 수 | 5~10 |
| `--run-time` | 테스트 지속 시간 | 60s~5m |

---

## 테스트 단계별 목표

### 1단계: 스모크 테스트 (1~5 users)

- 모든 시나리오가 오류 없이 동작하는지 확인
- 응답 코드 200/201 외 오류율 0% 목표

### 2단계: 부하 테스트 (50~100 users)

- 목표 처리량 달성 여부 확인
- 평균 응답시간 < 500ms, p99 < 2000ms
- 오류율 < 1%

### 3단계: 스트레스 테스트 (200+ users)

- 시스템이 과부하 상태에서 어떻게 동작하는지 확인
- 병목 지점(DB, 캐시, FeignClient 타임아웃) 식별
- Zipkin으로 느린 구간 추적

---

## 메트릭 수집 연동

Locust 실행 중 다음 도구와 함께 사용하면 더 정밀한 분석이 가능하다.

| 도구 | 확인 항목 |
|---|---|
| Locust Web UI | RPS, 응답시간 분포, 오류율 실시간 그래프 |
| Zipkin (`:9411`) | 서비스 간 traceId 전파, 느린 Span 식별 |
| Prometheus + Grafana | JVM 힙, DB 커넥션 풀, HTTP 요청 지표 |
| Locust HTML 리포트 | 테스트 종료 후 전체 결과 정리 |

---

## 작업 목록

- [ ] `tests/locust/` 디렉터리 구조 생성
- [ ] `requirements.txt` 작성
- [ ] `data/seed.py` — 샘플 데이터 ID 범위 상수 정의
- [ ] `scenarios/auth.py` — 로그인/토큰 갱신 시나리오
- [ ] `scenarios/member.py` — 회원 조회 시나리오
- [ ] `scenarios/order.py` — 주문/통계 조회 시나리오
- [ ] `scenarios/bff.py` — BFF 통합 조회 시나리오
- [ ] `locustfile.py` — 전체 시나리오 조합
- [ ] 스모크 테스트 실행 및 오류율 0% 확인
- [ ] 부하 테스트 실행 후 HTML 리포트 `docs/` 에 보관
