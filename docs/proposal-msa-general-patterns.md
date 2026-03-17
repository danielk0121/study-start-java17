# 제안: 보통의 MSA 서비스 — 패턴과 고려사항

> 이 문서는 일반적인 MSA(마이크로서비스 아키텍처) 서비스가 갖춰야 하는 요소들을 정리한다.
> 이 프로젝트(`study-start-java17`)의 멀티 모듈 설계(`proposal-multimodule-architecture.md`)를 기준으로 설명한다.

---

## 1. MSA란

하나의 큰 애플리케이션을 독립적으로 배포 가능한 작은 서비스 단위로 분리하는 아키텍처 스타일.

| 항목 | 모놀리식 | MSA |
|---|---|---|
| 배포 단위 | 전체 애플리케이션 1개 | 서비스별 독립 배포 |
| 장애 격리 | 장애 전파 (전체 다운) | 서비스 단위 격리 |
| 스케일 | 전체 동시 확장 | 서비스별 독립 확장 |
| 복잡도 | 코드베이스 복잡 | 네트워크/운영 복잡 |
| 기술 스택 | 단일 | 서비스별 독립 선택 가능 |

---

## 2. API Gateway / BFF

### API Gateway

클라이언트 요청을 각 서비스로 라우팅하는 단일 진입점.

```
클라이언트
    │
    ▼
API Gateway (Nginx / AWS ALB / k8s Ingress)
    ├── /auth/**     → auth-service
    ├── /members/**  → member-service
    ├── /orders/**   → order-service
    └── /bff/**      → bff
```

**역할:**
- 경로 기반 라우팅
- SSL 종단 처리 (HTTPS → HTTP)
- 공통 헤더 주입 (`X-Request-Id`, `X-Forwarded-For`)
- 속도 제한 (Rate Limiting)

**이 프로젝트 적용:** Nginx가 로컬에서 API Gateway 역할을 담당한다. 운영에서는 AWS ALB 또는 k8s Ingress로 동일 구조를 구성한다.

### BFF (Backend for Frontend)

특정 클라이언트(모바일, 웹)에 최적화된 응답을 조합해 반환하는 서비스.

```
모바일 앱 → Mobile BFF → member-service, order-service
웹 브라우저 → Web BFF  → member-service, order-service, stats-service
```

여러 서비스의 응답을 한 번에 묶어 클라이언트가 여러 번 호출하지 않아도 되게 한다.

**이 프로젝트 적용:** `bff` 모듈이 `member-service`와 `order-service`를 FeignClient로 호출해 조합한다.

---

## 3. 서비스 간 통신

### 동기 통신 (HTTP / REST)

요청-응답이 즉시 이루어지는 방식.

```
order-service ──FeignClient──▶ member-service
                              (동기, 응답 대기)
```

**장점:** 구현 단순, 즉각적 응답
**단점:** 호출 대상 서비스가 다운되면 자신도 실패 (연쇄 장애 가능)
**대응:** Circuit Breaker (Resilience4j)

### 비동기 통신 (이벤트 / 메시지)

메시지 브로커(Kafka, Redis Streams)를 통해 비동기로 이벤트를 발행·소비하는 방식.

```
order-service ──PUBLISH──▶ Kafka/Redis Streams ──CONSUME──▶ stock-service
                                                          ──CONSUME──▶ notification-service
```

**장점:** 서비스 간 결합도 낮음, 한 쪽이 다운돼도 메시지 보존
**단점:** 최종 일관성 (즉각 반영 아님), 복잡한 운영

**이 프로젝트 적용:** Redis Streams 기반 이벤트 발행/소비 (`proposal-distributed-transaction-patterns.md` 참고)

---

## 4. 인증/인가

### JWT 기반 Stateless 인증

클라이언트가 로그인 후 받은 JWT를 이후 모든 요청의 `Authorization` 헤더에 포함한다.

```
클라이언트 → POST /auth/login
           ← { accessToken, refreshToken }

클라이언트 → GET /members/me
           Authorization: Bearer eyJ...
           → JwtAuthFilter 검증 → SecurityContext 주입
```

**이 프로젝트 적용:** auth-service가 토큰 발급을 전담한다. member-service, order-service는 토큰 검증만 수행한다. (`proposal-spring-security-jwt.md` 참고)

### 서비스 간 내부 인증

| 방식 | 설명 | 복잡도 |
|---|---|---|
| 내부 네트워크 신뢰 | Docker network / k8s ClusterIP 격리로 충분 | 낮음 |
| mTLS | 서비스 간 상호 TLS 인증 (Istio Service Mesh) | 높음 |
| 서비스 계정 토큰 | 서비스별 별도 JWT 발급 | 중간 |

