# 제안: 멀티 모듈 아키텍처 설계

> 기존 단일 Spring Boot 프로젝트(`study-start-java17`)를 Gradle 멀티 모듈 구조로 전환하는 설계 문서

---

## 1. 전환 조건

| 항목 | 결정 |
|---|---|
| Git 레포지토리 | 1개 유지 |
| Gradle 구성 | 멀티 프로젝트 |
| DB | 분리 없이 공유 |
| 실행 프로세스 | API 서버 3개 (member-service, order-service, auth-service) |
| 서비스 간 통신 | HTTP 호출 (FeignClient) |
| 로컬 라우팅 | Nginx (k8s Ingress와 동일한 구조) |

---

## 2. 최종 모듈 구조

```
study-start-java17/                    ← Git 레포 루트
├── settings.gradle                    ← 멀티 프로젝트 등록
├── build.gradle                       ← 루트 공통 설정
│
├── common/                            ← 공통 라이브러리 (실행 X)
│   └── build.gradle
├── db-migration/                      ← Flyway 전담 (실행 후 종료)
│   ├── build.gradle
│   └── Dockerfile
├── member-service/                    ← Member, Product (port 8080)
│   ├── build.gradle
│   └── Dockerfile
├── order-service/                     ← Order, Stats, Stream (port 8081)
│   ├── build.gradle
│   └── Dockerfile
├── auth-service/                      ← 회원 로그인/인증 전담 (port 8082)
│   ├── build.gradle
│   └── Dockerfile
├── bff/                               ← 응답 조합 전담 (port 8000)
│   ├── build.gradle
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf                     ← 로컬 라우팅 (k8s Ingress 역할)
├── docker-compose.yml                 ← 전체 실행
└── docker-compose-infra.yml           ← 인프라만 실행 (개발용)
```

---

## 3. 모듈별 역할

### common
- `ErrorResponse`, `GlobalExceptionHandler` 등 두 서비스 공통 코드
- Spring Boot 실행 불가 (라이브러리 모듈)
- 다른 모듈에서 `implementation project(':common')` 으로 참조

### db-migration
- 모든 Flyway SQL 마이그레이션 전담
- 실행 후 자동 종료 (`web-application-type: none`)
- member-service, order-service, auth-service 모두 `flyway.enabled: false`

```
SQL 이전 목록
─────────────────────────────────
V1__create_members.sql
V2__create_products.sql
V3__create_orders.sql
V4__create_order_items.sql
V5__stats_views.sql
V6__create_auth.sql
```

```sql
-- auth-service 전용 테이블
-- refresh token 저장 및 관리 담당
-- member_id는 members 테이블과 논리적 관계이나 FK 제약 없음 (서비스 간 경계 원칙)
CREATE TABLE refresh_tokens (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    member_id   BIGINT       NOT NULL,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  DATETIME     NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_refresh_tokens_member_id (member_id),
    INDEX idx_refresh_tokens_token (token)
);
```

### member-service (port 8080)
- Member, Product 도메인 담당
- 기존 코드 이전 대상: `member/`, `product/`, `config/`

### order-service (port 8081)
- Order, Stats, Stream 도메인 담당
- 기존 코드 이전 대상: `order/`, `stats/`, `stream/`
- FeignClient로 member-service 호출 (주문 생성 시 Member/Product 존재 검증)

### auth-service (port 8082)
- 회원 로그인 및 토큰 발급/검증 전담
- 클라이언트(프론트엔드)와의 인증만 처리
- MSA 서비스 간 내부 통신에는 인증을 적용하지 않음

### bff (port 8000)
- 프론트엔드 전용 응답 조합 담당
- 여러 서비스 응답을 하나로 합쳐서 단일 응답 반환
- 예시: 멤버 정보 + 주문 목록 한 번에 조회

---

## 4. 서비스 간 통신 구조

```
프론트
  │
  ▼
Nginx (80) ── /auth              ──→ auth-service   (8082)  ← 로그인/토큰 발급
           ── /members, /products ──→ member-service (8080)
           ── /orders, /stats    ──→ order-service  (8081)
           ── /bff               ──→ bff             (8000)

bff (8000)
  ├── FeignClient → member-service (8080)  ← 인증 없이 호출
  └── FeignClient → order-service  (8081)  ← 인증 없이 호출

order-service (8081)
  └── FeignClient → member-service (8080)  ← 인증 없이 호출 (주문 생성 시 검증)
```

### 인증 범위

> **핵심 원칙: 인증은 클라이언트와 서비스 사이에서만 수행한다. 서비스 간 내부 통신에는 인증을 적용하지 않는다.**

