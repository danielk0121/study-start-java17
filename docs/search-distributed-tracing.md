# 조사: 분산 추적 (Spring Cloud Sleuth + Zipkin)

> MSA 환경에서 서비스 간 요청 흐름을 단일 식별자로 추적하는 방법을 조사한다.
> 이 프로젝트는 이미 단일 모듈에서 Sleuth를 적용하고 있으며, 멀티 모듈 전환 후 traceId 전파 동작을 검증하는 것이 목표다.

---

## 1. 왜 필요한가

모놀리식에서는 하나의 요청이 하나의 프로세스 안에서 처리되므로 로그 한 줄로 흐름 파악이 가능하다.
MSA에서는 하나의 요청이 여러 서비스를 거치므로 각 서비스의 로그를 연결해야 전체 흐름을 알 수 있다.

```
클라이언트 → bff → member-service → DB
                └── order-service  → DB

bff 로그:    [INFO] 요청 처리 시작
member 로그: [INFO] 회원 조회 완료
order 로그:  [ERROR] 주문 조회 실패
```

어떤 클라이언트 요청에서 발생한 에러인지 연결할 수 없다. 분산 추적은 이 문제를 해결한다.

---

## 2. 핵심 개념

### Trace와 Span

```
Trace: 하나의 클라이언트 요청 전체 (고유 traceId)
  └── Span: 각 서비스(또는 내부 작업)의 처리 단위 (고유 spanId)

traceId=abc123
  ├── Span 001 (bff)            0ms ~ 150ms
  │     ├── Span 002 (member-service)   10ms ~ 50ms
  │     └── Span 003 (order-service)    60ms ~ 140ms
  │           └── Span 004 (DB 쿼리)   70ms ~ 130ms
```

- **traceId**: 요청 전체를 관통하는 식별자. 서비스 간 HTTP 헤더로 전파된다.
- **spanId**: 개별 작업 단위 식별자. 부모-자식 관계(parentSpanId)로 계층 구조를 표현한다.

### 전파 방식

HTTP 요청 헤더에 traceId/spanId를 포함해 서비스 간 전달한다.

**B3 Propagation (Zipkin 표준):**
```
X-B3-TraceId: abc123
X-B3-SpanId: 002
X-B3-ParentSpanId: 001
X-B3-Sampled: 1
```

Spring Cloud Sleuth는 FeignClient / RestTemplate / WebClient 호출 시 이 헤더를 자동으로 주입하고 수신 시 자동으로 추출한다.

---

## 3. Spring Cloud Sleuth

Spring Boot 애플리케이션에 분산 추적을 자동으로 적용하는 라이브러리.
별도 코드 수정 없이 의존성 추가만으로 traceId/spanId가 MDC에 자동 주입된다.

### 자동 계측 대상

| 대상 | 동작 |
|---|---|
| 수신 HTTP 요청 (Servlet Filter) | 헤더에서 traceId 추출 또는 신규 생성 |
| FeignClient | 발신 헤더에 traceId 자동 주입 |
| RestTemplate | 발신 헤더에 traceId 자동 주입 |
| `@Async` 메서드 | 새 스레드로 MDC 컨텍스트 전파 |
| 스케줄러 (`@Scheduled`) | 새 traceId 자동 생성 |
| Kafka / RabbitMQ | 메시지 헤더로 traceId 전파 |

### MDC 자동 주입

Sleuth가 적용되면 로그에 traceId/spanId가 자동으로 포함된다.

```
# 로그 출력 예시
2026-03-18 10:00:00 INFO  [member-service,abc123,002] c.d.m.MemberService - 회원 조회: id=1
                          └─────────────────────────┘
                          [서비스명, traceId, spanId]
```

`logback-spring.xml`에서 MDC 값을 패턴에 포함시켜야 한다:

```xml
<pattern>%d{yyyy-MM-dd HH:mm:ss} %-5level [%X{traceId},%X{spanId}] %logger{36} - %msg%n</pattern>
```

JSON 로그(Logstash Encoder) 사용 시 자동으로 포함된다.

---

## 4. 의존성

```groovy
// 루트 build.gradle — Spring Cloud BOM
dependencyManagement {
    imports {
        mavenBom 'org.springframework.cloud:spring-cloud-dependencies:2021.0.8'
    }
}

// 각 서비스 build.gradle
implementation 'org.springframework.cloud:spring-cloud-starter-sleuth'

// Zipkin으로 스팬 전송 시 추가
implementation 'org.springframework.cloud:spring-cloud-sleuth-zipkin'
```

Spring Boot 2.7.x와 호환되는 Spring Cloud 버전: `2021.0.x` (Jubilee)

> **주의:** Spring Boot 3.x에서는 Sleuth가 Micrometer Tracing으로 대체되었다.
> 이 프로젝트는 Spring Boot 2.7.x를 사용하므로 Sleuth를 사용한다.

---

## 5. Zipkin

Sleuth가 수집한 스팬 데이터를 시각화하는 분산 추적 UI.

### 구성

```
서비스 (Sleuth)
    │
    │ HTTP POST /api/v2/spans (비동기, 논블로킹)
    ▼
Zipkin Server
    │
    ├── 메모리 저장 (개발용)
    └── Elasticsearch 저장 (운영용)
```

### Zipkin 서버 실행 (로컬)

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

UI 접속: http://localhost:9411

### 설정

