# syntax=docker/dockerfile:1
# ---------- Giai đoạn 1: build bản web của Expo ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# --legacy-peer-deps: một số gói React Native khai báo peer dependency hơi lệch phiên bản
RUN npm ci --legacy-peer-deps --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

COPY . .

# Địa chỉ API được "đóng cứng" vào bản web lúc build. Mặc định gọi cùng nguồn (/api/v1) và để nginx chuyển tiếp sang backend.
ARG EXPO_PUBLIC_API_URL=/api/v1
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL} \
    EXPO_NO_TELEMETRY=1 \
    CI=1
RUN npx expo export --platform web --output-dir /app/dist

# ---------- Giai đoạn 2: phục vụ bằng nginx ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