| 구간 | 인증 여부 | 방식 |
|---|---|---|
| 클라이언트 → Nginx → 각 서비스 | **O** | auth-service에서 발급한 JWT 토큰을 `Authorization` 헤더에 포함 |
| 서비스 → 서비스 (FeignClient) | **X** | 내부 네트워크(Docker network / k8s cluster network) 신뢰 전제 |

- 서비스 간 인증을 추가하면 FeignClient 호출마다 토큰 전파 또는 별도 서비스 계정 관리가 필요해 복잡도가 크게 증가한다
- 내부 네트워크가 외부에 노출되지 않는 구조(Docker bridge network, k8s ClusterIP)를 전제로 하므로 현 단계에서는 네트워크 신뢰로 충분하다

### 요청 흐름 예시: 멤버 + 주문 목록 한 번에 조회

```
프론트 → GET http://localhost/bff/members/{id}/with-orders
                    ↓
               bff (8000)
         ① MemberClient → GET /members/{id}    → member-service
         ② OrderClient  → GET /orders?memberId → order-service
         ③ 조합 후 단일 응답
                    ↓
프론트 ← { member: {...}, orders: [...] }
```

---

## 5. 로컬 ↔ 운영 환경 대응

| 역할 | 로컬 | 운영 |
|---|---|---|
| 라우팅 | Nginx (docker-compose) | AWS ALB / k8s Ingress |
| 인증 | auth-service (docker-compose) | auth-service (k8s) |
| DB | MySQL (docker-compose) | RDS 등 |
| 캐시 | Redis (docker-compose) | ElastiCache 등 |

### Nginx ↔ k8s Ingress 설정 비교

```nginx
# Nginx (로컬)
location /members { proxy_pass http://member-service; }
location /orders  { proxy_pass http://order-service; }
```

```yaml
# k8s Ingress (운영)
- path: /members
  backend:
    service:
      name: member-service
      port: 8080
- path: /orders
  backend:
    service:
      name: order-service
      port: 8081
```

구조가 동일하므로 로컬에서 Nginx로 개발하면 k8s Ingress 전환이 용이하다.

---

## 6. DB 공유 전략

DB를 공유하되 Flyway 관리는 `db-migration` 모듈이 단독으로 담당한다.

```
db-migration 실행 → flyway_schema_history 관리 → 마이그레이션 완료 → 종료
                              ↑
            member-service / order-service 는 Flyway 비활성화
```

두 서비스가 동시에 Flyway를 실행하면 `flyway_schema_history` 테이블 락 충돌이 발생하므로
반드시 하나의 모듈만 관리해야 한다.

---

## 7. 실행 순서

### 개발 시 (인프라만 Docker, 서비스는 로컬 실행)

```bash
# 1. 인프라 실행 (MySQL, Redis)
docker-compose -f docker-compose-infra.yml up -d

# 2. DB 마이그레이션
./gradlew :db-migration:bootRun

# 3. 서비스 실행
./gradlew :member-service:bootRun
./gradlew :order-service:bootRun
./gradlew :auth-service:bootRun
./gradlew :bff:bootRun
```

### 전체 Docker 실행

```bash
# JAR 빌드
./gradlew :member-service:bootJar
./gradlew :order-service:bootJar
./gradlew :auth-service:bootJar
./gradlew :bff:bootJar
./gradlew :db-migration:bootJar

# 전체 실행
docker-compose up --build
```

Docker Compose 실행 순서:
```
MySQL 기동 (healthcheck 통과)
      ↓
db-migration 실행 → 완료 → 종료
      ↓
member-service (8080) 기동
order-service  (8081) 기동
auth-service   (8082) 기동
bff            (8000) 기동
      ↓
Nginx (80) 기동
```

---

## 8. 멀티 모듈 전환 작업 순서

각 Step 완료 후 동작 확인하고 다음 Step으로 진행한다.

