# [PRD] Java 17 기반 마이크로서비스 커머스 플랫폼 (study-start-java17)

## 1. 제품 개요 (Product Overview)
본 프로젝트는 Java 17의 최신 기능을 활용하여 견고하고 확장 가능한 마이크로서비스 아키텍처(MSA)를 구축하는 것을 목표로 합니다. 특히 **Lombok 의존성을 최소화**하고 Java **Record**를 적극 활용하며, **도메인 모델 중심의 비즈니스 로직 설계**와 **OpenAPI/DBML 기반의 스펙 중심 개발**을 실천합니다.

## 2. 핵심 목표 (Goals)
- **도메인 중심 설계 (DDD)**: 비즈니스 로직을 서비스 레이어가 아닌 도메인 엔티티와 값 객체(VO)에 응집시킨다.
- **스펙 중심 개발 (SDD)**: API(OpenAPI), DB(DBML), 이벤트(Redis Stream) 스펙을 선정의하고 이에 맞춰 코드를 구현한다.
- **Java 17 표준 활용**: 불변 객체는 `record`로, 타입 추론은 `var`로 구현하여 가독성과 안정성을 높인다.
- **MSA 패턴 체득**: 분산 추적(Sleuth), 트랜잭션 아웃박스 패턴(예정), API 게이트웨이(BFF) 등을 실무 수준으로 구현한다.

---

## 3. 핵심 도메인 및 요구사항 (Core Domains & Requirements)

### 3.1. 인증 및 보안 (Auth Domain)
- **회원가입**: 이메일, 비밀번호를 입력받아 가입하며 비밀번호는 BCrypt로 해싱하여 저장한다.
- **로그인**: 가입된 정보를 바탕으로 Access Token(JWT)과 Refresh Token을 발급한다.
- **인가**: 모든 서비스 간 통신은 내부적으로 신뢰하되, 외부 요청은 BFF에서 JWT 검증을 거친다.

### 3.2. 회원 (Member Domain)
- **프로필 관리**: 회원은 자신의 이메일, 이름, 권한(Role) 정보를 가진다.
- **상태 조회**: 자신의 정보를 조회할 수 있는 `/members/me` API를 제공한다.
- **목록 조회**: 관리자용 회원 목록 조회를 위해 페이지네이션(`Pageable`)을 지원한다.

### 3.3. 상품 (Product Domain)
- **상품 관리**: 상품명, 가격, 재고(Stock), 카테고리 정보를 관리한다.
- **재고 제어**: 주문 시 재고가 감소하며, 재고 부족 시 주문이 불가하다. (DDD의 애그리거트 루트 내 비즈니스 로직)

### 3.4. 주문 (Order Domain)
- **주문 생성**: 회원은 하나 이상의 상품을 선택하여 주문할 수 있다.
- **상태 관리**: 주문은 `PENDING`, `COMPLETED`, `CANCELED` 등의 상태를 가진다.
- **이벤트 발행**: 주문 완료 시 Redis Streams를 통해 `OrderCreated` 이벤트를 발행하여 타 서비스(통계 등)와 연동한다.

### 3.5. 통계 및 조회 (Stats Domain)
- **복합 조회**: QueryDSL을 활용하여 월별, 일별, 상품별 판매 통계를 제공한다.
- **성능 최적화**: 통계 데이터 조회를 위한 전용 뷰(View) 또는 인덱스를 활용한다.

---

## 4. 기술 스펙 (Technical Specifications)

### 4.1. API 스펙 (Interface Spec)
- **RESTful API**: 모든 엔드포인트는 `docs/openapi.yaml`에 정의된 스펙을 100% 준수한다.
- **표준 응답**: 성공 시 데이터 객체, 실패 시 `ErrorResponse` record 형식을 전역적으로 사용한다.

### 4.2. 데이터 스펙 (Persistence Spec)
- **ERD**: `docs/erd.dbml`이 유일한 진실의 원천(Source of Truth)이다.
- **마이그레이션**: 모든 DB 변경은 `db-migration` 모듈의 Flyway를 통해서만 수행한다.

### 4.3. 메시징 스펙 (Event Spec)
- **Redis Streams**: 서비스 간 비동기 결합은 Redis Streams를 사용하며, 메시지 포맷은 `common` 모듈의 record로 정의한다.

---

## 5. 비기능 요구사항 (Non-Functional Requirements)
- **관측 가능성(Observability)**: 모든 요청은 `traceId`를 로그에 포함하며, Zipkin을 통해 시각화한다.
- **성능**: 쓰기 작업과 읽기 작업을 `@Transactional(readOnly=true)`로 명확히 분리하여 DB 부하를 최적화한다.
- **무중단성**: 로컬 k3s 환경에서의 배포 전략을 고려하여 설계한다.

---

## 6. 도메인 모델링 가이드 (DDD Context)
- **Entity**: 식별자(ID)를 가지며 생명주기가 있는 객체 (Member, Product, Order).
- **Value Object (VO)**: 속성값으로만 정의되는 불변 객체 (Address, Money 등). Java `record` 사용.
- **Aggregate**: 데이터 변경의 단위. `Order`와 `OrderItem`은 하나의 애그리거트로 묶이며, 외부에서는 `Order`를 통해서만 접근한다.
