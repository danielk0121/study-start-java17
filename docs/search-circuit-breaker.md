# 연구조사: Circuit Breaker (Resilience4j)

> MSA 환경에서 서비스 간 동기 호출 시 발생하는 연쇄 장애를 차단하는 패턴을 조사한다.
> 이 프로젝트의 멀티 모듈 구조(`proposal-multimodule-architecture.md`) 기준으로 적용 지점을 파악한다.

---

## 1. 왜 필요한가

MSA에서 서비스 A가 서비스 B를 동기 HTTP 호출할 때, B가 응답하지 않으면 A의 스레드가 타임아웃까지 대기한다.
트래픽이 몰리면 A의 스레드 풀이 고갈되고, A를 호출한 서비스까지 연쇄적으로 다운된다.

```
클라이언트
    │
    ▼
order-service (스레드 고갈 → 다운)
    │
    ▼
member-service (응답 없음 → 타임아웃)
    │
    ▼
DB 과부하 또는 네트워크 단절
```

Circuit Breaker는 이 연쇄 장애를 조기에 차단한다.

---

## 2. Circuit Breaker 동작 원리

전기 회로 차단기(Circuit Breaker)에서 이름을 가져왔다.
실패가 일정 수준을 넘으면 회로를 열어(OPEN) 더 이상 호출하지 않는다.

### 상태 전이

```
         실패율 임계치 초과
CLOSED ─────────────────────▶ OPEN
  ▲                              │
  │ 재시도 성공                   │ 대기 시간 경과
  │                              ▼
HALF-OPEN ◀──────────────── (일부 요청 허용)
```

| 상태 | 설명 |
|---|---|
| **CLOSED** | 정상 동작. 모든 요청 통과. 실패율 집계 중 |
| **OPEN** | 회로 열림. 모든 요청 즉시 실패 (fallback 반환). 대기 시간 카운트 |
| **HALF-OPEN** | 회로 반열림. 제한된 요청만 허용하여 복구 여부 확인 |

### 판단 기준

```
슬라이딩 윈도우 (마지막 N건 요청) 기준으로 실패율 계산
→ 실패율 ≥ failure-rate-threshold 이면 OPEN
→ OPEN 상태가 wait-duration-in-open-state 경과 후 HALF-OPEN
→ HALF-OPEN에서 permitted-number-of-calls-in-half-open-state 건 시도
→ 성공률 기준 통과 시 CLOSED, 실패 시 다시 OPEN
```

---

## 3. Resilience4j

Spring Boot 2.x 환경에서 사실상 표준 Circuit Breaker 라이브러리.
Spring Cloud 프로젝트에서 Netflix Hystrix의 후속으로 채택되었다.

### 주요 모듈

| 모듈 | 역할 |
|---|---|
| `resilience4j-circuitbreaker` | Circuit Breaker 핵심 |
| `resilience4j-retry` | 자동 재시도 |
| `resilience4j-timelimiter` | 타임아웃 제한 |
| `resilience4j-bulkhead` | 동시 호출 수 제한 |
| `resilience4j-ratelimiter` | 초당 요청 수 제한 |

### Hystrix와 비교

| 항목 | Hystrix | Resilience4j |
|---|---|---|
| 유지보수 | 2018년 유지보수 모드 종료 | 활발히 유지보수 중 |
| 스레드 모델 | 별도 스레드 풀 (무거움) | 함수형 데코레이터 (가벼움) |
| Java 지원 | Java 8 이상 | Java 8 이상 (함수형 인터페이스 활용) |
| Spring Boot 통합 | `spring-cloud-starter-netflix-hystrix` | `spring-cloud-starter-circuitbreaker-resilience4j` |

---

## 4. 의존성

```groovy
// Spring Cloud BOM 추가 (루트 build.gradle)
dependencyManagement {
    imports {
        mavenBom 'org.springframework.cloud:spring-cloud-dependencies:2021.0.8'
    }
}

// 각 서비스 build.gradle
implementation 'org.springframework.cloud:spring-cloud-starter-circuitbreaker-resilience4j'

// FeignClient와 함께 사용 시
implementation 'org.springframework.cloud:spring-cloud-starter-openfeign'
```

Spring Boot 2.7.x와 호환되는 Spring Cloud 버전: `2021.0.x` (Jubilee)

---

## 5. 설정

```yaml
# application.yml
resilience4j:
  circuitbreaker:
    instances:
      member-service:                           # Circuit Breaker 이름 (FeignClient 이름과 매핑)
        failure-rate-threshold: 50              # 실패율 50% 이상이면 OPEN
        slow-call-rate-threshold: 100           # 느린 호출 비율 임계치 (%)
        slow-call-duration-threshold: 3s        # 이 시간 초과 시 느린 호출로 간주
        sliding-window-type: COUNT_BASED        # COUNT_BASED(건수) 또는 TIME_BASED(시간)
        sliding-window-size: 10                 # 마지막 10건 기준으로 실패율 계산
        minimum-number-of-calls: 5              # 최소 5건 이상이어야 판단
        wait-duration-in-open-state: 10s        # OPEN 상태 유지 시간
        permitted-number-of-calls-in-half-open-state: 3  # HALF-OPEN에서 허용 요청 수
        automatic-transition-from-open-to-half-open-enabled: true

  retry:
    instances:
      member-service:
        max-attempts: 3                         # 최대 3회 시도
        wait-duration: 500ms                    # 재시도 간격
        retry-exceptions:
          - java.io.IOException
          - feign.RetryableException

  timelimiter:
    instances:
      member-service:
        timeout-duration: 3s                    # 3초 초과 시 TimeoutException
```

