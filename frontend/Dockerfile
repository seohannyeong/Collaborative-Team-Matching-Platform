# ─────────────── 1단계: 빌드 (React 정적 파일 생성) ───────────────
FROM node:20-alpine AS build
WORKDIR /app

# 의존성 캐싱: package 파일 먼저 복사 후 설치
COPY package.json package-lock.json ./
RUN npm install

# 소스 복사 후 프로덕션 빌드
COPY . .
RUN npm run build

# ─────────────── 2단계: 서빙 (nginx로 정적 파일 제공) ───────────────
FROM nginx:1.27-alpine
# SPA 라우팅 + /api 백엔드 프록시 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 빌드 결과물 복사
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
