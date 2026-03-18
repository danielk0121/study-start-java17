# [PRD-BACKEND] 백엔드 기술 상세 명세 (Backend-Specific)

## 1. 개요
본 문서는 `PRD.md`에 정의된 유스케이스를 실현하기 위한 백엔드 마이크로서비스들의 아키텍처 및 구현 전략을 기술합니다.

## 2. 마이크로서비스 구성 (System Architecture)
- **auth-service**: JWT 발급, 로그인/회원가입, 권한 제어.
- **member-service**: 회원 프로필 조회, 배송지 CRUD 관리.
- **product-service**: 상품 정보 조회(브랜드 연동), 재고 차감 처리.
- **order-service**: 주문 생성/상태 변경, 주문 이력 관리.
- **bff (Backend For Frontend)**: 여러 서비스의 데이터를 조합하여 프론트엔드 최적화 응답 제공.
- **common**: 공통 모델(DTO, ErrorResponse) 및 유틸리티.

## 3. 기술 스택 및 구현 전략
- **프레임워크**: Java 17 + Spring Boot 2.7.18.
- **Lombok 지양**: DTO는 `record`를 사용하고, Entity 등 필수적인 경우에만 Lombok 최소 사용.
- **DB 연동**: Spring Data JPA + QueryDSL.
- **마이그레이션**: Flyway를 이용한 독립적 DB 관리.
- **비동기 통신**: Redis Streams를 이용한 서비스 간 이벤트 브로커 구성.

## 4. 데이터 영속화 및 마이그레이션 (DB Strategy)
- **독립성**: 서비스별로 독립된 스키마를 가지며, 물리적 또는 논리적으로 분리됨.
- **데이터 일관성**: 주문 생성 시 배송지 정보를 복사(SnapShotting)하여 배송지 변경 시에도 과거 주문 이력 무결성 보장.
- **샘플 데이터**: 모든 테이블은 테스트 편의를 위해 50건 이상의 샘플 데이터를 Flyway를 통해 로드함.

## 5. 주요 구현 상세
- **분산 추적**: Spring Cloud Sleuth + Zipkin을 통한 로그 추적.
- **트랜잭션**: 쓰기 작업과 읽기 작업(@Transactional(readOnly=true))을 명확히 분리.
- **응답 표준**: `ErrorResponse` record 형식을 통한 일관된 에러 응답 체계 유지.
- **스펙 준수**: `specs/openapi/` 명세를 기반으로 API 구현.