**이 프로젝트 적용:** 내부 네트워크 신뢰 방식. 서비스 간 FeignClient 호출에는 인증을 적용하지 않는다.

---

## 5. 장애 처리

### Circuit Breaker

연속 실패 시 더 이상 호출하지 않고 즉시 실패(또는 fallback)를 반환해 연쇄 장애를 차단한다.

```
order-service → member-service 호출 5회 연속 실패
                     ↓
               Circuit OPEN (일정 시간 호출 차단)
                     ↓
               fallback 반환 or 에러 응답
                     ↓
               일정 시간 후 HALF-OPEN (일부 요청 재시도)
                     ↓
               성공 시 Circuit CLOSE (정상 복구)
```

**라이브러리:** Resilience4j (`spring-cloud-circuitbreaker-resilience4j`)

**주요 설정:**
```yaml
resilience4j.circuitbreaker:
  instances:
    member-service:
      failure-rate-threshold: 50        # 실패율 50% 이상 시 OPEN
      wait-duration-in-open-state: 10s  # OPEN 상태 유지 시간
      sliding-window-size: 10           # 판단 기준 요청 수
```

### Retry

일시적 네트워크 오류에 대해 자동 재시도한다.

```yaml
resilience4j.retry:
  instances:
    member-service:
      max-attempts: 3
      wait-duration: 500ms
```

Circuit Breaker와 함께 사용 시 Retry → Circuit Breaker 순서로 적용한다.

### Timeout

응답 대기 시간을 제한해 스레드 점유를 방지한다.

```yaml
feign:
  client:
    config:
      member-service:
        connect-timeout: 1000   # 연결 타임아웃 1초
        read-timeout: 3000      # 응답 타임아웃 3초
```

---

## 6. 분산 추적

서비스 A → B → C로 이어지는 요청 흐름을 단일 `traceId`로 추적한다.

```
클라이언트 요청 → traceId 생성
    │
    ├── member-service  [traceId=abc123, spanId=001]
    │       └── order-service  [traceId=abc123, spanId=002]
    │               └── stats-service  [traceId=abc123, spanId=003]
```

**라이브러리:** Spring Cloud Sleuth (자동 traceId/spanId 생성 및 MDC 주입)

**이 프로젝트 적용:** 단일 모듈에서 이미 Sleuth를 적용 중이다. 멀티 모듈 전환 후에도 HTTP 헤더(`X-B3-TraceId`, `X-B3-SpanId`)를 통해 traceId가 자동 전파된다.

**로그 예시:**
```
[traceId=abc123 spanId=001] member-service  - GET /members/1
[traceId=abc123 spanId=002] order-service   - GET /orders?memberId=1
```

**Zipkin 연동:** Sleuth가 수집한 스팬(span)을 Zipkin UI에서 시각화할 수 있다.

---

## 7. 분산 트랜잭션

서비스 간 DB가 분리된 환경에서 데이터 일관성을 보장하는 패턴.

### Outbox 패턴

이벤트 발행과 DB 저장을 원자적으로 처리한다. 이벤트를 메시지 브로커가 아닌 같은 DB의 `outbox` 테이블에 함께 저장하고, 별도 프로세스가 폴링해서 발행한다.

### Saga 패턴

분산 트랜잭션을 여러 단계의 로컬 트랜잭션으로 분해한다. 실패 시 보상 트랜잭션(Compensating Transaction)으로 롤백한다.

**이 프로젝트 적용:** `proposal-distributed-transaction-patterns.md`에서 상세 설명

---

## 8. 관찰 가능성 (Observability)

서비스 상태를 외부에서 파악할 수 있는 능력. 세 가지 축으로 구성된다.

| 축 | 도구 | 목적 |
|---|---|---|
| **로그 (Logs)** | Logstash + Elasticsearch + Kibana (ELK) | 이벤트 기록, 에러 원인 파악 |
| **메트릭 (Metrics)** | Prometheus + Grafana | 수치 기반 모니터링, 알람 |
| **추적 (Traces)** | Sleuth + Zipkin | 서비스 간 요청 흐름 추적 |

### 로그

```
서비스 → JSON 로그 출력 (Logstash Logback Encoder)
       → Logstash 수집
       → Elasticsearch 저장
       → Kibana 시각화
```

**이 프로젝트 적용:** JSON 로그는 이미 적용 완료. ELK 스택은 운영 환경에서 추가한다.

### 메트릭

