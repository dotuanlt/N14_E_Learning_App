# syntax=docker/dockerfile:1
# ---------- Giai đoạn 1: build file .jar bằng Maven ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Tải thư viện trước (được cache lại, lần build sau nhanh hơn khi chỉ sửa mã nguồn)
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q -DskipTests package && cp target/*.jar /build/app.jar

# ---------- Giai đoạn 2: chạy ứng dụng ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# fonts-dejavu-core: font tiếng Việt cho chứng chỉ / báo cáo PDF; curl: dùng cho healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl fontconfig fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --create-home --uid 10001 appuser \
    && mkdir -p /data/uploads && chown -R appuser /data /app

COPY --from=build /build/app.jar /app/app.jar
USER appuser

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError" \
    PORT=8080 \
    STORAGE_DIR=/data/uploads
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
