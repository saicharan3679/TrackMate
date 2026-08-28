# Stage 1: build the WAR file with Maven
FROM maven:3.9-eclipse-temurin-8 AS build
WORKDIR /app
COPY . .
RUN mvn -q clean package -DskipTests

# Stage 2: run it on Tomcat
FROM tomcat:9.0-jdk8-temurin
RUN rm -rf /usr/local/tomcat/webapps/*
# Deploy as ROOT.war so the app is served at the root URL (no /TrackMate/ prefix needed online)
COPY --from=build /app/target/*.war /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8080
CMD ["catalina.sh", "run"]
