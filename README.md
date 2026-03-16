# 목적
- 자바 17 시작
- 특징, 주의점, 새로운 기능 테스트

# task
- 자바 11 스타일 테스트 코드 작성
- 롬복 제거
  - 데이터 클래스 (@Data, @Value, java17 record 등)
  - ToString
  - 생성자
  - 빌더
- MapStruct
- QueryDSL
- Redis Streams (프로듀서/컨슈머/컨슈머 그룹)

---

# ERD

DBML 형식으로 관리합니다. 아래 링크에서 다이어그램으로 확인할 수 있습니다.

- **스펙 파일**: [docs/erd.dbml](./docs/erd.dbml)
- **다이어그램 보기**: [dbdiagram.io에서 열기](https://dbdiagram.io/d) — 링크 접속 후 `docs/erd.dbml` 내용을 붙여넣기

**도메인 구성**

| 테이블 | 설명 |
|---|---|
| `members` | 회원 (이메일, 이름, 권한) |
| `products` | 상품 (상품명, 가격, 재고, 카테고리) |
| `order_events` | 주문 이벤트 (Redis Stream 메시지의 RDB 표현) |

---

# API 문서

OpenAPI 3.0 스펙으로 정의되어 있습니다. 아래 링크에서 바로 확인할 수 있습니다.

| 방법 | 링크 | 설명 |
|---|---|---|
| **Swagger Editor** | [editor.swagger.io/?url=...](https://editor.swagger.io/?url=https://raw.githubusercontent.com/danielk0121/study-start-java17/master/docs/openapi.yaml) | 편집 가능, 직접 API 호출 |
| **ReDoc** | [redocly.github.io/redoc/?url=...](https://redocly.github.io/redoc/?url=https://raw.githubusercontent.com/danielk0121/study-start-java17/master/docs/openapi.yaml) | 읽기 전용, 깔끔한 UI |
| **스펙 파일** | [docs/openapi.yaml](./docs/openapi.yaml) | 원본 YAML 파일 |

로컬 실행 중일 때:
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

---

# Redis Streams 예제

카프카와 유사한 이벤트 스트리밍을 Redis 하나로 구성하는 예제.

## 카프카 vs Redis Streams 개념 대응

| Apache Kafka | Redis Streams |
|---|---|
| Topic | Stream Key (`order-stream`) |
| `KafkaTemplate.send()` | `opsForStream().add()` |
| `@KafkaListener` | `StreamListener` 구현체 |
| Consumer Group | Consumer Group (XGROUP) |
| `commitOffset()` | `opsForStream().acknowledge()` (XACK) |
| Offset | RecordId (`타임스탬프-시퀀스`) |

## 구성 파일

```
src/main/java/dev/danielk/startjava17/stream/
├── OrderEvent.java           # Java 17 Record — 불변 이벤트 모델
├── OrderStreamProducer.java  # 메시지 발행 (XADD)
├── OrderStreamConsumer.java  # 메시지 소비 + ACK (XACK)
├── RedisStreamConfig.java    # 컨슈머 그룹 초기화, 리스너 컨테이너 설정
└── OrderController.java      # 발행 테스트용 REST API
```

## 실행 방법

```bash
# Redis 실행
docker run -d -p 6379:6379 redis:7

# 앱 실행
./gradlew bootRun

# 주문 이벤트 발행
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{"product": "MacBook", "quantity": 2}'
```

## Java 17 적용 포인트

- `OrderEvent` — `record`로 불변 도메인 모델 표현 (`@Data`/`@Value` 대체)
- `OrderController.OrderRequest` — 내부 `record`를 요청 DTO로 활용
