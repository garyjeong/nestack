# Nestack Backend 배포 가이드

## 배포 전 체크리스트

### 1. 환경 변수 설정

프로덕션 환경 변수 파일 (`.env.production`) 생성:

```env
# Database (RDS 또는 관리형 PostgreSQL)
DB_HOST=your-rds-endpoint
DB_PORT=5432
DB_NAME=nestack_prod
DB_USERNAME=nestack_prod
DB_PASSWORD=strong-password-here

# JWT (강력한 랜덤 문자열 사용)
JWT_ACCESS_SECRET=generate-strong-random-string-min-32-chars
JWT_REFRESH_SECRET=generate-strong-random-string-min-32-chars
JWT_ACCESS_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

# Encryption (64자 hex 문자열)
ENCRYPTION_KEY=generate-64-character-hex-string

# Google OAuth (프로덕션 클라이언트)
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret

# Open Banking (프로덕션 API)
OPENBANKING_API_URL=https://openapi.openbanking.or.kr
OPENBANKING_CLIENT_ID=your-production-client-id
OPENBANKING_CLIENT_SECRET=your-production-client-secret
OPENBANKING_REDIRECT_URI=https://yourdomain.com/api/v1/finance/openbanking/callback

# Mail (프로덕션 SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# CORS (프로덕션 도메인만)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Environment
NODE_ENV=prod
PORT=3000
```

### 2. 보안 설정

- [ ] JWT 시크릿 키를 강력한 랜덤 문자열로 변경
- [ ] AES 암호화 키를 64자 hex 문자열로 생성
- [ ] 데이터베이스 비밀번호 강화
- [ ] CORS 설정에서 허용 도메인 제한
- [ ] HTTPS 강제 적용
- [ ] Swagger UI 비활성화 또는 인증 추가

### 3. 데이터베이스 준비

```bash
# 프로덕션 데이터베이스 생성
CREATE DATABASE nestack_prod;

# Flyway 마이그레이션은 애플리케이션 시작 시 자동 실행
```

### 4. Docker 배포

```bash
# 이미지 빌드
docker build -t nestack-backend:latest .

# 프로덕션 실행
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f backend

# 헬스 체크
curl http://localhost:3000/actuator/health
```

### 5. AWS 배포 (예시)

#### ECS/Fargate 사용 시

1. ECR에 이미지 푸시
```bash
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin your-account.dkr.ecr.ap-northeast-2.amazonaws.com
docker tag nestack-backend:latest your-account.dkr.ecr.ap-northeast-2.amazonaws.com/nestack-backend:latest
docker push your-account.dkr.ecr.ap-northeast-2.amazonaws.com/nestack-backend:latest
```

2. ECS Task Definition 생성
3. ECS Service 생성 및 실행

#### EC2 직접 배포 시

```bash
# 서버에 접속
ssh user@your-server

# 애플리케이션 디렉토리로 이동
cd /opt/nestack-backend

# JAR 파일 다운로드 또는 빌드
./gradlew clean build

# systemd 서비스로 실행
sudo systemctl start nestack-backend
sudo systemctl enable nestack-backend
```

### 6. 모니터링 설정

- [ ] CloudWatch 또는 DataDog 연동
- [ ] APM (Application Performance Monitoring) 설정
- [ ] 에러 트래킹 (Sentry) 연동
- [ ] 로그 집계 설정

### 7. 백업 정책

- [ ] 데이터베이스 자동 백업 설정 (RDS 스냅샷 등)
- [ ] 백업 보관 기간 설정
- [ ] 재해 복구 계획 수립

## 헬스 체크

애플리케이션 헬스 체크 엔드포인트:

```http
GET /actuator/health
```

응답:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    }
  }
}
```

## 로그 확인

```bash
# Docker 로그
docker-compose logs -f backend

# 애플리케이션 로그
tail -f logs/application.log
```

## 성능 튜닝

### JVM 옵션

```bash
java -jar \
  -Xms512m \
  -Xmx2g \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  app.jar
```

### 데이터베이스 연결 풀

`application-prod.yml`에서 조정:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
```

## 롤백 절차

1. 이전 버전의 Docker 이미지로 태그 변경
2. 또는 이전 JAR 파일로 교체
3. 서비스 재시작

```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```