```
서비스 → /actuator/prometheus 엔드포인트 노출
       → Prometheus 스크래핑 (pull 방식)
       → Grafana 대시보드 시각화
       → 임계치 초과 시 알람 (Slack, PagerDuty 등)
```

**이 프로젝트 적용:** `/actuator/prometheus` 엔드포인트 이미 적용 완료.

### 헬스체크

```
GET /actuator/health
→ { "status": "UP" }

k8s Probe:
  livenessProbe:  /actuator/health/liveness   (프로세스 생존 여부)
  readinessProbe: /actuator/health/readiness  (요청 처리 준비 여부)
```

**이 프로젝트 적용:** `/actuator/health` 이미 적용 완료.

---

## 9. 서비스 디스커버리

서비스가 서로를 찾는 방법.

| 방식 | 도구 | 설명 |
|---|---|---|
| 인프라 레벨 DNS | Docker Compose 컨테이너 이름 / k8s ClusterIP | 환경변수로 호스트명 지정 |
| 애플리케이션 레벨 레지스트리 | Eureka (Spring Cloud Netflix) | 서비스가 직접 레지스트리에 등록/조회 |

**이 프로젝트 적용:** 환경변수 기반 고정 URL 방식을 사용한다.

```yaml
# order-service application.yml
member-service:
  url: ${MEMBER_SERVICE_URL:http://localhost:8080}
```

Docker Compose에서는 컨테이너 이름이 DNS로 동작하고, k8s에서는 ClusterIP Service가 동일한 역할을 한다. Eureka 같은 애플리케이션 레벨 레지스트리는 k8s/AWS 환경에서 인프라가 이미 대체하므로 별도 도입이 불필요하다.

---

## 10. 스케일 아웃

트래픽 증가 시 서비스 인스턴스를 늘리는 방법.

### 수평 확장 (Horizontal Scaling)

동일 서비스를 여러 인스턴스로 실행한다.

```
클라이언트
    │
    ▼
Load Balancer (Nginx upstream / k8s Service)
    ├── member-service 인스턴스 1 (8080)
    ├── member-service 인스턴스 2 (8080)
    └── member-service 인스턴스 3 (8080)
```

**고려사항:**
- 세션 상태를 서버에 저장하지 않아야 한다 (Stateless) → JWT로 해결
- 캐시를 로컬 메모리에 저장하면 인스턴스 간 불일치 발생 → Redis 공유 캐시로 해결

### k8s HPA (Horizontal Pod Autoscaler)

CPU 또는 메모리 사용률 기준으로 자동 스케일 아웃한다.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: member-service-hpa
spec:
  scaleTargetRef:
    name: member-service
  minReplicas: 1
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

---

## 11. 배포 전략

### Blue-Green 배포

현재 운영 중인 버전(Blue)과 새 버전(Green)을 동시에 실행하고, 트래픽을 한 번에 전환한다.

```
현재: Blue (v1.0) ← 트래픽 100%
      Green (v2.0) ← 트래픽 0% (준비 중)

전환: Blue (v1.0) ← 트래픽 0%
      Green (v2.0) ← 트래픽 100%

문제 시 즉시 롤백 가능
```

### Canary 배포

새 버전에 일부 트래픽만 흘려 문제를 조기에 발견한다.

```
Blue  (v1.0) ← 트래픽 90%
Canary (v2.0) ← 트래픽 10%

문제 없으면 점진적으로 트래픽 이전
```

**k8s 적용:** k8s Deployment + Service 가중치, 또는 Argo Rollouts, Flagger 활용

---

## 12. 이 프로젝트에서 다루는 주제 요약

| 주제 | 문서 | 상태 |
|---|---|---|
| 멀티 모듈 아키텍처 | `proposal-multimodule-architecture.md` | 설계 완료 |
| 분산 트랜잭션 (Outbox + Saga) | `proposal-distributed-transaction-patterns.md` | 설계 완료 |
| Spring Security + JWT 인증 | `proposal-spring-security-jwt.md` | 설계 완료 |
| Circuit Breaker (Resilience4j) | README TODO | 별도 작업 예정 |
| 분산 추적 (Sleuth traceId 전파) | README TODO | 멀티 모듈 전환 후 검증 |
| 관찰 가능성 (Prometheus 메트릭) | 이미 적용 (`/actuator/prometheus`) | 완료 |
| 서비스 디스커버리 | 환경변수 기반 고정 URL | 인프라 레벨로 충분 |
| 스케일 아웃 / 배포 전략 | — | 서비스 운영 단계에서 대응 |
