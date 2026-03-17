# 분산 트랜잭션 패턴: Saga & Outbox

> `docs/proposal-multimodule-architecture.md` 섹션 9(분산 트랜잭션)에 대한 보충 문서.
> 멀티 모듈 전환 이후 결제, 재고 차감 등이 추가될 때 도입을 검토하기 위해 기록한다.

---

## 1. 문제 상황

주문 생성 시 다음 작업이 모두 성공해야 한다고 가정한다:

1. order-service: 주문 저장
2. member-service: 포인트 차감
3. inventory-service: 재고 감소
4. payment-service: 결제 처리

HTTP 호출로 순서대로 처리하면, 결제는 성공했는데 재고 감소 도중 네트워크 오류가 나면 **데이터가 불일치** 상태로 남는다.
단일 DB라면 트랜잭션 롤백으로 해결되지만, 서비스가 분리되면 이게 불가능하다.

---

## 2. Outbox 패턴

### 해결하는 문제

이벤트 **유실** 문제다. DB 저장과 메시지 브로커 발행은 원자적으로 처리할 수 없다.

```
order-service:
  DB에 주문 저장    ← 성공
  Kafka에 이벤트 발행 ← 이 순간 서버 크래시 → 이벤트 유실
```

주문은 저장됐는데 이벤트는 발행 안 됨 → 재고 차감, 결제 처리가 실행되지 않음.

### 해결 방법

이벤트를 메시지 브로커에 바로 발행하지 않고, **같은 DB 트랜잭션 안에** outbox 테이블에 저장한다.
별도 프로세스(Debezium 등)가 outbox 테이블을 폴링하여 Kafka로 릴레이한다.

```
order-service 트랜잭션 1개:
  ┌─────────────────────────────────┐
  │  orders 테이블에 주문 INSERT     │
  │  outbox 테이블에 이벤트 INSERT   │  ← 같은 트랜잭션
  └─────────────────────────────────┘
           ↓ (별도 프로세스 — Debezium 등)
  outbox 테이블 폴링 → Kafka 발행
           ↓
  inventory-service 구독 → 재고 차감
  payment-service 구독   → 결제 처리
```

주문 저장과 이벤트 저장이 같은 DB 트랜잭션이므로 "이벤트는 반드시 발행된다"가 보장된다.

### 단점

- Kafka 같은 메시지 브로커가 필요하다.
- outbox 테이블 폴링 인프라(Debezium 등)가 추가된다.

---

## 3. Saga 패턴

### 해결하는 문제

이벤트가 **정상적으로 발행된다고 가정**한 뒤, 여러 서비스에 걸친 상태 변경을 어떻게 조율하고 실패 시 어떻게 되돌리느냐다.
각 서비스가 로컬 트랜잭션을 실행하고, 실패 시 **보상 트랜잭션**으로 롤백한다.

### 두 가지 방식

#### Choreography (이벤트 기반)

서비스끼리 이벤트로 소통한다. 중앙 조율자 없이 각 서비스가 이벤트를 구독하고 반응한다.

```
order-service     → OrderCreated 이벤트 발행
inventory-service → 재고 차감 → StockReduced 이벤트 발행
payment-service   → 결제 처리 → 실패 → PaymentFailed 이벤트 발행
inventory-service → PaymentFailed 구독 → 재고 복구 (보상 트랜잭션)
order-service     → PaymentFailed 구독 → 주문 취소 (보상 트랜잭션)
```

#### Orchestration (중앙 조율)

오케스트레이터가 각 서비스를 순서대로 호출하고 실패 시 보상을 직접 지시한다.

```
SagaOrchestrator
  ① inventory-service 호출 → 성공
  ② payment-service 호출   → 실패
  ③ inventory-service 보상 호출 (재고 복구)
  ④ 주문 취소 처리
```

### 단점

- 보상 트랜잭션 로직을 모든 서비스에 구현해야 한다.
- 중간 상태(결제 완료 but 재고 미차감) 관리가 복잡하다.

