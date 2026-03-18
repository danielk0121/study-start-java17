# ── 빌드 스테이지 ──────────────────────────────────────
FROM amazoncorretto:17-alpine AS builder
WORKDIR /workspace

# 루트 Gradle 파일 복사 (멀티 모듈 의존 해결에 필요)
COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .

# common 모듈 복사 (member-service가 참조)
COPY common/build.gradle common/build.gradle
COPY common/src common/src

# member-service 모듈 복사
COPY member-service/build.gradle member-service/build.gradle
COPY member-service/src member-service/src

# JAR 빌드 (테스트 제외)
RUN ./gradlew :member-service:bootJar -x test --no-daemon

# ── 실행 스테이지 ──────────────────────────────────────
FROM amazoncorretto:17-alpine
WORKDIR /app

COPY --from=builder /workspace/member-service/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
