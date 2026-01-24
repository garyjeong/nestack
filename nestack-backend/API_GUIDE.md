# Nestack Backend API 가이드

## 기본 정보

- **Base URL**: `http://localhost:3000/api/v1`
- **인증 방식**: JWT Bearer Token
- **응답 형식**: JSON

## 인증

### 회원가입
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "홍길동",
  "termsAgreed": true,
  "privacyAgreed": true
}
```

### 로그인
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "rememberMe": false
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": 3600
    }
  }
}
```

### 토큰 갱신
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

## 사용자 관리

### 내 정보 조회
```http
GET /users/me
Authorization: Bearer {accessToken}
```

### 프로필 수정
```http
PATCH /users/me
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "수정된 이름",
  "profileImageUrl": "https://example.com/image.jpg"
}
```

### 비밀번호 변경
```http
PATCH /users/me/password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

## 가족 그룹

### 가족 그룹 생성
```http
POST /family/create
Authorization: Bearer {accessToken}
```

### 초대 코드로 가입
```http
POST /family/join
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "inviteCode": "ABC123XYZ789"
}
```

### 가족 정보 조회
```http
GET /family
Authorization: Bearer {accessToken}
```

## 미션

### 미션 생성
```http
POST /missions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "categoryId": "uuid",
  "name": "결혼 자금 모으기",
  "description": "결혼식 비용 5천만원 목표",
  "goalAmount": 50000000,
  "dueDate": "2025-12-31"
}
```

### 미션 목록 조회
```http
GET /missions?status=IN_PROGRESS&level=MAIN
Authorization: Bearer {accessToken}
```

### 미션 상세 조회
```http
GET /missions/{missionId}
Authorization: Bearer {accessToken}
```

### 미션 상태 변경
```http
PATCH /missions/{missionId}/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

## 금융

### 오픈뱅킹 인증 시작
```http
GET /finance/openbanking/authorize
Authorization: Bearer {accessToken}
```

### 계좌 목록 조회
```http
GET /finance/accounts
Authorization: Bearer {accessToken}
```

### 거래 내역 조회
```http
GET /finance/transactions?accountId={accountId}&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {accessToken}
```

## 뱃지

### 전체 뱃지 목록
```http
GET /badges
Authorization: Bearer {accessToken}
```

### 내 뱃지 목록
```http
GET /badges/me
Authorization: Bearer {accessToken}
```

## 어드민

### 관리자 로그인
```http
POST /admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin1234!@"
}
```

### 대시보드 통계
```http
GET /admin/dashboard
Authorization: Bearer {adminToken}
```

## 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "AUTH_004",
    "message": "이메일 또는 비밀번호가 일치하지 않습니다.",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## 주요 에러 코드

- `AUTH_001`: 인증 토큰이 만료되었습니다.
- `AUTH_004`: 이메일 또는 비밀번호가 일치하지 않습니다.
- `USER_001`: 이미 사용 중인 이메일입니다.
- `FAMILY_002`: 유효하지 않은 초대 코드입니다.
- `MISSION_004`: 미션을 찾을 수 없습니다.
- `FINANCE_002`: 오픈뱅킹 토큰이 만료되었습니다.

전체 에러 코드 목록은 `ErrorCodes.kt` 참조
