# =========================================
# 1. 빌드(Build) 스테이지
# =========================================
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /workspace

COPY gradlew ./
COPY gradle/ ./gradle/
COPY build.gradle.kts ./
COPY settings.gradle.kts ./

RUN ./gradlew dependencies

COPY src ./src

RUN ./gradlew build -x test

# =========================================
# 2. 최종 실행(Final) 스테이지
# =========================================
FROM eclipse-temurin:21-jre

WORKDIR /app

RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# ✅ '-SNAPSHOT.jar'로 끝나는 파일만 복사하도록 수정
COPY --from=builder /workspace/build/libs/*-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]