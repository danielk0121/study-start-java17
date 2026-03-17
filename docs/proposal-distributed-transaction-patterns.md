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

## 6. 현재 프로젝트와의 관계

현재 구조에서 `order-service → FeignClient → member-service` 호출은 **조회/검증** 목적이다.
검증 실패 시 주문 자체를 안 만들면 되므로 롤백 문제가 없다.

결제나 재고 차감처럼 **양쪽 서비스에 상태 변경이 동시에 발생**해야 할 때 비로소 Outbox + Saga가 필요하다.
현 단계에서는 고려 불필요하다.
