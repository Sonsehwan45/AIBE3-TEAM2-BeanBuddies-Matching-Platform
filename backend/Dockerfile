# 최종 실행(Final) 스테이지
FROM eclipse-temurin:21-jre

WORKDIR /app

# 보안을 위한 사용자 설정
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# 젠킨스가 빌드한 JAR 파일을 컨텍스트에서 바로 복사
COPY build/libs/*-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]