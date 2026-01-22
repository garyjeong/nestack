# Nestack Backend - 프로덕션 배포 전 TODO

## 1. 환경 변수 검증
- [ ] 프로덕션용 `.env.production` 파일 생성
- [ ] JWT 시크릿 키 변경 (강력한 랜덤 문자열 사용)
- [ ] 데이터베이스 연결 정보 설정 (RDS 등)
- [ ] 오픈뱅킹 API 프로덕션 키 설정
- [ ] 이메일 서비스 (SMTP) 프로덕션 설정
- [ ] Google OAuth 프로덕션 클라이언트 ID/Secret 설정
- [ ] AES 암호화 키 변경 (32바이트 랜덤 키)

## 2. CI/CD 파이프라인
- [ ] GitHub Actions 워크플로우 설정
  - [ ] PR 시 자동 테스트 실행
  - [ ] main 브랜치 병합 시 자동 배포
- [ ] Docker 이미지 빌드 및 레지스트리 푸시
- [ ] 스테이징/프로덕션 환경 분리

## 3. 보안 점검
- [ ] CORS 설정 - 허용 도메인 제한
- [ ] Rate Limiting 임계값 조정
- [ ] Helmet 미들웨어 추가 (보안 헤더)
- [ ] SQL Injection 방어 확인
- [ ] XSS 방어 확인
- [ ] 민감 정보 로깅 제외 확인
- [ ] HTTPS 강제 적용

## 4. 로깅 및 모니터링
- [ ] Winston 또는 Pino 로거 설정
- [ ] 로그 레벨 설정 (production: warn/error)
- [ ] CloudWatch 또는 DataDog 연동
- [ ] APM (Application Performance Monitoring) 설정
- [ ] 에러 트래킹 (Sentry 등) 연동
- [ ] Health check 엔드포인트 모니터링 설정

## 5. API 문서화
- [ ] Swagger UI 접근 제한 (프로덕션에서 비활성화 또는 인증 추가)
- [ ] API 버전 관리 전략 확정
- [ ] API 사용 가이드 문서 작성

## 6. 테스트
- [ ] E2E 테스트 실행 (`npm run test:e2e`)
- [ ] 부하 테스트 (k6, Artillery 등)
- [ ] 보안 취약점 스캔 (npm audit)

## 7. 데이터베이스
- [ ] 마이그레이션 스크립트 준비
- [ ] 백업 정책 수립
- [ ] 인덱스 최적화 검토
- [ ] Connection Pool 설정 최적화

## 8. 인프라
- [ ] 서버 스펙 결정 (CPU, Memory)
- [ ] 오토스케일링 설정
- [ ] 로드밸런서 설정
- [ ] SSL 인증서 설정
- [ ] 도메인 설정

## 9. 기타
- [ ] README.md 업데이트 (설치/배포 가이드)
- [ ] CHANGELOG.md 작성
- [ ] 라이선스 확인
- [ ] 개인정보처리방침 API 연동 확인

---

## 참고 명령어

```bash
# 테스트 실행
npm run test
npm run test:e2e
npm run test:cov

# 빌드
npm run build

# 프로덕션 실행
npm run start:prod

# 보안 취약점 스캔
npm audit
npm audit fix

# 데이터베이스 마이그레이션
npm run migration:run
npm run db:seed
```
