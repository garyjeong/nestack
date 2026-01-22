# Nestack Frontend - 남은 작업 목록

## Phase 7: SSE & 뱃지 (1주)

### SSE 실시간 동기화
- [ ] SSE 서비스 구현 (`src/features/events/sseService.ts`)
  - EventSource 연결 관리
  - `mission_updated` 이벤트 핸들링
  - `transaction_synced` 이벤트 핸들링
  - `badge_earned` 이벤트 핸들링
  - `family_data_updated` 이벤트 핸들링
- [ ] SSE 연결 상태 관리 (Zustand store)
- [ ] 실시간 알림 UI 컴포넌트

### 뱃지 기능
- [ ] 뱃지 타입 정의 (`src/features/badge/types`)
- [ ] 뱃지 API 구현 (`src/features/badge/api`)
  - GET /badges - 전체 뱃지 목록
  - GET /badges/me - 내 뱃지 목록
- [ ] 뱃지 훅 구현 (`src/features/badge/hooks`)
  - `useBadges` - 전체 뱃지 조회
  - `useMyBadges` - 획득한 뱃지 조회
- [ ] 뱃지 컴포넌트 구현 (`src/features/badge/components`)
  - `BadgeCard` - 뱃지 카드
  - `BadgeList` - 뱃지 목록
  - `BadgeShowcase` - 뱃지 쇼케이스 (홈 화면용)
- [ ] `BadgesPage` 업데이트 (`src/pages/mypage/BadgesPage.tsx`)
- [ ] 뱃지 획득 애니메이션 (Framer Motion)

---

## Phase 8: 마무리 (1주)

### 마이페이지 기능
- [ ] `MyPage` 업데이트 (`src/pages/mypage/MyPage.tsx`)
  - 프로필 정보 표시 (이름, 이메일, 프로필 이미지)
  - 획득 뱃지 쇼케이스
  - 가족 그룹 정보 표시
  - 설정 링크
- [ ] `ProfileEditPage` 기능 구현 (`src/pages/mypage/ProfileEditPage.tsx`)
  - 프로필 이미지 업로드
  - 이름 변경
  - 비밀번호 변경

### 설정 페이지
- [ ] `SettingsPage` 기능 구현 (`src/pages/mypage/SettingsPage.tsx`)
  - 알림 설정
  - 공유 설정 (가족 그룹)
  - 로그아웃
  - 회원 탈퇴

### 에러 처리
- [ ] Error Boundary 구현 (`src/shared/components/ErrorBoundary.tsx`)
- [ ] 404 페이지 (`src/pages/NotFoundPage.tsx`)
- [ ] API 에러 핸들링 개선

### 성능 최적화
- [ ] React.memo 적용 (필요한 컴포넌트)
- [ ] useMemo/useCallback 최적화
- [ ] 이미지 lazy loading
- [ ] 번들 사이즈 분석 및 최적화

### 반응형 최적화
- [ ] 태블릿 레이아웃 조정
- [ ] 데스크톱 레이아웃 (max-width 적용)

### 테스트
- [ ] Vitest 설정
- [ ] React Testing Library 설정
- [ ] 핵심 컴포넌트 단위 테스트
- [ ] 훅 테스트

---

## 추가 고려 사항

### 접근성 (A11y)
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 지원
- [ ] 색상 대비 확인

### PWA (선택)
- [ ] Service Worker 설정
- [ ] Manifest 설정
- [ ] 오프라인 지원

---

## 파일 구조 참고

```
src/
├── features/
│   ├── events/           # Phase 7 - SSE
│   │   ├── sseService.ts
│   │   └── hooks/
│   │       └── useSSE.ts
│   └── badge/            # Phase 7 - 뱃지
│       ├── api/
│       ├── hooks/
│       ├── types/
│       └── components/
└── pages/
    └── mypage/           # Phase 8 - 마이페이지
        ├── MyPage.tsx
        ├── ProfileEditPage.tsx
        ├── BadgesPage.tsx
        └── SettingsPage.tsx
```
