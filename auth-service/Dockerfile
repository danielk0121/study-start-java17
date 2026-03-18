# ── 빌드 스테이지 ──────────────────────────────────────
FROM amazoncorretto:17-alpine AS builder
WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .

COPY common/build.gradle common/build.gradle
COPY common/src common/src

COPY auth-service/build.gradle auth-service/build.gradle
COPY auth-service/src auth-service/src

RUN ./gradlew :auth-service:bootJar -x test --no-daemon

# ── 실행 스테이지 ──────────────────────────────────────
FROM amazoncorretto:17-alpine
WORKDIR /app

COPY --from=builder /workspace/auth-service/build/libs/*.jar app.jar

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
