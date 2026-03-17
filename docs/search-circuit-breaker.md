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

---

## 11. Q&A

**Q. Circuit Breaker가 그냥 Retry 규칙과 실패 시 어떻게 할건지 로직을 추가하는 거네?**

맞다. 핵심은 그거다. 다만 단순 Retry와 Circuit Breaker 사이에 결정적인 차이가 하나 있다.

**단순 Retry**
```
실패 → 재시도 → 실패 → 재시도 → 실패 → 포기
```
매번 실패해도 계속 호출을 시도한다. 대상 서비스가 다운된 상태라면 재시도마다 스레드가 타임아웃까지 대기하므로 오히려 부하를 가중시킨다.

**Circuit Breaker**
```
실패 → 실패 → 실패 → (임계치 초과) → 회로 OPEN
                                          ↓
                               이후 호출은 즉시 차단 (대상 서비스에 아예 안 붙음)
                               fallback 즉시 반환
```
대상 서비스가 이미 죽어있다는 걸 판단하고 호출 자체를 막아버린다. 스레드 점유가 없고 응답이 빠르다. 일정 시간 후 HALF-OPEN으로 자동 복구 시도도 한다.

정리:
- Retry → "한 번 더 해볼게"
- Circuit Breaker → "지금 걔 죽었으니까 잠깐 호출 자체를 끊자, fallback 줄게"

두 개를 함께 쓰는 게 일반적이다. Retry로 일시적 오류를 처리하고, 그래도 계속 실패하면 Circuit Breaker가 열리는 구조다.

---

**Q. 일부 서비스가 다운되면 유저 입장에서는 어차피 시스템 전체가 다운된 걸로 인식되지 않나? Circuit Breaker가 의미가 있나?**

맞다. 완전히 다운된 경우 그 기능을 못 쓰는 건 Circuit Breaker가 있든 없든 동일하다.

Circuit Breaker가 실제로 유효한 상황은 **서비스가 완전히 다운된 경우가 아니라 부분적으로 느려지거나 간헐적으로 실패하는 경우**다.

```
member-service가 DB 과부하로 응답이 5초씩 걸림 (다운은 아님)

Circuit Breaker 없으면:
  order-service 스레드 전부 5초씩 대기 → order-service도 다운 → 장애 전파

Circuit Breaker 있으면:
  order-service는 즉시 차단 + fallback → order-service는 정상 동작
```

즉 **한 서비스의 성능 저하가 다른 서비스로 전파되는 연쇄 장애를 막는 것**이 핵심이다. 완전히 다운된 경우도 마찬가지다.

```
member-service 완전 다운

Circuit Breaker 없으면:
  order-service도 스레드 고갈로 같이 다운 → 주문 조회/취소도 불가

Circuit Breaker 있으면:
  order-service는 살아있음 → 기존 주문 조회/취소는 정상
  (member 관련 기능만 장애, 장애 범위가 격리됨)
```

결국 Circuit Breaker의 가치는 **장애를 없애는 게 아니라 장애 범위를 격리하는 것**이다.
서비스가 촘촘하게 얽혀있지 않은 단순한 구조라면 효용이 크지 않다. 이 프로젝트 규모에서는 오버엔지니어링이 맞다.

---

**Q. Circuit Breaker의 fallback 로직을 어떤 걸로 할 것인지 상상하는 게 더 어렵겠네. 그냥 장애를 더 발생 안 하도록 고민하는 게 빠르겠다.**

맞다. 실무에서도 같은 결론이다.

Circuit Breaker는 장애가 이미 발생했을 때 피해를 줄이는 것인데, fallback 로직을 제대로 짜려면 "이 호출이 실패했을 때 유저에게 뭘 보여줄 것인가"를 모든 호출 지점마다 설계해야 한다. 서비스가 복잡할수록 이 판단이 비즈니스 도메인 지식을 요구하고 케이스도 많아진다.

| 호출 목적 | fallback 전략 |
|---|---|
| 존재 검증 (주문 생성 시 member 확인) | 에러 응답 — 생략 불가 |
| 데이터 조합 (조회 시 member 이름 포함) | null 또는 캐시값 반환 — 생략 가능 |

라이브러리 설정보다 이 판단이 더 어렵다.

반면 **장애 자체를 줄이는 방향**은 투자 대비 효과가 훨씬 크고 운영 복잡도도 낮다:
- DB 커넥션 풀 / 타임아웃 적절히 설정
- 서비스 인스턴스 이중화 (k8s replica)
- 느린 쿼리 최적화
- 헬스체크 + 자동 재시작

Circuit Breaker는 서비스가 많고 얽힘이 복잡해서 장애를 원천 차단하기 어려운 규모가 됐을 때 비로소 도입을 고민하는 게 맞다.
