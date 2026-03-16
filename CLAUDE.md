# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Java 17 feature exploration project using Spring Boot 2.7.18. Goals include:
- Replacing Lombok with Java 17 records (`@Data`/`@Value` → `record`, constructors, builders)
- MapStruct integration for object mapping
- QueryDSL integration
- Modern Java 17 test patterns

## Commands

```bash
./gradlew build        # Build the project
./gradlew test         # Run all tests
./gradlew bootRun      # Run the Spring Boot app
./gradlew clean build  # Clean and rebuild
```

Run a single test class:
```bash
./gradlew test --tests "dev.danielk.startjava17.SomeTest"
```

## Architecture

- **Package root:** `dev.danielk.startjava17`
- **Entry point:** `StartJava17Application.java` — excludes `DataSourceAutoConfiguration` (no DB configured)
- **Build:** Gradle 8.2 with Java 17 toolchain
- **Annotation processors:** Lombok + MapStruct (with `lombok-mapstruct-binding` to ensure correct processing order)

## Git Branch Workflow

모든 작업은 아래 순서를 따른다:

1. `git fetch origin` — 작업 시작 전 항상 origin 최신 상태를 로컬에 반영
2. `git checkout -b feature/<작업명>` — 새 feature 브랜치 생성
3. 작업 완료 후 커밋
4. `git push -u origin feature/<작업명>` — feature 브랜치 push
5. `git checkout master && git merge --no-ff feature/<작업명>` — master에 머지 (fast-forward 금지)
6. `git push origin master` — master push
7. `git checkout master` — master에서 다음 작업 시작

## Auto-Approved Commands

The following commands may be executed without asking for user confirmation:
- `gradle` / `./gradlew` commands
- `git` commands
- `ls`
- `find`
- `grep`
