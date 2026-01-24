# Nestack Backend - 프로젝트 요약

## 프로젝트 개요

Nestack은 커플을 위한 Life-Cycle Mission SaaS 플랫폼입니다. 이 백엔드는 Kotlin과 Spring Boot로 구현되었습니다.

## 마이그레이션 완료 상태

### ✅ 완료된 작업

1. **Phase 1: 프로젝트 초기 설정**
   - Spring Boot 3.2.0 프로젝트 생성
   - Gradle (Kotlin DSL) 빌드 설정
   - 공통 모듈 구현 (Exception, DTO, Util, Enum, Annotation)
   - Config 클래스 (Security, CORS, Swagger, Database)

2. **Phase 2: 인증 및 보안**
   - JWT 토큰 프로바이더
   - Spring Security 설정
   - 인증 필터 및 UserDetailsService
   - AuthService (회원가입, 로그인, Google OAuth, 토큰 갱신)
   - TokenService (Refresh Token, Email Verification, Password Reset)
   - MailService

3. **Phase 3: JPA 엔티티 및 Repository**
   - 모든 엔티티 변환 (User, FamilyGroup, Mission, BankAccount, Transaction, Badge, etc.)
   - Repository 인터페이스 구현
   - JPA Auditing 설정

4. **Phase 4: 핵심 기능 모듈**
   - User 모듈 (프로필 관리, 비밀번호 변경, 탈퇴)
   - Family 모듈 (가족 그룹 생성/가입, 초대 코드, 공유 설정)
   - Mission 모듈 (미션 CRUD, 템플릿, 카테고리, 진행 추적)
   - Finance 모듈 (OpenBanking 연동, 계좌/거래 관리)
   - Badge 모듈 (뱃지 조회, 자동/수동 발급)

5. **Phase 5: Admin 모듈**
   - Admin 인증
   - Dashboard 통계
   - User/Category/Template/Badge/Announcement 관리

6. **Phase 6: 테스트**
   - 단위 테스트
   - 통합 테스트
   - E2E 테스트
   - Repository 테스트

7. **Phase 7: 문서화 및 배포**
   - README.md 업데이트
   - API_GUIDE.md
   - DEPLOYMENT.md
   - MIGRATION_GUIDE.md
   - CHANGELOG.md
   - Docker 설정 (Dockerfile, docker-compose.yml)

## 기술 스택

- **언어**: Kotlin 1.9.20
- **프레임워크**: Spring Boot 3.2.0
- **ORM**: Spring Data JPA (Hibernate)
- **인증**: Spring Security + JWT (jjwt 0.12.3)
- **데이터베이스**: PostgreSQL 16
- **빌드**: Gradle 8.5 (Kotlin DSL)
- **API 문서**: SpringDoc OpenAPI 2.3.0
- **테스트**: JUnit 5 + MockK + Testcontainers

## 프로젝트 구조

```
nestack-backend/
├── src/main/kotlin/com/nestack/
│   ├── NestackApplication.kt
│   ├── config/              # 설정 클래스
│   ├── common/              # 공통 모듈
│   ├── domain/              # 비즈니스 로직
│   │   ├── auth/
│   │   ├── user/
│   │   ├── family/
│   │   ├── mission/
│   │   ├── finance/
│   │   ├── badge/
│   │   └── admin/
│   └── infrastructure/      # 기술적 구현
│       ├── persistence/
│       ├── security/
│       └── external/
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/
├── src/test/kotlin/         # 테스트 코드
├── build.gradle.kts
├── settings.gradle.kts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 주요 기능

### 인증 시스템
- 이메일/비밀번호 회원가입 및 로그인
- Google OAuth 2.0
- JWT 기반 인증 (Access Token + Refresh Token)
- 이메일 인증
- 비밀번호 재설정

### 가족 그룹 (Duo-Sync)
- 가족 그룹 생성
- 초대 코드 시스템 (12자리, 7일 유효)
- 가족 그룹 가입
- 데이터 공유 설정 (계좌별 공유 레벨)

### 미션 시스템
- 계층적 미션 구조 (Main → Monthly → Weekly → Daily)
- 미션 템플릿 시스템
- 생애주기 카테고리
- 진행률 추적
- 거래 연결

### 금융 연동
- Open Banking 연동
- 계좌 동기화
- 거래 내역 동기화
- 계좌별 공유 설정

### 뱃지 시스템
- 자동 발급 (미션 완료 시)
- 수동 발급 (어드민)
- 뱃지 타입: Lifecycle, Streak, Family

### 어드민 시스템
- 대시보드 통계
- 사용자 관리
- 카테고리/템플릿/뱃지 관리
- 공지사항 관리

## API 호환성

기존 TypeScript/NestJS 버전과 100% API 호환:
- 동일한 엔드포인트 경로
- 동일한 요청/응답 형식
- 동일한 에러 코드

## 다음 단계

1. **실제 데이터베이스 스키마 마이그레이션**
   - Flyway 마이그레이션 스크립트 작성
   - 기존 TypeScript 버전의 스키마 분석 및 변환

2. **SSE 실시간 동기화 구현**
   - Event 모듈 구현
   - 가족 그룹 실시간 동기화

3. **프로덕션 배포**
   - 환경 변수 설정
   - 모니터링 설정
   - 로깅 설정

4. **성능 최적화**
   - 쿼리 최적화
   - 캐싱 전략
   - 연결 풀 튜닝

## 참고 문서

- [README.md](./README.md) - 기본 가이드
- [API_GUIDE.md](./API_GUIDE.md) - API 사용 가이드
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - 마이그레이션 가이드
