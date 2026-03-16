# ── 1단계: 빌드 ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Gradle Wrapper와 빌드 정의 파일만 먼저 복사해 의존성 캐시 레이어를 분리
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle .
COPY settings.gradle .

# 의존성 다운로드 (소스 변경 없이 캐시 재사용)
RUN ./gradlew dependencies --no-daemon -q

# 소스 복사 후 빌드 (테스트 제외)
COPY src/ src/
RUN ./gradlew bootJar --no-daemon -x test

# ── 2단계: 실행 이미지 ────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 빌드 결과물만 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 비루트 사용자로 실행
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
