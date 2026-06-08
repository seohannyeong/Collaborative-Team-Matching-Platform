# ─────────────── 1단계: 빌드 (Gradle로 jar 생성) ───────────────
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# 의존성 캐싱: 빌드 스크립트/래퍼 먼저 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

# 소스 복사 후 빌드 (테스트는 CI에서 수행하므로 이미지 빌드 시엔 제외)
COPY src src
RUN ./gradlew clean bootJar --no-daemon -x test

# ─────────────── 2단계: 실행 (가벼운 JRE 이미지) ───────────────
FROM eclipse-temurin:17-jre
WORKDIR /app

# 빌드 단계에서 만든 jar만 가져옴
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
