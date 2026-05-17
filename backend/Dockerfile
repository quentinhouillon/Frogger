FROM gradle:8.12.1-jdk21-alpine AS build

WORKDIR /workspace/backend

COPY gradle ./gradle
COPY gradlew settings.gradle gradle.properties ./
COPY app ./app

RUN chmod +x ./gradlew && ./gradlew :app:installDist --no-daemon

FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /opt/frogger

COPY --from=build /workspace/backend/app/build/install/app ./

EXPOSE 1234

ENV PORT=1234

CMD ["/opt/frogger/bin/app"]