```
Step 1. Gradle 멀티 모듈 골격 생성 + 빌드 확인
        └── settings.gradle, 각 모듈 build.gradle 작성
        └── ./gradlew build 성공 확인

Step 2. db-migration SQL 이전 + 단독 실행 확인
        └── 기존 src/main/resources/db/migration/ → db-migration 모듈로 이동
        └── ./gradlew :db-migration:bootRun 성공 확인

Step 3. common 모듈 구성 + 컴파일 확인
        └── ErrorResponse, GlobalExceptionHandler 이전
        └── ./gradlew :common:build 성공 확인

Step 4. member-service 코드 이전 + 단독 실행 확인
        └── member/, product/, config/ 이전
        └── ./gradlew :member-service:bootRun 후 API 응답 확인

Step 5. order-service 코드 이전 + FeignClient 연동 확인
        └── order/, stats/, stream/ 이전
        └── FeignClient 추가 (MemberClient, ProductClient)
        └── 두 서비스 동시 실행 후 주문 생성 API 확인

Step 6. auth-service 모듈 구성 + 로그인 확인
        └── 로그인 API 구현 (토큰 발급/검증)
        └── ./gradlew :auth-service:bootRun 후 POST /auth/login 응답 확인

Step 7. bff 모듈 구성 + 응답 조합 확인
        └── MemberClient, OrderClient 추가
        └── GET /bff/members/{id}/with-orders 응답 확인

Step 8. 기존 src/ 삭제 + 최종 빌드 확인
        └── rm -rf src/
        └── ./gradlew build 성공 확인

Step 9. Docker Compose 전체 실행 확인
        └── Nginx 라우팅 동작 확인
```

---

## 9. 핵심 고려사항

### 데이터 정합성
서비스 간 DB 외래키 제약은 의도적으로 걸지 않는다.
`orders.member_id`처럼 컬럼 이름으로 관계를 유추할 수 있지만, DB 레벨의 FK 제약을 걸면 서비스 간 강한 결합이 생기고 향후 DB 분리가 불가능해진다.
따라서 정합성은 애플리케이션 레벨에서 처리한다.
주문 생성 시 order-service가 FeignClient로 member-service를 호출해 Member/Product 존재 여부를 검증한다.

### 장애 격리
member-service가 다운되더라도 기존 주문 조회/취소는 정상 동작해야 한다.
Member/Product 검증은 주문 생성 시에만 필요하므로, member-service 장애 시 주문 생성만 실패하도록 설계한다.

### 분산 트랜잭션
현재는 단순 HTTP 호출로 충분하다.
향후 결제, 재고 차감 등이 추가되면 Outbox 패턴 또는 Saga 패턴 도입을 검토한다.

---

## 10. 설정 파일 예시

### docker-compose.yml

<details>
<summary>전체 보기</summary>

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: start-java17-mysql
    environment:
      MYSQL_ROOT_PASSWORD: 1234
      MYSQL_DATABASE: start_java17
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7.0
    container_name: start-java17-redis
    volumes:
      - redis-data:/data

  db-migration:
    build: ./db-migration
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/start_java17
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: 1234

  member-service:
    build: ./member-service
    ports:
      - "8080:8080"
    depends_on:
      db-migration:
        condition: service_completed_successfully
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/start_java17
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: 1234
      SPRING_REDIS_HOST: redis

  order-service:
    build: ./order-service
    ports:
      - "8081:8081"
    depends_on:
      db-migration:
        condition: service_completed_successfully
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/start_java17
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: 1234
      SPRING_REDIS_HOST: redis
      MEMBER_SERVICE_URL: http://member-service:8080

  auth-service:
    build: ./auth-service
    ports:
      - "8082:8082"
    depends_on:
      db-migration:
        condition: service_completed_successfully
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/start_java17
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: 1234

  bff:
    build: ./bff
    ports:
      - "8000:8000"
    depends_on:
      - member-service
      - order-service
    environment:
      MEMBER_SERVICE_URL: http://member-service:8080
      ORDER_SERVICE_URL: http://order-service:8081

  nginx:
    image: nginx:1.25
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - member-service
      - order-service
      - auth-service
      - bff

volumes:
  mysql-data:
  redis-data:
```

</details>

---

### docker-compose-infra.yml

<details>
<summary>전체 보기</summary>

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: start-java17-mysql
    environment:
      MYSQL_ROOT_PASSWORD: 1234
      MYSQL_DATABASE: start_java17
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7.0
    container_name: start-java17-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  nginx:
    image: nginx:1.25
    container_name: start-java17-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    extra_hosts:
      - "host.docker.internal:host-gateway"  # 로컬에서 실행 중인 서비스로 프록시

volumes:
  mysql-data:
  redis-data:
```

</details>

---

## 11. Gradle 설정 예시

### settings.gradle

<details>
<summary>전체 보기</summary>

```groovy
rootProject.name = 'study-start-java17'
include 'common'
include 'db-migration'
include 'member-service'
include 'order-service'
include 'auth-service'
include 'bff'
```

</details>

### build.gradle (루트)

공통 플러그인, Java 툴체인, 공유 의존성을 모든 서브 모듈에 적용한다.

<details>
<summary>전체 보기</summary>

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '2.7.18' apply false
    id 'io.spring.dependency-management' version '1.0.15.RELEASE' apply false
}

group = 'dev.danielk'
version = '0.0.1-SNAPSHOT'

