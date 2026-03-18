# GEMINI.md

이 파일은 Gemini CLI가 이 저장소에서 작업을 수행할 때 준수해야 할 지침과 프로젝트 정보를 담고 있습니다.

## 1. 프로젝트 개요
Java 17과 Spring Boot 2.7.18을 기반으로 한 MSA(Microservices Architecture) 학습 프로젝트입니다.
- **핵심 목표**: Lombok을 지양하고 Java 17 `record` 도입, MapStruct/QueryDSL 활용, Redis Streams를 통한 이벤트 처리 및 Sleuth를 이용한 분산 추적 구현.
- **아키텍처**: Multi-module 프로젝트 (Auth, Member, Order, BFF, Common, DB-Migration).

## 2. 모듈 구성
- `auth-service`: JWT 인증 및 인가 처리.
- `member-service`: 회원 관리 및 QueryDSL 통계 API.
- `order-service`: 주문 처리 및 Redis Streams 이벤트 발행/소비.
- `bff`: Backend For Frontend, 서비스 간 조합 및 프론트엔드 대응.
- `common`: 공통 모델 및 유틸리티.
- `db-migration`: Flyway를 이용한 독립적인 DB 마이그레이션 모듈.

## 3. 주요 명령어
### 빌드 및 테스트
- **전체 빌드**: `./gradlew build`
- **컴파일 체크 (테스트 제외)**: `./gradlew build -x test`
- **전체 테스트 실행**: `./gradlew test`
- **특정 테스트 실행**: `./gradlew test --tests "패키지.클래스명"`

### 실행 (Docker Compose)
- **로컬 인프라 실행 (MySQL, Redis, Zipkin)**: `docker compose -f infra/docker-compose/docker-compose.yml up -d mysql redis zipkin`
- **전체 서비스 실행**: `docker compose -f infra/docker-compose/docker-compose.yml up -d`
- **서비스 종료**: `docker compose -f infra/docker-compose/docker-compose.yml down`

## 4. 개발 및 코드 작성 규칙
### 언어 및 스타일
- **언어 지침**: 코드 관례(변수명 등)를 제외한 모든 **응답, 주석, 커밋 메시지, 문서**는 **한글**을 사용한다.
- **주석 보존**: 코드를 수정할 때 기존의 **문서화된 주석(Javadoc 등)을 삭제하지 않고 최대한 보존**한다.
- **Java 17 컨벤션**:
    - 지역 변수는 `var` 키워드를 사용하여 타입 추론을 활용한다.
    - 데이터 전달 객체(DTO)는 반드시 `record`를 사용한다.
    - 중첩 함수 호출보다는 중간 변수를 사용하여 가독성을 높인다.
- **Lombok 사용 제한**:
    - DTO에서는 Lombok을 제거하고 `record`로 대체한다.
    - JPA 엔티티 등 `record`가 부적합한 경우에만 `@Getter`, `@RequiredArgsConstructor`, `@NoArgsConstructor(access = AccessLevel.PROTECTED)`를 선언적으로 사용한다.

### 작업 관리
- **작업 단위**: 반드시 1개 작업 단위로 진행하며, 작업 1개당 1개의 커밋을 생성한다.
- **검증**: 커밋 전에는 반드시 컴파일 에러 여부를 확인한다 (`./gradlew build -x test`).
- **상태 관리**: 작업 목록은 `[ ]`(미진행), `[x]`(완료), `[/]`(진행중) 등으로 관리한다.

## 5. 문서 및 데이터베이스 관리
- **ERD 관리**: `docs/erd.dbml` 파일을 수정하며, 수정 후에는 `bash tools/dbml/validate.sh docs/erd.dbml`로 반드시 검증한다.
- **마이그레이션**: DB 변경 사항은 `db-migration` 모듈의 Flyway 스크립트로 관리한다.
- **백업 문서**: `docs/backup/` 폴더 내의 문서는 이미 반영되었거나 제외된 제안서이므로 수정하지 않는다.

## 6. Git 워크플로우
1. `git fetch origin` (최신 상태 반영)
2. `git checkout -b feature/<작업명>` (새 브랜치 생성)
3. 작업 완료 후 커밋 (한글 메시지 사용)
4. `git push -u origin feature/<작업명>`
5. `git checkout master && git merge --no-ff feature/<작업명>` (병합)
6. `git push origin master`

## 7. 응답 가이드
- 질문 시 선택지는 A, B, C 대신 1, 2, 3 번호를 사용한다.
- "ㅇㅇㅇ 을 할까요?"와 같은 불필요한 재질문보다는 자율적으로 판단하여 완결성 있게 작업을 수행한다.
