# Changelog

All notable changes to the Nestack Backend project will be documented in this file.

## [0.0.1] - 2024-01-XX

### Added
- Kotlin/Spring Boot 기반 백엔드 재구축
- 사용자 인증 시스템 (이메일/비밀번호, Google OAuth)
- JWT 기반 인증 및 토큰 갱신
- 가족 그룹 관리 (Duo-Sync)
- 미션 시스템 (계층적 구조, 템플릿, 커스텀 미션)
- 오픈뱅킹 연동 (계좌/거래 동기화)
- 뱃지 시스템 (자동/수동 발급)
- 어드민 관리 시스템
- 실시간 동기화 (SSE) 준비
- 통합 테스트 및 E2E 테스트
- Docker 지원
- Swagger API 문서

### Changed
- TypeScript/NestJS에서 Kotlin/Spring Boot로 완전 마이그레이션
- TypeORM에서 Spring Data JPA로 변경
- Passport JWT에서 Spring Security로 변경

### Technical Details
- Kotlin 1.9.20
- Spring Boot 3.2.0
- PostgreSQL 16
- Gradle 8.5 (Kotlin DSL)
- JUnit 5 + MockK for testing