---

## 4. Q. Outbox 폴링 인프라가 없으면 Saga Choreography와 같은 것 아닌가?

**아니다. 둘은 해결하는 문제 자체가 다르다.**

| 패턴 | 해결하는 문제 |
|---|---|
| Outbox | 이벤트를 **안전하게 발행**하는 방법 (유실 방지) |
| Saga | 여러 서비스의 **분산 트랜잭션을 조율**하는 방법 (보상 트랜잭션) |

Outbox는 "메시지 브로커에 이벤트를 신뢰성 있게 전달하는 방법"이고,
Saga는 "이벤트가 정상 발행된다고 가정한 뒤 분산 상태 변경을 조율하는 방법"이다.

Outbox 없이 Saga를 쓰면 이벤트 유실 가능성이 있고,
Saga 없이 Outbox만 쓰면 이벤트는 안전하게 발행되지만 실패 시 보상 로직이 없다.

---

## 5. 두 패턴은 함께 쓰인다

```
Outbox = 이벤트 발행 신뢰성 보장
Saga   = 분산 트랜잭션 조율 + 보상
```

실무에서는 **Outbox로 이벤트를 안전하게 발행하고, Saga로 흐름을 조율**하는 방식을 함께 사용한다.

```
order-service 트랜잭션:
  orders INSERT + outbox INSERT (같은 트랜잭션)
           ↓ Debezium 폴링
  Kafka 발행 → Saga Choreography 시작
  inventory-service: 재고 차감 → 성공
  payment-service: 결제 처리  → 실패
  inventory-service: 재고 복구 (보상)
  order-service: 주문 취소 (보상)
```

---

## 6. Outbox 폴링 인프라: Debezium

### 동작 원리

Debezium은 **CDC(Change Data Capture)** 도구다. DB의 변경 로그(binlog)를 실시간으로 읽어서 Kafka로 발행한다.
직접 테이블을 폴링하는 게 아니라 **MySQL binlog를 구독**한다.

```
MySQL binlog
    ↓ (Debezium이 구독)
Debezium (Kafka Connect 플러그인으로 실행)
    ↓
Kafka 토픽으로 변경 이벤트 발행
    ↓
inventory-service, payment-service 등 구독
```

MySQL은 모든 INSERT/UPDATE/DELETE를 binlog에 기록한다. Debezium은 이 binlog를 읽어서 Kafka 메시지로 변환한다.
outbox 테이블에 행이 INSERT되는 순간 Debezium이 감지하고 즉시 Kafka로 발행한다.

### 필요한 인프라 구성 요소

```
Zookeeper      ← Kafka 클러스터 조율 (Kafka 구버전 필수, 신버전 선택)
Kafka          ← 메시지 브로커
Kafka Connect  ← Debezium 플러그인 실행 컨테이너
Debezium       ← Kafka Connect 위에서 동작하는 커넥터 플러그인
```

docker-compose 기준으로 4개 컨테이너가 추가된다.

### Debezium 없이 직접 폴링하는 방법

Debezium 대신 애플리케이션 내에서 스케줄러로 outbox 테이블을 주기적으로 읽어 Kafka에 발행하는 방식도 있다.

```java
@Scheduled(fixedDelay = 1000)
public void publishOutboxEvents() {
    var events = outboxRepository.findUnpublished();
    for (var event : events) {
        kafkaTemplate.send(event.getTopic(), event.getPayload());
        outboxRepository.markPublished(event.getId());
    }
}
```

**장점:** Debezium/Kafka Connect 인프라 없이 구현 가능
**단점:** 폴링 주기만큼 지연 발생, 발행 직후 서버 크래시 시 중복 발행 가능성 존재 (멱등성 처리 필요)

### 비교 정리

