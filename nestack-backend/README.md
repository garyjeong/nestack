# Nestack Backend (Kotlin/Spring Boot)

Nestack 백엔드 서버 - Kotlin과 Spring Boot로 구현된 Life-Cycle Mission SaaS for Couples 백엔드 API

## 기술 스택

- **언어**: Kotlin 1.9+
- **프레임워크**: Spring Boot 3.2+
- **ORM**: Spring Data JPA (Hibernate)
- **인증**: Spring Security + JWT
- **데이터베이스**: PostgreSQL 16
- **빌드 도구**: Gradle (Kotlin DSL)
- **API 문서**: SpringDoc OpenAPI (Swagger)

## 프로젝트 구조

```
src/main/kotlin/com/nestack/
├── NestackApplication.kt          # 메인 애플리케이션
├── config/                        # 설정 클래스
├── common/                        # 공통 모듈
│   ├── constant/                 # 상수
│   ├── dto/                      # 공통 DTO
│   ├── enum/                     # Enum 클래스
│   ├── exception/                # 예외 처리
│   ├── annotation/               # 커스텀 어노테이션
│   └── util/                     # 유틸리티
├── domain/                        # 도메인 모듈
│   ├── auth/                     # 인증
│   ├── user/                     # 사용자
│   ├── family/                   # 가족 그룹
│   ├── mission/                  # 미션
│   ├── finance/                  # 금융
│   ├── badge/                    # 뱃지
│   ├── event/                    # SSE 실시간 동기화
│   └── admin/                    # 어드민
└── infrastructure/                # 인프라 모듈
    ├── persistence/              # JPA 엔티티 및 Repository
    ├── security/                 # 보안 관련
    └── external/                 # 외부 API 연동
```

## 개발 환경 설정

### 필수 요구사항

- JDK 17 이상
- PostgreSQL 16
- Gradle 8.0 이상

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nestack_db
DB_USERNAME=nestack
DB_PASSWORD=nestack_password

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

# Encryption
ENCRYPTION_KEY=your-64-character-hex-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Open Banking
OPENBANKING_API_URL=https://testapi.openbanking.or.kr
OPENBANKING_CLIENT_ID=your-openbanking-client-id
OPENBANKING_CLIENT_SECRET=your-openbanking-client-secret
OPENBANKING_REDIRECT_URI=http://localhost:3000/api/v1/finance/openbanking/callback

# Mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Environment
NODE_ENV=dev
PORT=3000
```

### 실행 방법

```bash
# 의존성 설치
./gradlew build

# 개발 서버 실행
./gradlew bootRun

# 또는
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### 데이터베이스 마이그레이션

Flyway를 사용하여 데이터베이스 마이그레이션을 관리합니다:

```bash
# 마이그레이션 실행 (애플리케이션 시작 시 자동 실행)
./gradlew bootRun
```

## API 문서

개발 환경에서 Swagger UI를 통해 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs/v3/api-docs

## 테스트

```bash
# 모든 테스트 실행
./gradlew test

# 특정 테스트 클래스 실행
./gradlew test --tests "com.nestack.domain.auth.AuthControllerIntegrationTest"

# E2E 테스트 실행
./gradlew test --tests "*E2ETest"

# 테스트 커버리지 확인 (Jacoco 플러그인 추가 필요)
./gradlew test jacocoTestReport
```

### 테스트 구조

- **단위 테스트**: `*Test.kt` - 개별 클래스/함수 테스트
- **통합 테스트**: `*IntegrationTest.kt` - 여러 컴포넌트 통합 테스트
- **E2E 테스트**: `*E2ETest.kt` - 전체 플로우 테스트
- **Repository 테스트**: `*RepositoryTest.kt` - 데이터베이스 접근 테스트

## 빌드 및 배포

### 로컬 빌드

```bash
# 프로덕션 빌드
./gradlew clean build -x test

# JAR 파일 실행
java -jar build/libs/nestack-backend-0.0.1.jar

# 특정 프로파일로 실행
java -jar build/libs/nestack-backend-0.0.1.jar --spring.profiles.active=prod
```

### Docker를 사용한 배포

```bash
# 개발 환경 (docker-compose.yml)
docker-compose up -d

# 프로덕션 환경 (docker-compose.prod.yml)
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose logs -f backend

# 중지
docker-compose down
```

### Docker 이미지 빌드

```bash
# 이미지 빌드
docker build -t nestack-backend:latest .

# 이미지 실행
docker run -p 3000:3000 --env-file .env nestack-backend:latest
```

## 주요 기능

- ✅ 사용자 인증 (이메일/비밀번호, Google OAuth)
- ✅ 가족 그룹 관리 (Duo-Sync, 초대 코드)
- ✅ 미션 시스템 (계층적 구조, 템플릿, 진행 추적)
- ✅ 오픈뱅킹 연동 (계좌/거래 동기화)
- ✅ 뱃지 시스템 (자동/수동 발급)
- ✅ 어드민 관리 (대시보드, 사용자/콘텐츠 관리)
- 🔄 실시간 동기화 (SSE) - 준비 중

## API 문서

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs/v3/api-docs
- **API 가이드**: [API_GUIDE.md](./API_GUIDE.md)

## 배포

- **배포 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **마이그레이션 가이드**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **변경 이력**: [CHANGELOG.md](./CHANGELOG.md)

## 개발 가이드

### 코드 스타일

- Kotlin 코딩 컨벤션 준수
- 함수형 프로그래밍 패러다임 활용
- 불변성(Immutability) 우선

### 패키지 구조

- `domain`: 비즈니스 로직 (Controller, Service, DTO)
- `infrastructure`: 기술적 구현 (Persistence, Security, External)
- `common`: 공통 유틸리티 및 상수

### 테스트 전략

- 단위 테스트: 비즈니스 로직 검증
- 통합 테스트: API 엔드포인트 검증
- E2E 테스트: 전체 플로우 검증
- Repository 테스트: 데이터 접근 계층 검증

## 문제 해결

### 빌드 오류
- JDK 17 이상 확인: `java -version`
- Gradle 버전 확인: `./gradlew --version`

### 데이터베이스 연결 오류
- PostgreSQL 실행 확인: `docker-compose ps`
- 환경 변수 확인: `.env` 파일

### 테스트 실패
- 테스트 데이터베이스 설정 확인
- `application-test.yml` 설정 확인

## 라이선스

UNLICENSED