subprojects {
    apply plugin: 'java'
    apply plugin: 'io.spring.dependency-management'

    java {
        toolchain {
            languageVersion = JavaLanguageVersion.of(17)
        }
    }

    repositories {
        mavenCentral()
    }

    dependencyManagement {
        imports {
            mavenBom 'org.springframework.boot:spring-boot-dependencies:2.7.18'
        }
    }

    dependencies {
        compileOnly 'org.projectlombok:lombok'
        annotationProcessor 'org.projectlombok:lombok'
        testCompileOnly 'org.projectlombok:lombok'
        testAnnotationProcessor 'org.projectlombok:lombok'
        testImplementation 'org.springframework.boot:spring-boot-starter-test'
    }
}
```

</details>

### common/build.gradle

Spring Boot 플러그인 없이 라이브러리로만 빌드한다. `bootJar` 비활성화, `jar` 활성화가 핵심이다.

<details>
<summary>전체 보기</summary>

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
}

// 실행 가능한 JAR 생성 방지 — 다른 모듈이 라이브러리로 참조
bootJar.enabled = false
jar.enabled = true
```

</details>

### db-migration/build.gradle

Flyway 마이그레이션만 실행 후 종료한다. 웹 서버 없이 실행되도록 `db-migration/src/main/resources/application.yml`에서 아래와 같이 설정한다.

```yaml
spring:
  main:
    web-application-type: none  # 웹 서버 없이 실행 후 즉시 종료
  datasource:
    url: jdbc:mysql://localhost:3306/start_java17
    username: root
    password: 1234
  flyway:
    enabled: true
    locations: classpath:db/migration
```

<details>
<summary>전체 보기</summary>

```groovy
apply plugin: 'org.springframework.boot'

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter'
    implementation 'org.flywaydb:flyway-mysql'
    runtimeOnly 'com.mysql:mysql-connector-j'
}
```

</details>

### member-service/build.gradle

Member, Product 도메인을 담당하는 API 서버다. common 모듈을 라이브러리로 참조한다.

<details>
<summary>전체 보기</summary>

```groovy
apply plugin: 'org.springframework.boot'

dependencies {
    implementation project(':common')
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-cache'
    implementation 'com.github.ben-manes.caffeine:caffeine'
    implementation 'org.mapstruct:mapstruct:1.5.5.Final'
    implementation 'com.querydsl:querydsl-jpa:5.0.0'
    runtimeOnly 'com.mysql:mysql-connector-j'
    annotationProcessor 'org.projectlombok:lombok-mapstruct-binding:0.2.0'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'
    annotationProcessor 'com.querydsl:querydsl-apt:5.0.0:jpa'
    annotationProcessor 'javax.annotation:javax.annotation-api:1.3.2'
    annotationProcessor 'javax.persistence:javax.persistence-api:2.2'
}
```

</details>

---

## 12. Nginx 설정 예시

### nginx/nginx.conf

<details>
<summary>전체 보기</summary>

```nginx
upstream member-service {
    server member-service:8080;
}
upstream order-service {
    server order-service:8081;
}
upstream auth-service {
    server auth-service:8082;
}
upstream bff {
    server bff:8000;
}

server {
    listen 80;

    location /auth {
        proxy_pass http://auth-service;
    }
    location /members {
        proxy_pass http://member-service;
    }
    location /products {
        proxy_pass http://member-service;
    }
    location /orders {
        proxy_pass http://order-service;
    }
    location /stats {
        proxy_pass http://order-service;
    }
    location /bff {
        proxy_pass http://bff;
    }
}
```

</details>

---

## 13. URL 라우팅 예시

### 로컬 개발

```
프론트 → http://localhost/auth/**     → nginx → auth-service
프론트 → http://localhost/members/**  → nginx → member-service
프론트 → http://localhost/products/** → nginx → member-service
프론트 → http://localhost/orders/**   → nginx → order-service
프론트 → http://localhost/stats/**    → nginx → order-service
프론트 → http://localhost/bff/**      → nginx → bff
```

### 운영 (AWS ALB or k8s Ingress)

```
프론트 → https://api.example.com/auth/**     → auth-service
프론트 → https://api.example.com/members/**  → member-service
프론트 → https://api.example.com/products/** → member-service
프론트 → https://api.example.com/orders/**   → order-service
프론트 → https://api.example.com/stats/**    → order-service
프론트 → https://api.example.com/bff/**      → bff
```

로컬(Nginx)과 운영(ALB/k8s Ingress)의 경로 규칙이 동일하므로 환경 전환 시 URL 변경 없이 호스트만 교체하면 된다.