---

## 6. 적용 방식

### FeignClient에 Circuit Breaker 적용

```java
// FeignClient 선언 시 fallback 지정
@FeignClient(name = "member-service", fallback = MemberClientFallback.class)
public interface MemberClient {
    @GetMapping("/members/{id}")
    MemberResponse getMember(@PathVariable Long id);
}

// Fallback 구현체
@Component
public class MemberClientFallback implements MemberClient {
    @Override
    public MemberResponse getMember(Long id) {
        // Circuit OPEN 또는 타임아웃 시 반환할 기본값
        return null;  // 또는 캐시된 값, 기본 객체 등
    }
}
```

FeignClient와 Circuit Breaker 연동을 위해 아래 설정 필요:

```yaml
feign:
  circuitbreaker:
    enabled: true
```

### 어노테이션 방식 (FeignClient 없이)

```java
@CircuitBreaker(name = "member-service", fallbackMethod = "getMemberFallback")
public MemberResponse getMember(Long id) {
    return memberClient.getMember(id);
}

public MemberResponse getMemberFallback(Long id, Exception e) {
    log.warn("Circuit breaker fallback for memberId={}", id, e);
    return null;
}
```

---

## 7. 이 프로젝트 적용 지점

| 호출 구간 | Circuit Breaker 필요 여부 | 이유 |
|---|---|---|
| `order-service` → `member-service` | **필요** | 주문 생성 시 member 존재 검증. member-service 다운 시 order-service 스레드 고갈 가능 |
| `bff` → `member-service` | **필요** | 조합 응답 생성. 일부 서비스 장애 시 나머지 데이터라도 반환 가능하도록 |
| `bff` → `order-service` | **필요** | 동일 이유 |
| `auth-service` → `member-service` | **필요** | 로그인 시 member 조회. member-service 장애 시 로그인 전체 불가 방지 |

### fallback 전략 예시

```
order-service → member-service 장애 시:
  - 주문 생성: 실패 반환 (존재하지 않는 member에 주문 생성 불가 → fallback으로 에러 응답)
  - 주문 조회: member 정보 없이 주문 정보만 반환 (partial response)

bff → member-service 장애 시:
  - member 필드는 null 또는 빈 객체로 반환, order 데이터는 정상 반환
```

---

## 8. 메트릭 모니터링

Resilience4j는 Micrometer와 연동되어 Prometheus 메트릭을 자동으로 노출한다.

```
resilience4j_circuitbreaker_state                   # 현재 상태 (0=CLOSED, 1=OPEN, 2=HALF_OPEN)
resilience4j_circuitbreaker_calls_total             # 전체 호출 수
resilience4j_circuitbreaker_failure_rate            # 실패율
resilience4j_circuitbreaker_slow_call_rate          # 느린 호출 비율
```

Grafana 대시보드에서 Circuit Breaker 상태 변화를 시각화할 수 있다.

---

## 9. 주의사항

### Retry와 Circuit Breaker 조합

Retry는 Circuit Breaker 바깥에 적용해야 한다.
Retry → Circuit Breaker → 실제 호출 순서로 감싸야 재시도가 Circuit Breaker 실패 카운트에 정상 집계된다.

```
Retry (3회 시도)
    └── CircuitBreaker (실패율 집계)
            └── 실제 HTTP 호출
```

### 슬라이딩 윈도우 크기

`sliding-window-size`가 너무 작으면 일시적 오류에도 OPEN될 수 있다.
`minimum-number-of-calls`로 최소 판단 기준을 설정해 오탐을 줄인다.

### 테스트 환경

테스트에서 Circuit Breaker가 열리면 의도치 않은 fallback이 실행될 수 있다.
`@SpringBootTest` 환경에서는 `resilience4j.circuitbreaker.instances.xxx.enabled: false` 로 비활성화하거나,
`CircuitBreakerRegistry`를 통해 상태를 수동으로 초기화한다.

---

## 10. 요약

| 항목 | 내용 |
|---|---|
| 목적 | 연쇄 장애(Cascade Failure) 차단 |
| 라이브러리 | `spring-cloud-starter-circuitbreaker-resilience4j` |
| 핵심 상태 | CLOSED → OPEN → HALF-OPEN → CLOSED |
| 적용 방식 | FeignClient fallback 또는 `@CircuitBreaker` 어노테이션 |
| 모니터링 | Micrometer → Prometheus → Grafana |
| 이 프로젝트 적용 대상 | order-service, bff, auth-service의 FeignClient 호출 구간 |
