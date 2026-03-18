# ── 빌드 스테이지 ──────────────────────────────────────
FROM amazoncorretto:17-alpine AS builder
WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .

COPY common/build.gradle common/build.gradle
COPY common/src common/src

COPY bff/build.gradle bff/build.gradle
COPY bff/src bff/src

RUN ./gradlew :bff:bootJar -x test --no-daemon

# ── 실행 스테이지 ──────────────────────────────────────
FROM amazoncorretto:17-alpine
WORKDIR /app

COPY --from=builder /workspace/bff/build/libs/*.jar app.jar

EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar"]
