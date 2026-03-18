# ── 빌드 스테이지 ──────────────────────────────────────
FROM amazoncorretto:17-alpine AS builder
WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .

COPY db-migration/build.gradle db-migration/build.gradle
COPY db-migration/src db-migration/src

RUN ./gradlew :db-migration:bootJar -x test --no-daemon

# ── 실행 스테이지 ──────────────────────────────────────
FROM amazoncorretto:17-alpine
WORKDIR /app

COPY --from=builder /workspace/db-migration/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
