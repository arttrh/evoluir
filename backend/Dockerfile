FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/prumo-backend-1.0.0.jar app.jar
ENV BIND_ADDRESS=0.0.0.0
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=60.0"
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
