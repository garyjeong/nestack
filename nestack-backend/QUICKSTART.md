# Nestack Backend - Quick Start Guide

## 빠른 시작

### 1. 사전 요구사항

- JDK 17 이상
- PostgreSQL 16 (또는 Docker)
- Gradle 8.0 이상 (또는 Gradle Wrapper)

### 2. 데이터베이스 설정

```bash
# Docker로 PostgreSQL 실행
docker-compose up -d postgres

# 또는 직접 PostgreSQL 설치 및 실행
createdb nestack_db
```

### 3. 환경 변수 설정

`.env` 파일 생성:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nestack_db
DB_USERNAME=nestack
DB_PASSWORD=nestack_password

JWT_ACCESS_SECRET=your-32-character-secret-key-here
JWT_REFRESH_SECRET=your-32-character-secret-key-here

ENCRYPTION_KEY=your-64-character-hex-key-here

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### 4. 애플리케이션 실행

```bash
# Gradle Wrapper가 없으면 생성
gradle wrapper

# 빌드 및 실행
./gradlew bootRun

# 또는 특정 프로파일로 실행
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### 5. 확인

- 애플리케이션: http://localhost:3000
- Swagger UI: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/actuator/health

## 주요 엔드포인트

### 인증
- `POST /api/v1/auth/signup` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/refresh` - 토큰 갱신

### 사용자
- `GET /api/v1/users/me` - 내 정보 조회
- `PATCH /api/v1/users/me` - 프로필 수정

### 가족 그룹
- `POST /api/v1/family/create` - 가족 그룹 생성
- `POST /api/v1/family/join` - 초대 코드로 가입

### 미션
- `GET /api/v1/missions/categories` - 카테고리 목록
- `POST /api/v1/missions` - 미션 생성
- `GET /api/v1/missions` - 미션 목록

## 테스트 실행

```bash
# 모든 테스트
./gradlew test

# 특정 테스트
./gradlew test --tests "com.nestack.domain.auth.AuthControllerIntegrationTest"
```

## 문제 해결

### 포트 충돌
```bash
# 다른 포트로 실행
./gradlew bootRun --args='--server.port=3001'
```

### 데이터베이스 연결 오류
```bash
# PostgreSQL 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs postgres
```

### 빌드 오류
```bash
# 클린 빌드
./gradlew clean build

# 의존성 새로고침
./gradlew --refresh-dependencies build
```
