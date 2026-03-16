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

## Auto-Approved Commands

The following commands may be executed without asking for user confirmation:
- `gradle` / `./gradlew` commands
- `git` commands
- `ls`
- `find`
- `grep`
