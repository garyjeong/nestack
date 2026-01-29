# Nestack Mobile - TODO

## 현재 완료 상태

- TypeScript 파일 77개, 컴파일 에러 0개
- 화면 20개 구현 완료 (인증 5, 온보딩 2, 홈 1, 미션 4, 가계부 3, 마이페이지 5)
- 인프라 구축 완료 (API 클라이언트, 인증 스토어, React Query 훅, Tamagui 테마, React Navigation)

---

## 1단계: Android 빌드 및 실행

- [ ] Android 에뮬레이터 또는 실제 기기 설정
- [ ] `npx react-native run-android` 실행하여 빌드 확인
- [ ] 화면 렌더링 및 네비게이션 동작 검증
- [ ] Metro Bundler 정상 동작 확인

## 2단계: Firebase 설정 (푸시 알림)

- [ ] Firebase 프로젝트 생성
- [ ] `google-services.json` 파일 추가 (`android/app/`)
- [ ] `@react-native-firebase/app` 및 `@react-native-firebase/messaging` 설치
- [ ] FCM 디바이스 토큰 등록 API 연동 (`POST /users/me/device-token`)
- [ ] 포그라운드/백그라운드 알림 수신 처리
- [ ] 알림 탭 시 딥링크로 해당 화면 이동

## 3단계: 앱 아이콘 및 스플래시 화면

- [ ] 앱 아이콘 디자인 및 적용 (Android adaptive icon)
- [ ] 스플래시 화면 구현 (`react-native-bootsplash` 또는 네이티브 방식)
- [ ] 앱 이름 한글 설정 ("네스택")

## 4단계: 딥링킹 테스트

- [ ] `nestack://verify-email?token=xxx` → 이메일 인증 화면
- [ ] `nestack://reset-password?token=xxx` → 비밀번호 재설정 화면
- [ ] `nestack://invite/{code}` → 초대코드 화면
- [ ] `nestack://missions/{id}` → 미션 상세 화면
- [ ] Android App Links 설정 (Universal Links)
- [ ] `adb shell am start -d "nestack://missions/test-id"` 로 테스트

## 5단계: 네이티브 기능 통합

### SSE / 실시간 이벤트
- [ ] `react-native-sse` 설치 및 연동
- [ ] 이벤트 타입 처리: `mission_updated`, `mission_completed`, `transaction_synced`, `badge_earned`, `family_updated`
- [ ] 앱 포그라운드 복귀 시 재연결, 백그라운드 시 해제
- [ ] 백그라운드 상태에서 주요 이벤트 로컬 알림 표시

### 생체 인증
- [ ] `react-native-biometrics` 설치
- [ ] 설정 화면에서 활성화/비활성화 토글
- [ ] 앱 실행 시 생체 인증 프롬프트 (활성화된 경우)
- [ ] 생체 인증 실패 시 비밀번호 입력 fallback

### Google 로그인
- [ ] `@react-native-google-signin/google-signin` 설치 및 설정
- [ ] Google OAuth 클라이언트 ID 등록
- [ ] 로그인 화면 Google 버튼 연동

## 6단계: UI/UX 개선

### 애니메이션
- [ ] 화면 전환 애니메이션 (React Navigation)
- [ ] 미션 목록 → 상세 공유 요소 전환 (Shared Element Transition)
- [ ] 커스텀 Pull-to-Refresh 인디케이터
- [ ] 숫자 카운트업 애니메이션 (Reanimated)
- [ ] 리스트 스켈레톤 로딩

### 오프라인 지원
- [ ] React Query `onlineManager` + NetInfo 연동
- [ ] 오프라인 배너 표시
- [ ] MMKV 캐시로 마지막 조회 데이터 유지
- [ ] 오프라인 상태 뮤테이션 큐잉

## 7단계: Android 배포 준비

- [ ] ProGuard 규칙 설정
- [ ] 서명 키 생성 및 설정 (`release` keystore)
- [ ] 버전 관리 (`versionCode`, `versionName`)
- [ ] Release APK/AAB 빌드 테스트
- [ ] Google Play Console 등록 준비
