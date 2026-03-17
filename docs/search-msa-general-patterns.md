# 연구조사: 보통의 MSA 서비스 — 이 프로젝트 기준 검토

> 이 문서는 일반적인 MSA에서 다루는 주제 중 이 프로젝트에서 다루고 있는 것과 빠진 것을 정리한다.
> CI/CD는 의도적으로 제외했다.

---

## 현재 문서에 있는 것

- 멀티 모듈 아키텍처 — 모듈 구조, 서비스 간 통신, 인증 범위, DB 공유, 실행 순서 (`proposal-multimodule-architecture.md`)
- 분산 트랜잭션 — Outbox, Saga, Debezium, 멱등성 (`proposal-distributed-transaction-patterns.md`)
- Spring Security + JWT — auth-service 분리, 토큰 발급/검증, 인가 정책 (`proposal-spring-security-jwt.md`)

---

## 실무 MSA에서 흔히 다루는 주제 중 빠진 것

### 운영 관련

**서비스 디스커버리** (Eureka / k8s Service)
FeignClient가 서비스 이름으로 호출할 때 주소를 어떻게 찾는가.
현재 문서는 고정 URL(`MEMBER_SERVICE_URL: http://member-service:8080`) 방식이라 Docker Compose 안에서는 동작하지만, 동적 스케일링 시 주소 관리 문제가 생긴다.
→ k8s나 AWS 환경으로 가면 자연스럽게 따라오는 주제라 지금 단계에서 문서화하면 과도하다.

**Circuit Breaker** (Resilience4j)
member-service 장애 시 order-service가 무한 대기하지 않도록.
현재 문서에 "장애 격리" 언급은 있지만 구현 방법은 없다.
→ **FeignClient 호출이 생기는 순간부터 필요한 문제. 멀티 모듈 전환과 동시에 고려해야 할 수준.**

**분산 추적** (Sleuth/Zipkin)
여러 서비스에 걸친 요청의 traceId 전파.
현재 단일 모듈에는 Sleuth가 있으며, 멀티 모듈로 분리되면 서비스 간 traceId 전파 설정이 필요하다.
→ **Sleuth가 FeignClient 헤더를 통해 traceId를 자동 전파하므로, 멀티 모듈 전환 후 동작 확인하는 정도면 충분. 추가 작업이 크지 않다.**

### 설정 관리

**중앙 설정 관리** (Spring Cloud Config / AWS Parameter Store)
각 서비스가 JWT secret 같은 공통 설정을 어디서 가져오는가.
현재는 각 서비스 `application.yml`에 중복으로 들어가는 구조다.
→ k8s나 AWS 환경으로 가면 자연스럽게 따라오는 주제라 지금 단계에서 문서화하면 과도하다.

### 데이터

**API 버전 관리** (`/v1/`, `/v2/`)
클라이언트 호환성을 깨지 않고 API를 변경하는 전략.
서비스가 분리되면 각 서비스의 API 변경이 다른 서비스에 영향을 줄 수 있다.
→ k8s나 AWS 환경으로 가면 자연스럽게 따라오는 주제라 지금 단계에서 문서화하면 과도하다.

---

## 결론 — 이 프로젝트에서 실제로 추가할 것

지금 수준에서 현실적으로 문서화할 가치가 있는 건 **Circuit Breaker** 하나다.
이미 장애 격리 언급이 있는데 구현 방법(Resilience4j `@CircuitBreaker`, fallback 메서드)이 없어서 문서와 구현 사이 갭이 있다.

나머지(서비스 디스커버리, 중앙 설정 관리, 분산 추적 전파)는 k8s나 AWS 환경으로 가면 자연스럽게 필요성이 생기는 것들이라 지금 고려하면 오버엔지니어링이다.

| 주제 | 판단 | 이유 |
|---|---|---|
| Circuit Breaker (Resilience4j) | **추가 필요** | FeignClient 호출 생기는 순간부터 필요. 멀티 모듈 전환과 동시에 고려 |
| 분산 추적 (Sleuth traceId 전파) | **검증만** | Sleuth가 FeignClient 헤더 자동 처리. 멀티 모듈 전환 후 동작 확인으로 충분 |
| 서비스 디스커버리 | **보류** | k8s/AWS 환경에서 자연스럽게 따라오는 주제 |
| 중앙 설정 관리 | **보류** | 동일 |
| API 버전 관리 | **보류** | 동일 |
