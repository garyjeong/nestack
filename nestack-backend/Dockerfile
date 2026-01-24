# Multi-stage build for Nestack Backend (Kotlin/Spring Boot)

# Stage 1: Build
FROM gradle:8.5-jdk17-alpine AS build

WORKDIR /app

# Copy Gradle files
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle/ ./gradle/

# Download dependencies (cached layer)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src/ ./src/

# Build application
RUN gradle clean build -x test --no-daemon

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S nestack && adduser -S nestack -G nestack

# Copy JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Change ownership
RUN chown -R nestack:nestack /app

# Switch to non-root user
USER nestack

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