| | Debezium (binlog CDC) | 직접 폴링 (스케줄러) |
|---|---|---|
| 인프라 추가 | Zookeeper + Kafka + Kafka Connect | 없음 |
| 실시간성 | binlog 변경 즉시 감지 | 폴링 주기만큼 지연 |
| 중복 발행 | Debezium이 exactly-once 보장 | 멱등성 직접 구현 필요 |
| 복잡도 | 인프라 복잡, 코드 단순 | 인프라 단순, 코드 복잡 |
| 적합한 규모 | 대규모, 실시간성 중요 | 소규모, 초기 단계 |

### 현재 프로젝트 관점

현 단계에서는 Debezium까지 도입할 필요는 없다. 결제/재고 기능이 추가되어 Outbox + Saga가 필요해지는 시점에
**직접 폴링 방식으로 먼저 구현하고**, 트래픽이 늘어나면 Debezium으로 전환하는 단계적 접근이 현실적이다.

---

## 7. 멱등성 직접 구현

### 문제 상황

직접 폴링 방식에서 아래 순간에 서버가 크래시되면 같은 이벤트가 중복 발행된다.

```
스케줄러:
  outbox에서 이벤트 읽음
  Kafka 발행 성공
  DB에 published 처리 시작 ← 이 순간 서버 크래시
```

재시작 후 스케줄러가 다시 실행되면 같은 이벤트를 또 읽어서 **Kafka에 중복 발행**한다.
소비자(inventory-service 등)가 같은 이벤트를 두 번 받으면 재고가 두 번 차감된다.

### 해결 방법

**소비자 쪽에서 처리 이력을 기록**한다.

```java
// inventory-service (이벤트 소비자)
@KafkaListener(topics = "order-created")
public void handle(OrderCreatedEvent event) {
    // 이미 처리한 이벤트면 무시
    if (processedEventRepository.existsById(event.getEventId())) {
        return;
    }

    // 재고 차감 + 처리 이력 저장을 같은 트랜잭션으로
    inventoryRepository.decrease(event.getProductId(), event.getQuantity());
    processedEventRepository.save(new ProcessedEvent(event.getEventId()));
}
```

```sql
-- 처리 이력 테이블
CREATE TABLE processed_events (
    event_id   VARCHAR(36) PRIMARY KEY,  -- outbox의 이벤트 UUID
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

`event_id`가 PRIMARY KEY이므로 중복 INSERT 시 예외가 발생해 재고 차감도 롤백된다.

### 핵심

멱등성은 **발행자(outbox)**가 아니라 **소비자** 쪽에서 구현한다. 발행이 중복되더라도 소비자가 한 번만 처리하면 결과적으로 안전하다.
이 보장을 **at-least-once + 멱등 소비자** 조합이라고 한다.

---

## 8. Q. 이벤트를 구독하는 모든 서비스는 processed_events 테이블을 가지고 이벤트 구독 함수를 작성해야 하는가?

**맞다.** 다만 몇 가지 현실적인 고려사항이 있다.

### 모든 소비자가 가져야 하는 것

```
inventory-service
  └── processed_events 테이블
  └── @KafkaListener + 멱등성 체크 로직

payment-service
  └── processed_events 테이블
  └── @KafkaListener + 멱등성 체크 로직
```

각 서비스가 독립적으로 자신의 DB에 `processed_events`를 가진다. 공유하지 않는다.

### 중복 코드 문제

모든 소비자가 동일한 패턴을 반복하므로 `common` 모듈에 추상화할 수 있다.

```java
// common 모듈
public abstract class IdempotentEventHandler<T> {

    private final ProcessedEventRepository processedEventRepository;

    @Transactional
    public void handle(T event, String eventId) {
        if (processedEventRepository.existsById(eventId)) {
            return;  // 중복 무시
        }
        doHandle(event);
        processedEventRepository.save(new ProcessedEvent(eventId));
    }

    protected abstract void doHandle(T event);
}
```

```java
// inventory-service
@KafkaListener(topics = "order-created")
public class OrderCreatedHandler extends IdempotentEventHandler<OrderCreatedEvent> {

