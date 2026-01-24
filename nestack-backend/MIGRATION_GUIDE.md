# Nestack Backend - TypeScript에서 Kotlin으로 마이그레이션 가이드

## 개요

이 문서는 NestJS/TypeScript로 구현된 기존 백엔드를 Kotlin/Spring Boot로 완전히 재구축한 마이그레이션에 대한 가이드를 제공합니다.

## 마이그레이션 전략

### Big Bang 방식
- 기존 `nestack-backend` 디렉토리의 모든 TypeScript 코드를 Kotlin 코드로 완전히 교체
- API 호환성 유지 (동일한 엔드포인트, 요청/응답 형식)
- 데이터베이스 스키마 유지 (PostgreSQL)

## 주요 변경 사항

### 기술 스택 변경

| 항목 | 이전 (TypeScript) | 현재 (Kotlin) |
|------|------------------|---------------|
| 언어 | TypeScript | Kotlin 1.9+ |
| 프레임워크 | NestJS | Spring Boot 3.2+ |
| ORM | TypeORM | Spring Data JPA (Hibernate) |
| 인증 | Passport JWT | Spring Security + JWT |
| 빌드 도구 | npm/yarn | Gradle (Kotlin DSL) |
| API 문서 | Swagger (NestJS) | SpringDoc OpenAPI |
| 테스트 | Jest | JUnit 5 + MockK |

### 아키텍처 변경

#### TypeScript (NestJS)
```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/
├── common/
│   ├── guards/
│   ├── decorators/
│   └── utils/
```

#### Kotlin (Spring Boot)
```
src/main/kotlin/com/nestack/
├── domain/
│   ├── auth/
│   │   ├── controller/
│   │   ├── service/
│   │   └── dto/
├── infrastructure/
│   ├── persistence/
│   ├── security/
│   └── external/
└── common/
    ├── constant/
    ├── dto/
    ├── enum/
    └── util/
```

### 주요 패턴 변경

1. **의존성 주입**
   - TypeScript: `@Injectable()` 데코레이터
   - Kotlin: `@Service`, `@Component` 어노테이션

2. **데이터베이스 접근**
   - TypeScript: TypeORM Repository
   - Kotlin: Spring Data JPA Repository

3. **인증/인가**
   - TypeScript: Passport Strategy + Guards
   - Kotlin: Spring Security Filter + AuthenticationProvider

4. **예외 처리**
   - TypeScript: Exception Filters
   - Kotlin: `@RestControllerAdvice` + GlobalExceptionHandler

5. **유효성 검증**
   - TypeScript: class-validator 데코레이터
   - Kotlin: Jakarta Validation 어노테이션

## API 호환성

모든 API 엔드포인트는 기존과 동일하게 유지됩니다:

- `/api/v1/auth/*` - 인증 관련
- `/api/v1/users/*` - 사용자 관리
- `/api/v1/family/*` - 가족 그룹
- `/api/v1/missions/*` - 미션 관리
- `/api/v1/finance/*` - 금융 연동
- `/api/v1/badges/*` - 뱃지 시스템
- `/api/v1/admin/*` - 어드민 관리

## 데이터베이스 마이그레이션

### 스키마 유지
- 기존 PostgreSQL 스키마를 그대로 사용
- Flyway를 통한 마이그레이션 관리
- 엔티티 매핑은 기존 테이블 구조와 일치

### 마이그레이션 실행
```bash
# Flyway는 애플리케이션 시작 시 자동 실행
./gradlew bootRun
```

## 환경 변수

기존 TypeScript 버전과 동일한 환경 변수를 사용합니다:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nestack_db
DB_USERNAME=nestack
DB_PASSWORD=nestack_password

# JWT
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# 기타 설정은 README.md 참조
```

## 배포

### Docker 사용
```bash
# 개발 환경
docker-compose up -d

# 프로덕션 환경
docker-compose -f docker-compose.prod.yml up -d
```

### 직접 실행
```bash
# 빌드
./gradlew clean build

# 실행
java -jar build/libs/nestack-backend-0.0.1.jar
```

## 테스트

```bash
# 모든 테스트 실행
./gradlew test

# 통합 테스트만 실행
./gradlew test --tests "*IntegrationTest"

# E2E 테스트 실행
./gradlew test --tests "*E2ETest"
```

## 롤백 계획

기존 TypeScript 버전으로 롤백이 필요한 경우:

1. Git을 통해 이전 커밋으로 복원
2. 또는 기존 `nestack-backend` 디렉토리의 백업 복원

## 성능 개선

Kotlin/Spring Boot로 마이그레이션하면서 기대되는 개선 사항:

- **타입 안정성**: Kotlin의 강력한 타입 시스템
- **성능**: JVM 최적화 및 Spring Boot의 성능
- **메모리 효율성**: JVM의 가비지 컬렉션 최적화
- **동시성**: Kotlin Coroutines 지원

## 문제 해결

### 빌드 오류
- JDK 17 이상이 설치되어 있는지 확인
- Gradle 버전 확인: `./gradlew --version`

### 데이터베이스 연결 오류
- PostgreSQL이 실행 중인지 확인
- 환경 변수가 올바르게 설정되었는지 확인

### 테스트 실패
- 테스트용 데이터베이스가 설정되어 있는지 확인
- `application-test.yml` 설정 확인

## 추가 리소스

- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [Kotlin 공식 문서](https://kotlinlang.org/docs/home.html)
- [Spring Data JPA 문서](https://spring.io/projects/spring-data-jpa)