```yaml
# application.yml
spring:
  zipkin:
    base-url: http://localhost:9411   # Zipkin 서버 주소
    sender:
      type: web                       # HTTP로 스팬 전송 (기본값)
  sleuth:
    sampler:
      probability: 1.0                # 샘플링 비율 (1.0 = 100%, 운영에서는 0.1 권장)
```

### Zipkin UI에서 확인 가능한 정보

- 서비스 간 요청 흐름 (타임라인)
- 각 Span의 소요 시간
- 에러 발생 위치
- 서비스 의존성 그래프

```
Zipkin 타임라인 예시:

traceId: abc123
─────────────────────────────────────────────────
bff [GET /bff/members/1/with-orders]     0ms ─────────── 150ms
  member-service [GET /members/1]        10ms ──── 50ms
  order-service [GET /orders?memberId=1] 60ms ─────────── 140ms
    DB 쿼리 [SELECT * FROM orders]       70ms ─── 130ms  ← 느린 쿼리 식별 가능
```

---

## 6. 샘플링 전략

모든 요청의 스팬을 Zipkin에 전송하면 네트워크 부하가 크다.
운영 환경에서는 일부만 샘플링한다.

| 전략 | 설정 | 설명 |
|---|---|---|
| 전량 수집 | `probability: 1.0` | 개발/테스트 환경 |
| 비율 샘플링 | `probability: 0.1` | 10%만 수집. 운영 권장 |
| 레이트 제한 | `rate: 10` | 초당 최대 10건 수집 |

```yaml
spring:
  sleuth:
    sampler:
      probability: 0.1    # 운영: 10% 샘플링
```

샘플링되지 않은 요청도 traceId는 MDC에 주입되어 로그에 포함된다.
Zipkin에 전송되지 않을 뿐이다.

---

## 7. 이 프로젝트 적용 현황 및 검증 포인트

### 현재 적용 현황 (단일 모듈)

- Spring Cloud Sleuth 3.1.11 이미 적용 중
- `logback-spring.xml`에서 traceId/spanId MDC 출력 설정 완료
- JSON 로그(Logstash Encoder)에 traceId 자동 포함

### 멀티 모듈 전환 후 검증 포인트

멀티 모듈 전환 후 FeignClient 호출 시 traceId가 서비스 간 헤더로 전파되는지 확인해야 한다.

```
검증 시나리오:
1. GET /bff/members/1/with-orders 요청
2. bff 로그에서 traceId 확인
3. bff → member-service FeignClient 호출 시 동일 traceId 전파 여부 확인
4. bff → order-service FeignClient 호출 시 동일 traceId 전파 여부 확인

기대 결과:
bff 로그:            [traceId=abc123, spanId=001] ...
member-service 로그: [traceId=abc123, spanId=002] ...
order-service 로그:  [traceId=abc123, spanId=003] ...
```

### 전파가 동작하는 조건

Sleuth는 `FeignClient`, `RestTemplate`, `WebClient` 호출 시 자동으로 헤더를 주입한다.
이 프로젝트는 FeignClient를 사용하므로 추가 설정 없이 동작해야 한다.

단, FeignClient 빈이 Spring 컨텍스트에서 Sleuth의 `TracingFeignClient`로 감싸져 있어야 한다.
`spring-cloud-starter-sleuth`와 `spring-cloud-starter-openfeign`을 함께 사용하면 자동 구성된다.

---

## 8. Zipkin과 ELK 연동

로그(ELK)와 추적(Zipkin)을 함께 사용하면 에러 로그에서 바로 Zipkin 추적 화면으로 이동할 수 있다.

```
Kibana 로그 검색: traceId=abc123 → 에러 로그 발견
                          ↓
Zipkin 검색: traceId=abc123 → 전체 요청 흐름 시각화
```

Kibana 대시보드에 Zipkin 링크를 포함시켜 원클릭으로 전환 가능하다.

---

## 9. Micrometer Tracing (Spring Boot 3.x 이후)

Spring Boot 3.x에서는 Sleuth가 deprecated되고 Micrometer Tracing으로 대체되었다.
Micrometer Tracing은 Zipkin, OpenTelemetry(OTel) 등 다양한 백엔드를 지원한다.

| 항목 | Spring Boot 2.x | Spring Boot 3.x |
|---|---|---|
| 라이브러리 | Spring Cloud Sleuth | Micrometer Tracing |
| Zipkin 연동 | `spring-cloud-sleuth-zipkin` | `micrometer-tracing-bridge-brave` + Zipkin Exporter |
| OTel 연동 | 별도 설정 필요 | `micrometer-tracing-bridge-otel` |

이 프로젝트는 Spring Boot 2.7.x를 사용하므로 Sleuth를 사용한다.
Spring Boot 3.x 마이그레이션 시 Micrometer Tracing으로 전환이 필요하다.

---

## 10. 요약

| 항목 | 내용 |
|---|---|
| 목적 | 서비스 간 요청 흐름 추적 (traceId 전파) |
| 라이브러리 | Spring Cloud Sleuth 3.1.x |
| 시각화 | Zipkin |
| 전파 방식 | B3 헤더 (`X-B3-TraceId` 등), FeignClient 자동 주입 |
| 샘플링 | 개발 100%, 운영 10% 권장 |
| 현재 상태 | 단일 모듈 적용 완료. 멀티 모듈 전환 후 전파 동작 검증 필요 |