    @Override
    protected void doHandle(OrderCreatedEvent event) {
        inventoryRepository.decrease(event.getProductId(), event.getQuantity());
    }
}
```

각 서비스는 `doHandle`만 구현하면 멱등성 체크는 자동으로 처리된다.

### 정리

| | 내용 |
|---|---|
| `processed_events` 테이블 | 소비자 서비스마다 각자 보유 |
| 멱등성 체크 로직 | `common` 모듈에 추상화하여 재사용 |
| 각 서비스 구현 | 비즈니스 로직(`doHandle`)만 작성 |

---

## 9. 현재 프로젝트와의 관계

현재 구조에서 `order-service → FeignClient → member-service` 호출은 **조회/검증** 목적이다.
검증 실패 시 주문 자체를 안 만들면 되므로 롤백 문제가 없다.

결제나 재고 차감처럼 **양쪽 서비스에 상태 변경이 동시에 발생**해야 할 때 비로소 Outbox + Saga가 필요하다.
현 단계에서는 고려 불필요하다.

---

## 10. Q. 이 문서의 내용을 Redis Streams 기준으로도 적용할 수 있는가?

**적용 가능하다.** 다만 Kafka 대비 몇 가지 차이점이 있다.

### Redis Streams로 대체 가능한 것

현재 프로젝트에 이미 Redis가 있으므로 Kafka 없이 Redis Streams만으로 동일한 패턴을 구현할 수 있다.

**Outbox 패턴 → Redis Streams 적용**

```
order-service 트랜잭션:
  orders INSERT + outbox INSERT (같은 DB 트랜잭션)
           ↓ (스케줄러 직접 폴링 — Debezium 불필요)
  Redis Streams XADD
           ↓
  inventory-service XREADGROUP → 재고 차감
  payment-service   XREADGROUP → 결제 처리
```

**멱등성 → Redis Streams의 메시지 ID 활용**

Redis Streams는 각 메시지에 `1714000000000-0` 형태의 고유 ID를 자동 부여한다.
이 ID를 `processed_events.event_id`로 사용하면 별도 UUID 생성 없이 멱등성 체크가 가능하다.

**Saga Choreography → Consumer Group**

```
Redis Streams Consumer Group
  stream: order-events
  group: inventory-group → inventory-service 소비
  group: payment-group   → payment-service 소비
```

Consumer Group을 사용하면 같은 이벤트를 각 서비스가 독립적으로 소비한다.

### Kafka 대비 Redis Streams의 한계

| | Kafka | Redis Streams |
|---|---|---|
| 메시지 보존 | 디스크에 영구 저장 (설정에 따라) | 메모리 기반, 크기 제한 (`MAXLEN`) |
| 처리량 | 초당 수백만 건 | 초당 수만~수십만 건 |
| 재처리 | 오프셋으로 과거 어느 시점이나 재처리 | `MAXLEN` 초과 시 오래된 메시지 삭제 |
| Debezium 연동 | 공식 지원 | 없음 (직접 폴링만 가능) |
| 운영 복잡도 | 높음 (Zookeeper, Kafka Connect 등) | 낮음 (Redis 하나로 해결) |

### 현재 프로젝트 관점

현재 프로젝트에 Redis가 이미 있고, Spring Cloud Stream + Redis Streams 연동도 지원된다.
결제/재고 기능이 추가되는 초기 단계에서는 **Redis Streams로 먼저 구현**하고, 메시지 유실이나 처리량 한계에 부딪히면 Kafka로 전환하는 접근이 현실적이다.

단, 한 가지 중요한 제약이 있다. Redis가 다운되면 이벤트 자체가 소실될 수 있으므로,
**Redis AOF(Append Only File) 영속성 설정**을 반드시 활성화해야 Outbox 패턴의 신뢰성이 보장된다.
