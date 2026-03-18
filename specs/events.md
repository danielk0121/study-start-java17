# [Event Spec] 시스템 이벤트 명세 (EDD)

이 문서는 서비스 간 비동기 결합을 위한 Redis Streams 이벤트 명세를 정의합니다.

## 이벤트 정의 목록

| 이벤트명 | 스트림 키 (Topic) | 페이로드 (Data Record) | 발행자 (Producer) | 구독자 (Consumer) | 비고 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| OrderCreated | `order-stream` | `OrderEvent` (record) | Order Service | Member Service, Stats Service | 주문 생성 시 발생 |
| MemberSignedUp | `member-stream` | `MemberEvent` (record) | Member Service | Auth Service | 회원 가입 시 발생 |

## 페이로드 상세 (Java Record)

### OrderEvent
```java
public record OrderEvent(
    Long orderId,
    Long memberId,
    List<OrderItem> items,
    LocalDateTime orderedAt
) {}
```
