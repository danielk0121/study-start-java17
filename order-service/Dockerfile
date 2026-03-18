# ── 빌드 스테이지 ──────────────────────────────────────
FROM amazoncorretto:17-alpine AS builder
WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .

COPY common/build.gradle common/build.gradle
COPY common/src common/src

COPY order-service/build.gradle order-service/build.gradle
COPY order-service/src order-service/src

RUN ./gradlew :order-service:bootJar -x test --no-daemon

# ── 실행 스테이지 ──────────────────────────────────────
FROM amazoncorretto:17-alpine
WORKDIR /app

COPY --from=builder /workspace/order-service/build/libs/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
