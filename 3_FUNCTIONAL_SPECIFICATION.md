# Nestack 기능 정의서

## 1. 개요

### 1.1 문서 목적
이 문서는 Nestack 서비스의 기능을 기술적으로 정의합니다. 데이터 모델과 API 명세를 중심으로 B2C 사용자 기능과 Admin 기능을 모두 포함합니다.

### 1.2 문서 범위
- **B2C 기능**: 인증, 사용자, 가족 그룹, 미션, 금융, 뱃지
- **Admin 기능**: 사용자 관리, 미션 템플릿 관리, 가족 그룹 관리, 뱃지 관리, 통계, 시스템 설정

### 1.3 기술 스택
- **Backend**: Nest.js (TypeScript)
- **Database**: PostgreSQL
- **Authentication**: JWT + OAuth 2.0
- **Real-time**: Server-Sent Events (SSE)

---

## 2. 데이터 모델

### 2.1 ERD 개요

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │────<│   FamilyGroup   │>────│  InviteCode     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   BankAccount   │     │     Mission     │
└─────────────────┘     └─────────────────┘
        │                       │
        ▼                       │
┌─────────────────┐             │
│  Transaction    │─────────────┘
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ MissionTemplate │     │      Badge      │
└─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        └───────────────│   UserBadge     │
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│   AdminUser     │     │  Announcement   │
└─────────────────┘     └─────────────────┘
```

### 2.2 테이블 스키마

#### 2.2.1 User (사용자)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 사용자 고유 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 |
| password_hash | VARCHAR(255) | NULL | 비밀번호 해시 (소셜 로그인 시 NULL) |
| name | VARCHAR(100) | NOT NULL | 이름 |
| profile_image_url | VARCHAR(500) | NULL | 프로필 이미지 URL |
| provider | ENUM('local', 'google') | NOT NULL, DEFAULT 'local' | 인증 제공자 |
| provider_id | VARCHAR(255) | NULL | 소셜 로그인 제공자 ID |
| email_verified | BOOLEAN | DEFAULT false | 이메일 인증 여부 |
| email_verified_at | TIMESTAMP | NULL | 이메일 인증 일시 |
| status | ENUM('active', 'inactive', 'withdrawn') | DEFAULT 'active' | 계정 상태 |
| last_login_at | TIMESTAMP | NULL | 최근 로그인 일시 |
| family_group_id | UUID | FK, NULL | 가족 그룹 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |
| deleted_at | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |

**인덱스**:
- `idx_user_email` (email)
- `idx_user_family_group` (family_group_id)
- `idx_user_provider` (provider, provider_id)

---

#### 2.2.2 FamilyGroup (가족 그룹)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 가족 그룹 고유 ID |
| created_by | UUID | FK (User), NOT NULL | 그룹 생성자 ID |
| status | ENUM('active', 'dissolved') | DEFAULT 'active' | 그룹 상태 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

---

#### 2.2.3 InviteCode (초대 코드)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 초대 코드 고유 ID |
| code | VARCHAR(12) | UNIQUE, NOT NULL | 12자리 초대 코드 |
| family_group_id | UUID | FK (FamilyGroup), NOT NULL | 가족 그룹 ID |
| created_by | UUID | FK (User), NOT NULL | 코드 생성자 ID |
| used_by | UUID | FK (User), NULL | 코드 사용자 ID |
| status | ENUM('pending', 'used', 'expired', 'revoked') | DEFAULT 'pending' | 코드 상태 |
| expires_at | TIMESTAMP | NOT NULL | 만료일시 |
| used_at | TIMESTAMP | NULL | 사용일시 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**인덱스**:
- `idx_invite_code_code` (code)
- `idx_invite_code_family_group` (family_group_id)

---

#### 2.2.4 BankAccount (연동 계좌)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 계좌 고유 ID |
| user_id | UUID | FK (User), NOT NULL | 소유자 ID |
| bank_code | VARCHAR(10) | NOT NULL | 은행 코드 |
| bank_name | VARCHAR(50) | NOT NULL | 은행명 |
| account_number | VARCHAR(50) | NOT NULL | 계좌번호 (암호화) |
| account_number_masked | VARCHAR(50) | NOT NULL | 마스킹된 계좌번호 |
| account_alias | VARCHAR(100) | NULL | 계좌 별명 |
| account_type | VARCHAR(50) | NULL | 계좌 유형 |
| balance | DECIMAL(18,2) | DEFAULT 0 | 잔액 |
| fintech_use_num | VARCHAR(100) | NOT NULL | 오픈뱅킹 핀테크 이용번호 |
| share_status | ENUM('full', 'balance_only', 'private') | DEFAULT 'private' | 공유 설정 |
| is_hidden | BOOLEAN | DEFAULT false | 숨김 여부 |
| last_synced_at | TIMESTAMP | NULL | 마지막 동기화 일시 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스**:
- `idx_bank_account_user` (user_id)
- `idx_bank_account_fintech` (fintech_use_num)

---

#### 2.2.5 Transaction (거래 내역)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 거래 고유 ID |
| bank_account_id | UUID | FK (BankAccount), NOT NULL | 계좌 ID |
| transaction_id | VARCHAR(100) | NOT NULL | 오픈뱅킹 거래 ID |
| type | ENUM('deposit', 'withdrawal') | NOT NULL | 거래 유형 |
| amount | DECIMAL(18,2) | NOT NULL | 거래 금액 |
| balance_after | DECIMAL(18,2) | NOT NULL | 거래 후 잔액 |
| description | VARCHAR(255) | NULL | 거래 내용 |
| counterparty | VARCHAR(100) | NULL | 거래 상대방 |
| transaction_date | DATE | NOT NULL | 거래일 |
| transaction_time | TIME | NULL | 거래시간 |
| mission_id | UUID | FK (Mission), NULL | 연결된 미션 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**인덱스**:
- `idx_transaction_bank_account` (bank_account_id)
- `idx_transaction_mission` (mission_id)
- `idx_transaction_date` (transaction_date)

---

#### 2.2.6 LifeCycleCategory (생애주기 카테고리)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 카테고리 고유 ID |
| name | VARCHAR(50) | NOT NULL | 카테고리명 |
| display_order | INTEGER | DEFAULT 0 | 표시 순서 |
| status | ENUM('active', 'inactive') | DEFAULT 'active' | 상태 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

---

#### 2.2.7 MissionTemplate (미션 템플릿)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 템플릿 고유 ID |
| name | VARCHAR(100) | NOT NULL | 미션명 |
| description | TEXT | NULL | 설명 |
| category_id | UUID | FK (LifeCycleCategory), NOT NULL | 생애주기 카테고리 |
| goal_type | ENUM('amount', 'amount_count') | DEFAULT 'amount' | 목표 유형 |
| default_goal_amount | DECIMAL(18,2) | NULL | 기본 목표 금액 |
| status | ENUM('active', 'inactive') | DEFAULT 'active' | 상태 |
| usage_count | INTEGER | DEFAULT 0 | 사용 횟수 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스**:
- `idx_mission_template_category` (category_id)

---

#### 2.2.8 Mission (사용자 미션)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 미션 고유 ID |
| user_id | UUID | FK (User), NOT NULL | 생성자 ID |
| family_group_id | UUID | FK (FamilyGroup), NULL | 가족 그룹 ID |
| template_id | UUID | FK (MissionTemplate), NULL | 템플릿 ID (커스텀은 NULL) |
| category_id | UUID | FK (LifeCycleCategory), NOT NULL | 생애주기 카테고리 |
| parent_mission_id | UUID | FK (Mission), NULL | 상위 미션 ID |
| name | VARCHAR(100) | NOT NULL | 미션명 |
| description | TEXT | NULL | 설명 |
| goal_amount | DECIMAL(18,2) | NOT NULL | 목표 금액 |
| current_amount | DECIMAL(18,2) | DEFAULT 0 | 현재 금액 |
| mission_type | ENUM('template', 'custom') | NOT NULL | 미션 유형 |
| mission_level | ENUM('main', 'monthly', 'weekly', 'daily') | DEFAULT 'main' | 미션 레벨 |
| status | ENUM('pending', 'in_progress', 'completed', 'failed') | DEFAULT 'pending' | 상태 |
| start_date | DATE | NULL | 시작일 |
| due_date | DATE | NOT NULL | 목표 기한 |
| completed_at | TIMESTAMP | NULL | 완료일시 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**인덱스**:
- `idx_mission_user` (user_id)
- `idx_mission_family_group` (family_group_id)
- `idx_mission_parent` (parent_mission_id)
- `idx_mission_status` (status)

---

#### 2.2.9 MissionSharedAccount (미션 공유 계좌)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 ID |
| mission_id | UUID | FK (Mission), NOT NULL | 미션 ID |
| bank_account_id | UUID | FK (BankAccount), NOT NULL | 계좌 ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**인덱스**:
- `idx_mission_shared_account` (mission_id, bank_account_id)

---

#### 2.2.10 Badge (뱃지)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 뱃지 고유 ID |
| name | VARCHAR(100) | NOT NULL | 뱃지명 |
| description | TEXT | NULL | 설명 |
| image_url | VARCHAR(500) | NULL | 뱃지 이미지 URL |
| badge_type | ENUM('lifecycle', 'streak', 'family') | NOT NULL | 뱃지 유형 |
| condition_type | VARCHAR(50) | NOT NULL | 획득 조건 유형 |
| condition_value | JSONB | NOT NULL | 획득 조건 값 |
| status | ENUM('active', 'inactive') | DEFAULT 'active' | 상태 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**condition_value 예시**:
```json
// lifecycle 타입
{ "category_id": "uuid", "completed_count": 5 }

// streak 타입
{ "consecutive_months": 3 }

// family 타입
{ "family_completed_count": 3 }
```

---

#### 2.2.11 UserBadge (사용자 뱃지)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 ID |
| user_id | UUID | FK (User), NOT NULL | 사용자 ID |
| badge_id | UUID | FK (Badge), NOT NULL | 뱃지 ID |
| issue_type | ENUM('auto', 'manual') | DEFAULT 'auto' | 발급 방식 |
| issued_at | TIMESTAMP | DEFAULT NOW() | 발급일시 |
| issued_by | UUID | FK (AdminUser), NULL | 발급자 (수동 발급 시) |

**인덱스**:
- `idx_user_badge` (user_id, badge_id)

---

#### 2.2.12 OpenBankingToken (오픈뱅킹 토큰)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 ID |
| user_id | UUID | FK (User), NOT NULL | 사용자 ID |
| access_token | TEXT | NOT NULL | 액세스 토큰 (암호화) |
| refresh_token | TEXT | NOT NULL | 리프레시 토큰 (암호화) |
| token_type | VARCHAR(50) | NOT NULL | 토큰 유형 |
| scope | VARCHAR(255) | NOT NULL | 권한 범위 |
| expires_at | TIMESTAMP | NOT NULL | 만료일시 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

---

#### 2.2.13 AdminUser (관리자)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 관리자 고유 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 |
| password_hash | VARCHAR(255) | NOT NULL | 비밀번호 해시 |
| name | VARCHAR(100) | NOT NULL | 이름 |
| role | ENUM('super_admin', 'admin') | DEFAULT 'admin' | 권한 |
| status | ENUM('active', 'inactive') | DEFAULT 'active' | 상태 |
| last_login_at | TIMESTAMP | NULL | 최근 로그인 일시 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

---

#### 2.2.14 Announcement (공지사항)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 공지 고유 ID |
| title | VARCHAR(200) | NOT NULL | 제목 |
| content | TEXT | NOT NULL | 내용 |
| display_type | ENUM('popup', 'banner') | NOT NULL | 노출 형태 |
| start_date | TIMESTAMP | NOT NULL | 노출 시작일 |
| end_date | TIMESTAMP | NOT NULL | 노출 종료일 |
| status | ENUM('active', 'inactive') | DEFAULT 'active' | 상태 |
| created_by | UUID | FK (AdminUser), NOT NULL | 작성자 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

---

#### 2.2.15 SystemSetting (시스템 설정)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 설정 고유 ID |
| key | VARCHAR(100) | UNIQUE, NOT NULL | 설정 키 |
| value | JSONB | NOT NULL | 설정 값 |
| description | TEXT | NULL | 설명 |
| updated_by | UUID | FK (AdminUser), NULL | 수정자 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**주요 설정 키**:
- `invite_code_expiry_days`: 초대 코드 유효 기간 (기본: 7)
- `invite_code_length`: 초대 코드 길이 (기본: 12)
- `max_family_members`: 가족 그룹 최대 인원 (기본: 2)
- `default_share_status`: 기본 공유 설정 (기본: 'private')

---

#### 2.2.16 RefreshToken (리프레시 토큰)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 토큰 고유 ID |
| user_id | UUID | FK (User), NOT NULL | 사용자 ID |
| token | VARCHAR(500) | UNIQUE, NOT NULL | 리프레시 토큰 |
| device_info | VARCHAR(255) | NULL | 기기 정보 |
| expires_at | TIMESTAMP | NOT NULL | 만료일시 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

---

#### 2.2.17 EmailVerificationToken (이메일 인증 토큰)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 토큰 고유 ID |
| user_id | UUID | FK (User), NOT NULL | 사용자 ID |
| token | VARCHAR(255) | UNIQUE, NOT NULL | 인증 토큰 |
| type | ENUM('email_verify', 'password_reset') | NOT NULL | 토큰 유형 |
| expires_at | TIMESTAMP | NOT NULL | 만료일시 |
| used_at | TIMESTAMP | NULL | 사용일시 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

---

## 3. 공통 규격

### 3.1 API 응답 형식

#### 3.1.1 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-13T14:30:00Z"
  }
}
```

#### 3.1.2 목록 응답 (페이지네이션)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "timestamp": "2024-01-13T14:30:00Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### 3.1.3 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "인증 토큰이 만료되었습니다.",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-13T14:30:00Z"
  }
}
```

### 3.2 에러 코드 체계

#### 3.2.1 인증 에러 (AUTH_XXX)
| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| AUTH_001 | 401 | 인증 토큰이 만료되었습니다 |
| AUTH_002 | 401 | 유효하지 않은 인증 토큰입니다 |
| AUTH_003 | 401 | 인증 토큰이 필요합니다 |
| AUTH_004 | 401 | 이메일 또는 비밀번호가 일치하지 않습니다 |
| AUTH_005 | 401 | 이메일 인증이 필요합니다 |
| AUTH_006 | 403 | 비활성화된 계정입니다 |
| AUTH_007 | 403 | 탈퇴한 계정입니다 |

#### 3.2.2 사용자 에러 (USER_XXX)
| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| USER_001 | 400 | 이미 사용 중인 이메일입니다 |
| USER_002 | 400 | 비밀번호 규칙에 맞지 않습니다 |
| USER_003 | 404 | 사용자를 찾을 수 없습니다 |
| USER_004 | 400 | 현재 비밀번호가 일치하지 않습니다 |
| USER_005 | 400 | 인증 토큰이 만료되었습니다 |

#### 3.2.3 가족 그룹 에러 (FAMILY_XXX)
| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| FAMILY_001 | 400 | 이미 가족 그룹에 속해 있습니다 |
| FAMILY_002 | 400 | 유효하지 않은 초대 코드입니다 |
| FAMILY_003 | 400 | 만료된 초대 코드입니다 |
| FAMILY_004 | 400 | 이미 사용된 초대 코드입니다 |
| FAMILY_005 | 400 | 가족 그룹 최대 인원을 초과했습니다 |
| FAMILY_006 | 404 | 가족 그룹을 찾을 수 없습니다 |
| FAMILY_007 | 403 | 가족 그룹에 대한 권한이 없습니다 |

#### 3.2.4 미션 에러 (MISSION_XXX)
| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| MISSION_001 | 404 | 미션을 찾을 수 없습니다 |
| MISSION_002 | 400 | 완료된 미션은 수정할 수 없습니다 |
| MISSION_003 | 400 | 미션 목표 금액은 0보다 커야 합니다 |
| MISSION_004 | 400 | 미션 기한이 현재 날짜보다 이전입니다 |
| MISSION_005 | 403 | 미션에 대한 권한이 없습니다 |
| MISSION_006 | 404 | 미션 템플릿을 찾을 수 없습니다 |

#### 3.2.5 금융 에러 (FINANCE_XXX)
| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| FINANCE_001 | 400 | 오픈뱅킹 연동에 실패했습니다 |
| FINANCE_002 | 400 | 오픈뱅킹 토큰이 만료되었습니다 |
| FINANCE_003 | 404 | 계좌를 찾을 수 없습니다 |
| FINANCE_004 | 403 | 계좌에 대한 권한이 없습니다 |
| FINANCE_005 | 400 | 계좌 동기화에 실패했습니다 |
| FINANCE_006 | 404 | 거래 내역을 찾을 수 없습니다 |

#### 3.2.6 뱃지 에러 (BADGE_XXX)
| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| BADGE_001 | 404 | 뱃지를 찾을 수 없습니다 |
| BADGE_002 | 400 | 이미 획득한 뱃지입니다 |
| BADGE_003 | 403 | 뱃지에 대한 권한이 없습니다 |

#### 3.2.7 공통 에러 (COMMON_XXX)
| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| COMMON_001 | 400 | 잘못된 요청입니다 |
| COMMON_002 | 400 | 필수 파라미터가 누락되었습니다 |
| COMMON_003 | 500 | 서버 내부 오류가 발생했습니다 |
| COMMON_004 | 429 | 요청이 너무 많습니다 |

#### 3.2.8 어드민 에러 (ADMIN_XXX)

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| ADMIN_001 | 403 | 어드민 권한이 필요합니다 |
| ADMIN_002 | 403 | 슈퍼 어드민 권한이 필요합니다 |
| ADMIN_003 | 404 | 어드민 계정을 찾을 수 없습니다 |
| ADMIN_004 | 400 | 이미 존재하는 어드민 이메일입니다 |
| ADMIN_005 | 400 | 자기 자신의 계정은 삭제할 수 없습니다 |
| ADMIN_006 | 400 | 마지막 슈퍼 어드민은 삭제할 수 없습니다 |
| ADMIN_007 | 400 | 유효하지 않은 어드민 역할입니다 |

### 3.3 인증 헤더
```
Authorization: Bearer {access_token}
```

### 3.4 페이지네이션 파라미터
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | integer | 1 | 페이지 번호 |
| limit | integer | 20 | 페이지당 항목 수 (최대 100) |
| sort | string | created_at | 정렬 기준 필드 |
| order | string | desc | 정렬 방향 (asc/desc) |

---

## 4. B2C API 명세

### 4.1 인증 API

#### 4.1.1 회원가입
**POST** `/api/v1/auth/signup`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "홍길동",
  "termsAgreed": true,
  "privacyAgreed": true
}
```

**Validation**:
- email: 이메일 형식, 필수
- password: 8자 이상, 영문/숫자/특수문자 조합, 필수
- name: 1-100자, 필수
- termsAgreed: true 필수
- privacyAgreed: true 필수

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "emailVerified": false,
      "createdAt": "2024-01-13T14:30:00Z"
    },
    "message": "인증 메일이 발송되었습니다."
  }
}
```

---

#### 4.1.2 이메일 인증 확인
**GET** `/api/v1/auth/verify-email?token={token}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "이메일 인증이 완료되었습니다."
  }
}
```

---

#### 4.1.3 이메일 인증 재발송
**POST** `/api/v1/auth/resend-verification`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "인증 메일이 재발송되었습니다."
  }
}
```

---

#### 4.1.4 로그인
**POST** `/api/v1/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "rememberMe": true
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "profileImageUrl": null,
      "emailVerified": true,
      "familyGroupId": null
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

---

#### 4.1.5 Google 로그인
**POST** `/api/v1/auth/google`

**Request Body**:
```json
{
  "idToken": "google_id_token"
}
```

**Response** (200): 로그인 응답과 동일

---

#### 4.1.6 토큰 갱신
**POST** `/api/v1/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

---

#### 4.1.7 로그아웃
**POST** `/api/v1/auth/logout`

**Headers**: Authorization 필수

**Request Body** (선택):
```json
{
  "allDevices": false
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "로그아웃되었습니다."
  }
}
```

---

#### 4.1.8 비밀번호 찾기 (재설정 메일 발송)
**POST** `/api/v1/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "비밀번호 재설정 메일이 발송되었습니다."
  }
}
```

---

#### 4.1.9 비밀번호 재설정
**POST** `/api/v1/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset_token",
  "newPassword": "NewPassword123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "비밀번호가 재설정되었습니다."
  }
}
```

---

### 4.2 사용자 API

#### 4.2.1 내 정보 조회
**GET** `/api/v1/users/me`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "profileImageUrl": "https://...",
    "provider": "local",
    "emailVerified": true,
    "status": "active",
    "familyGroup": {
      "id": "uuid",
      "partner": {
        "id": "uuid",
        "name": "김철수",
        "profileImageUrl": null
      },
      "createdAt": "2024-01-05T10:00:00Z"
    },
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

---

#### 4.2.2 내 정보 수정
**PATCH** `/api/v1/users/me`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "name": "홍길순",
  "profileImageUrl": "https://..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길순",
    "profileImageUrl": "https://...",
    "updatedAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 4.2.3 비밀번호 변경
**POST** `/api/v1/users/me/change-password`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "비밀번호가 변경되었습니다."
  }
}
```

---

#### 4.2.4 회원 탈퇴
**DELETE** `/api/v1/users/me`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "password": "Password123!",
  "confirmed": true
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "회원 탈퇴가 완료되었습니다."
  }
}
```

---

### 4.3 가족 그룹 API

#### 4.3.1 초대 코드 생성
**POST** `/api/v1/family/invite-code`

**Headers**: Authorization 필수

**Response** (201):
```json
{
  "success": true,
  "data": {
    "inviteCode": "ABC123XYZ456",
    "familyGroupId": "uuid",
    "expiresAt": "2024-01-20T14:30:00Z",
    "createdAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 4.3.2 초대 코드 재발급
**POST** `/api/v1/family/invite-code/regenerate`

**Headers**: Authorization 필수

**Response** (201): 초대 코드 생성 응답과 동일

---

#### 4.3.3 초대 코드 확인
**GET** `/api/v1/family/invite-code/{code}/validate`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "valid": true,
    "inviter": {
      "name": "홍길동"
    },
    "expiresAt": "2024-01-20T14:30:00Z"
  }
}
```

---

#### 4.3.4 가족 그룹 연결 (초대 코드 사용)
**POST** `/api/v1/family/join`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "inviteCode": "ABC123XYZ456"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "familyGroup": {
      "id": "uuid",
      "members": [
        {
          "id": "uuid",
          "name": "홍길동",
          "email": "hong@example.com"
        },
        {
          "id": "uuid",
          "name": "김철수",
          "email": "kim@example.com"
        }
      ],
      "createdAt": "2024-01-13T14:30:00Z"
    },
    "message": "가족 그룹에 연결되었습니다."
  }
}
```

---

#### 4.3.5 가족 그룹 정보 조회
**GET** `/api/v1/family`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "members": [
      {
        "id": "uuid",
        "name": "홍길동",
        "email": "hong@example.com",
        "profileImageUrl": null,
        "isMe": true
      },
      {
        "id": "uuid",
        "name": "김철수",
        "email": "kim@example.com",
        "profileImageUrl": null,
        "isMe": false
      }
    ],
    "sharedAccounts": [
      {
        "id": "uuid",
        "bankName": "신한은행",
        "accountNumberMasked": "***-***-1234",
        "shareStatus": "full",
        "ownerId": "uuid",
        "ownerName": "홍길동"
      }
    ],
    "createdAt": "2024-01-05T10:00:00Z"
  }
}
```

---

#### 4.3.6 데이터 공유 설정 조회
**GET** `/api/v1/family/share-settings`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "uuid",
        "bankName": "신한은행",
        "accountNumberMasked": "***-***-1234",
        "balance": 5000000,
        "shareStatus": "full"
      },
      {
        "id": "uuid",
        "bankName": "국민은행",
        "accountNumberMasked": "***-***-5678",
        "balance": 3000000,
        "shareStatus": "private"
      }
    ]
  }
}
```

---

#### 4.3.7 데이터 공유 설정 변경
**PATCH** `/api/v1/family/share-settings`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "accounts": [
    {
      "accountId": "uuid",
      "shareStatus": "balance_only"
    },
    {
      "accountId": "uuid",
      "shareStatus": "full"
    }
  ]
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "공유 설정이 변경되었습니다.",
    "updatedAccounts": [...]
  }
}
```

---

#### 4.3.8 가족 그룹 탈퇴
**DELETE** `/api/v1/family/leave`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "missionAction": "keep_as_personal"
}
```

**missionAction 옵션**:
- `keep_as_personal`: 개인 미션으로 유지
- `delete`: 미션 삭제

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "가족 그룹에서 탈퇴했습니다."
  }
}
```

---

### 4.4 미션 API

#### 4.4.1 미션 템플릿 목록 조회
**GET** `/api/v1/missions/templates`

**Query Parameters**:
- categoryId (선택): 카테고리 필터

**Response** (200):
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "결혼 준비",
        "templates": [
          {
            "id": "uuid",
            "name": "예식 비용 모으기",
            "description": "예식장, 식대, 사회자 등 예식 관련 비용",
            "goalType": "amount",
            "defaultGoalAmount": 5000000
          },
          {
            "id": "uuid",
            "name": "스드메 비용 모으기",
            "description": "스튜디오, 드레스, 메이크업 비용",
            "goalType": "amount",
            "defaultGoalAmount": 3000000
          }
        ]
      },
      {
        "id": "uuid",
        "name": "주택 마련",
        "templates": [...]
      }
    ]
  }
}
```

---

#### 4.4.2 미션 생성 (템플릿 기반)
**POST** `/api/v1/missions/from-template`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "templateId": "uuid",
  "goalAmount": 5000000,
  "dueDate": "2024-06-30",
  "description": "6월 결혼식 예식 비용",
  "sharedAccountIds": ["uuid1", "uuid2"],
  "shareAgreed": true
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "예식 비용 모으기",
    "description": "6월 결혼식 예식 비용",
    "categoryId": "uuid",
    "categoryName": "결혼 준비",
    "missionType": "template",
    "missionLevel": "main",
    "goalAmount": 5000000,
    "currentAmount": 0,
    "progressRate": 0,
    "status": "in_progress",
    "dueDate": "2024-06-30",
    "daysRemaining": 168,
    "createdAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 4.4.3 미션 생성 (커스텀)
**POST** `/api/v1/missions`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "name": "가전제품 구매",
  "categoryId": "uuid",
  "goalAmount": 2000000,
  "dueDate": "2024-03-31",
  "description": "냉장고, 세탁기 구매"
}
```

**Response** (201): 미션 생성 응답과 동일

---

#### 4.4.4 하위 미션 생성
**POST** `/api/v1/missions/{missionId}/sub-missions`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "name": "1월 저축 목표",
  "missionLevel": "monthly",
  "goalAmount": 500000,
  "dueDate": "2024-01-31"
}
```

**Response** (201): 미션 생성 응답과 동일 (parentMissionId 포함)

---

#### 4.4.5 미션 목록 조회
**GET** `/api/v1/missions`

**Headers**: Authorization 필수

**Query Parameters**:
- status (선택): pending, in_progress, completed, failed
- categoryId (선택): 카테고리 필터
- level (선택): main, monthly, weekly, daily
- page, limit, sort, order

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "예식 비용 모으기",
      "categoryName": "결혼 준비",
      "missionType": "template",
      "missionLevel": "main",
      "goalAmount": 5000000,
      "currentAmount": 4000000,
      "progressRate": 80,
      "status": "in_progress",
      "dueDate": "2024-06-30",
      "daysRemaining": 168,
      "subMissionsCount": 3,
      "completedBadge": null
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

---

#### 4.4.6 미션 상세 조회
**GET** `/api/v1/missions/{missionId}`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "예식 비용 모으기",
    "description": "6월 결혼식 예식 비용",
    "categoryId": "uuid",
    "categoryName": "결혼 준비",
    "missionType": "template",
    "missionLevel": "main",
    "goalAmount": 5000000,
    "currentAmount": 4000000,
    "remainingAmount": 1000000,
    "progressRate": 80,
    "status": "in_progress",
    "startDate": "2024-01-01",
    "dueDate": "2024-06-30",
    "daysRemaining": 168,
    "subMissions": [
      {
        "id": "uuid",
        "name": "1월 저축 목표",
        "missionLevel": "monthly",
        "goalAmount": 500000,
        "currentAmount": 500000,
        "progressRate": 100,
        "status": "completed"
      }
    ],
    "linkedTransactions": [
      {
        "id": "uuid",
        "bankName": "신한은행",
        "type": "deposit",
        "amount": 500000,
        "transactionDate": "2024-01-10",
        "description": "급여"
      }
    ],
    "sharedAccounts": [
      {
        "id": "uuid",
        "bankName": "신한은행",
        "ownerName": "홍길동"
      }
    ],
    "completedBadge": null,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 4.4.7 미션 수정
**PATCH** `/api/v1/missions/{missionId}`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "name": "예식 비용 모으기 (수정)",
  "description": "업데이트된 설명",
  "goalAmount": 6000000,
  "dueDate": "2024-07-31"
}
```

**Response** (200): 미션 상세 응답과 동일

---

#### 4.4.8 미션 삭제
**DELETE** `/api/v1/missions/{missionId}`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "미션이 삭제되었습니다."
  }
}
```

---

#### 4.4.9 미션 상태 변경
**PATCH** `/api/v1/missions/{missionId}/status`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "status": "completed"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "completedAt": "2024-01-13T14:30:00Z",
    "earnedBadge": {
      "id": "uuid",
      "name": "결혼 준비 마스터",
      "imageUrl": "https://..."
    }
  }
}
```

---

#### 4.4.10 거래 내역 미션 연결
**POST** `/api/v1/missions/{missionId}/link-transaction`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "transactionId": "uuid"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "missionId": "uuid",
    "transactionId": "uuid",
    "previousAmount": 3500000,
    "addedAmount": 500000,
    "currentAmount": 4000000,
    "progressRate": 80
  }
}
```

---

#### 4.4.11 거래 내역 미션 연결 해제
**DELETE** `/api/v1/missions/{missionId}/unlink-transaction/{transactionId}`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "missionId": "uuid",
    "transactionId": "uuid",
    "previousAmount": 4000000,
    "removedAmount": 500000,
    "currentAmount": 3500000,
    "progressRate": 70
  }
}
```

---

### 4.5 금융 API

#### 4.5.1 오픈뱅킹 인증 URL 조회
**GET** `/api/v1/finance/openbanking/auth-url`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "authUrl": "https://testapi.openbanking.or.kr/oauth/2.0/authorize?...",
    "state": "random_state_string"
  }
}
```

---

#### 4.5.2 오픈뱅킹 콜백 처리
**POST** `/api/v1/finance/openbanking/callback`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "code": "authorization_code",
  "state": "random_state_string"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "오픈뱅킹 연동이 완료되었습니다.",
    "accountsCount": 3
  }
}
```

---

#### 4.5.3 연동 계좌 목록 조회
**GET** `/api/v1/finance/accounts`

**Headers**: Authorization 필수

**Query Parameters**:
- includeHidden (선택): true/false (숨김 계좌 포함 여부)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalBalance": 12345678,
    "personalBalance": 8000000,
    "sharedBalance": 4345678,
    "accounts": [
      {
        "id": "uuid",
        "bankCode": "088",
        "bankName": "신한은행",
        "accountNumberMasked": "***-***-1234",
        "accountAlias": "월급통장",
        "accountType": "입출금",
        "balance": 5000000,
        "shareStatus": "full",
        "isHidden": false,
        "lastSyncedAt": "2024-01-13T14:00:00Z"
      }
    ]
  }
}
```

---

#### 4.5.4 계좌 상세 조회
**GET** `/api/v1/finance/accounts/{accountId}`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bankCode": "088",
    "bankName": "신한은행",
    "accountNumberMasked": "***-***-1234",
    "accountAlias": "월급통장",
    "accountType": "입출금",
    "balance": 5000000,
    "shareStatus": "full",
    "isHidden": false,
    "lastSyncedAt": "2024-01-13T14:00:00Z",
    "recentTransactions": [
      {
        "id": "uuid",
        "type": "deposit",
        "amount": 500000,
        "balanceAfter": 5000000,
        "description": "급여",
        "transactionDate": "2024-01-13",
        "linkedMission": null
      }
    ]
  }
}
```

---

#### 4.5.5 계좌 설정 변경
**PATCH** `/api/v1/finance/accounts/{accountId}`

**Headers**: Authorization 필수

**Request Body**:
```json
{
  "accountAlias": "생활비 통장",
  "shareStatus": "balance_only",
  "isHidden": false
}
```

**Response** (200): 계좌 상세 응답과 동일

---

#### 4.5.6 계좌 동기화
**POST** `/api/v1/finance/accounts/{accountId}/sync`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accountId": "uuid",
    "previousBalance": 4500000,
    "currentBalance": 5000000,
    "newTransactionsCount": 2,
    "lastSyncedAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 4.5.7 전체 계좌 동기화
**POST** `/api/v1/finance/accounts/sync-all`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "syncedAccounts": 3,
    "totalNewTransactions": 5,
    "lastSyncedAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 4.5.8 거래 내역 목록 조회
**GET** `/api/v1/finance/transactions`

**Headers**: Authorization 필수

**Query Parameters**:
- accountId (선택): 특정 계좌만
- type (선택): deposit, withdrawal
- startDate (선택): 조회 시작일 (YYYY-MM-DD)
- endDate (선택): 조회 종료일 (YYYY-MM-DD)
- linkedMissionId (선택): 연결된 미션 ID
- unlinkedOnly (선택): true/false (미연결 거래만)
- page, limit, sort, order

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "accountId": "uuid",
      "bankName": "신한은행",
      "type": "deposit",
      "amount": 500000,
      "balanceAfter": 5000000,
      "description": "급여",
      "counterparty": "주식회사 ABC",
      "transactionDate": "2024-01-13",
      "transactionTime": "09:00:00",
      "linkedMission": {
        "id": "uuid",
        "name": "예식 비용 모으기"
      }
    }
  ],
  "meta": {
    "pagination": {...},
    "summary": {
      "totalDeposit": 1500000,
      "totalWithdrawal": 500000,
      "netChange": 1000000
    }
  }
}
```

---

#### 4.5.9 자산 대시보드 조회
**GET** `/api/v1/finance/dashboard`

**Headers**: Authorization 필수

**Query Parameters**:
- period (선택): week, month, quarter, year (기본: month)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalAssets": {
      "total": 12345678,
      "personal": 8000000,
      "shared": 4345678,
      "personalPercentage": 65,
      "sharedPercentage": 35
    },
    "periodSummary": {
      "period": "month",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "totalDeposit": 3000000,
      "totalWithdrawal": 1500000,
      "netChange": 1500000
    },
    "accountsByBank": [
      {
        "bankName": "신한은행",
        "accountCount": 2,
        "totalBalance": 8000000
      }
    ],
    "missionProgress": [
      {
        "id": "uuid",
        "name": "예식 비용 모으기",
        "goalAmount": 5000000,
        "currentAmount": 4000000,
        "progressRate": 80
      }
    ]
  }
}
```

---

#### 4.5.10 오픈뱅킹 연동 해제
**DELETE** `/api/v1/finance/openbanking`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "오픈뱅킹 연동이 해제되었습니다."
  }
}
```

---

### 4.6 뱃지 API

#### 4.6.1 내 뱃지 목록 조회
**GET** `/api/v1/badges/me`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "earnedBadges": [
      {
        "id": "uuid",
        "name": "결혼 준비 마스터",
        "description": "결혼 준비 관련 미션 5개 완료",
        "imageUrl": "https://...",
        "badgeType": "lifecycle",
        "issuedAt": "2024-01-10T10:00:00Z"
      }
    ],
    "unearnedBadges": [
      {
        "id": "uuid",
        "name": "주택 마련 성공",
        "description": "주택 마련 관련 미션 완료",
        "imageUrl": "https://...",
        "badgeType": "lifecycle",
        "hint": "주택 마련 관련 미션을 완료하세요"
      }
    ],
    "totalEarned": 2,
    "totalAvailable": 10
  }
}
```

---

#### 4.6.2 뱃지 상세 조회
**GET** `/api/v1/badges/{badgeId}`

**Headers**: Authorization 필수

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "결혼 준비 마스터",
    "description": "결혼 준비 관련 미션 5개 완료",
    "imageUrl": "https://...",
    "badgeType": "lifecycle",
    "conditionDescription": "결혼 준비 카테고리 미션 5개 완료",
    "earned": true,
    "issuedAt": "2024-01-10T10:00:00Z",
    "progress": {
      "current": 5,
      "target": 5,
      "percentage": 100
    }
  }
}
```

---

### 4.7 실시간 동기화 API (SSE)

#### 4.7.1 실시간 이벤트 구독
**GET** `/api/v1/events/subscribe`

**Headers**:
- Authorization: 필수
- Accept: text/event-stream

**Response** (SSE Stream):
```
event: mission_updated
data: {"missionId": "uuid", "status": "completed", "currentAmount": 5000000}

event: transaction_synced
data: {"accountId": "uuid", "newTransactions": 2, "balance": 5500000}

event: badge_earned
data: {"badgeId": "uuid", "name": "결혼 준비 마스터"}

event: family_data_updated
data: {"type": "account_balance", "accountId": "uuid", "balance": 3000000}
```

---

## 5. Admin API 명세

### 5.1 어드민 인증 API

#### 5.1.1 어드민 로그인
**POST** `/api/v1/admin/auth/login`

**Request Body**:
```json
{
  "email": "admin@nestack.com",
  "password": "AdminPassword123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "uuid",
      "email": "admin@nestack.com",
      "name": "관리자",
      "role": "super_admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

---

#### 5.1.2 어드민 로그아웃
**POST** `/api/v1/admin/auth/logout`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "로그아웃되었습니다."
  }
}
```

---

### 5.2 사용자 관리 API

#### 5.2.1 회원 목록 조회
**GET** `/api/v1/admin/users`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- search (선택): 이메일/이름 검색
- status (선택): active, inactive, withdrawn
- hasFamilyGroup (선택): true/false
- hasOpenBanking (선택): true/false
- startDate, endDate (선택): 가입일 범위
- page, limit, sort, order

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "status": "active",
      "provider": "local",
      "emailVerified": true,
      "hasFamilyGroup": true,
      "hasOpenBanking": true,
      "lastLoginAt": "2024-01-13T10:00:00Z",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

---

#### 5.2.2 회원 상세 조회
**GET** `/api/v1/admin/users/{userId}`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "profileImageUrl": null,
    "status": "active",
    "provider": "local",
    "emailVerified": true,
    "lastLoginAt": "2024-01-13T10:00:00Z",
    "createdAt": "2024-01-01T10:00:00Z",
    "familyGroup": {
      "id": "uuid",
      "partnerId": "uuid",
      "partnerName": "김철수",
      "partnerEmail": "kim@example.com",
      "connectedAt": "2024-01-05T10:00:00Z"
    },
    "openBanking": {
      "connected": true,
      "accountsCount": 3,
      "connectedAt": "2024-01-10T10:00:00Z"
    },
    "missions": {
      "total": 5,
      "completed": 3,
      "inProgress": 2
    },
    "badges": [
      {
        "id": "uuid",
        "name": "결혼 준비 마스터",
        "issuedAt": "2024-01-10T10:00:00Z"
      }
    ]
  }
}
```

---

#### 5.2.3 회원 상태 변경
**PATCH** `/api/v1/admin/users/{userId}/status`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "status": "inactive",
  "reason": "사용자 요청에 의한 비활성화"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "inactive",
    "updatedAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 5.2.4 비밀번호 초기화
**POST** `/api/v1/admin/users/{userId}/reset-password`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "비밀번호 재설정 메일이 발송되었습니다."
  }
}
```

---

#### 5.2.5 회원 강제 탈퇴
**DELETE** `/api/v1/admin/users/{userId}`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "reason": "서비스 이용 약관 위반"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "회원이 탈퇴 처리되었습니다."
  }
}
```

---

### 5.3 미션 템플릿 관리 API

#### 5.3.1 카테고리 목록 조회
**GET** `/api/v1/admin/categories`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "결혼 준비",
      "displayOrder": 1,
      "status": "active",
      "templatesCount": 5
    }
  ]
}
```

---

#### 5.3.2 카테고리 생성
**POST** `/api/v1/admin/categories`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "name": "출산 준비",
  "displayOrder": 3,
  "status": "active"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "출산 준비",
    "displayOrder": 3,
    "status": "active",
    "createdAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 5.3.3 카테고리 수정
**PATCH** `/api/v1/admin/categories/{categoryId}`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "name": "출산 및 육아",
  "displayOrder": 3,
  "status": "active"
}
```

**Response** (200): 카테고리 상세 응답과 동일

---

#### 5.3.4 카테고리 삭제
**DELETE** `/api/v1/admin/categories/{categoryId}`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "카테고리가 삭제되었습니다."
  }
}
```

---

#### 5.3.5 미션 템플릿 목록 조회
**GET** `/api/v1/admin/mission-templates`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- search (선택): 미션명 검색
- categoryId (선택): 카테고리 필터
- status (선택): active, inactive
- page, limit, sort, order

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "예식 비용 모으기",
      "description": "예식장, 식대 등",
      "categoryId": "uuid",
      "categoryName": "결혼 준비",
      "goalType": "amount",
      "defaultGoalAmount": 5000000,
      "status": "active",
      "usageCount": 234,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

---

#### 5.3.6 미션 템플릿 생성
**POST** `/api/v1/admin/mission-templates`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "name": "신혼집 인테리어",
  "description": "신혼집 인테리어 비용 마련",
  "categoryId": "uuid",
  "goalType": "amount",
  "defaultGoalAmount": 10000000,
  "status": "active"
}
```

**Response** (201): 미션 템플릿 상세 응답

---

#### 5.3.7 미션 템플릿 수정
**PATCH** `/api/v1/admin/mission-templates/{templateId}`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "name": "신혼집 인테리어 비용",
  "description": "업데이트된 설명",
  "defaultGoalAmount": 15000000,
  "status": "active"
}
```

**Response** (200): 미션 템플릿 상세 응답

---

#### 5.3.8 미션 템플릿 삭제
**DELETE** `/api/v1/admin/mission-templates/{templateId}`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "미션 템플릿이 삭제되었습니다."
  }
}
```

---

### 5.4 사용자 미션 관리 API

#### 5.4.1 사용자 미션 목록 조회
**GET** `/api/v1/admin/missions`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- search (선택): 미션명/사용자 검색
- status (선택): pending, in_progress, completed, failed
- missionType (선택): template, custom
- categoryId (선택): 카테고리 필터
- userId (선택): 특정 사용자
- page, limit, sort, order

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "예식 비용 모으기",
      "userId": "uuid",
      "userName": "홍길동",
      "userEmail": "hong@example.com",
      "categoryName": "결혼 준비",
      "missionType": "template",
      "goalAmount": 5000000,
      "currentAmount": 4000000,
      "progressRate": 80,
      "status": "in_progress",
      "dueDate": "2024-06-30",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

---

#### 5.4.2 사용자 미션 상세 조회
**GET** `/api/v1/admin/missions/{missionId}`

**Headers**: Authorization 필수 (Admin)

**Response** (200): B2C 미션 상세와 유사 (관리자용 추가 정보 포함)

---

#### 5.4.3 미션 상태 변경 (관리자)
**PATCH** `/api/v1/admin/missions/{missionId}/status`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "status": "completed",
  "reason": "목표 달성 확인"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "updatedAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 5.4.4 미션 기한 연장
**PATCH** `/api/v1/admin/missions/{missionId}/extend`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "newDueDate": "2024-07-31",
  "reason": "사용자 요청"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "previousDueDate": "2024-06-30",
    "newDueDate": "2024-07-31",
    "updatedAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 5.4.5 미션 삭제 (관리자)
**DELETE** `/api/v1/admin/missions/{missionId}`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "reason": "부적절한 콘텐츠"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "미션이 삭제되었습니다."
  }
}
```

---

### 5.5 가족 그룹 관리 API

#### 5.5.1 가족 그룹 목록 조회
**GET** `/api/v1/admin/family-groups`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- search (선택): 사용자/초대코드 검색
- status (선택): active, dissolved
- startDate, endDate (선택): 연결일 범위
- page, limit, sort, order

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "member1": {
        "id": "uuid",
        "name": "홍길동",
        "email": "hong@example.com"
      },
      "member2": {
        "id": "uuid",
        "name": "김철수",
        "email": "kim@example.com"
      },
      "status": "active",
      "createdAt": "2024-01-05T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

---

#### 5.5.2 가족 그룹 상세 조회
**GET** `/api/v1/admin/family-groups/{familyGroupId}`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "members": [
      {
        "id": "uuid",
        "name": "홍길동",
        "email": "hong@example.com",
        "joinedAt": "2024-01-05T10:00:00Z"
      },
      {
        "id": "uuid",
        "name": "김철수",
        "email": "kim@example.com",
        "joinedAt": "2024-01-05T10:30:00Z"
      }
    ],
    "inviteCodeHistory": [
      {
        "code": "ABC123XYZ456",
        "createdBy": "홍길동",
        "status": "used",
        "usedBy": "김철수",
        "createdAt": "2024-01-01T10:00:00Z",
        "usedAt": "2024-01-05T10:30:00Z"
      }
    ],
    "shareSettings": {
      "sharedAccountsCount": 3,
      "sharedMissionsCount": 2
    },
    "status": "active",
    "createdAt": "2024-01-05T10:00:00Z"
  }
}
```

---

#### 5.5.3 가족 그룹 해제
**DELETE** `/api/v1/admin/family-groups/{familyGroupId}`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "reason": "관리자 요청에 의한 해제"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "가족 그룹이 해제되었습니다."
  }
}
```

---

### 5.6 뱃지 관리 API

#### 5.6.1 뱃지 목록 조회
**GET** `/api/v1/admin/badges`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- search (선택): 뱃지명 검색
- badgeType (선택): lifecycle, streak, family
- status (선택): active, inactive
- page, limit, sort, order

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "결혼 준비 마스터",
      "description": "결혼 준비 관련 미션 5개 완료",
      "imageUrl": "https://...",
      "badgeType": "lifecycle",
      "conditionType": "category_completion",
      "status": "active",
      "issuedCount": 234,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

---

#### 5.6.2 뱃지 생성
**POST** `/api/v1/admin/badges`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "name": "6개월 연속 달성",
  "description": "6개월 연속 미션 완료",
  "imageUrl": "https://...",
  "badgeType": "streak",
  "conditionType": "consecutive_months",
  "conditionValue": {
    "consecutive_months": 6
  },
  "status": "active"
}
```

**Response** (201): 뱃지 상세 응답

---

#### 5.6.3 뱃지 수정
**PATCH** `/api/v1/admin/badges/{badgeId}`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "name": "6개월 연속 달성 마스터",
  "description": "업데이트된 설명",
  "status": "active"
}
```

**Response** (200): 뱃지 상세 응답

---

#### 5.6.4 뱃지 삭제
**DELETE** `/api/v1/admin/badges/{badgeId}`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "뱃지가 삭제되었습니다."
  }
}
```

---

#### 5.6.5 뱃지 발급 이력 조회
**GET** `/api/v1/admin/badges/issued`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- search (선택): 사용자/뱃지 검색
- badgeId (선택): 특정 뱃지
- userId (선택): 특정 사용자
- issueType (선택): auto, manual
- startDate, endDate (선택): 발급일 범위
- page, limit, sort, order

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "badge": {
        "id": "uuid",
        "name": "결혼 준비 마스터",
        "imageUrl": "https://..."
      },
      "user": {
        "id": "uuid",
        "name": "홍길동",
        "email": "hong@example.com"
      },
      "issueType": "auto",
      "issuedBy": null,
      "issuedAt": "2024-01-10T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

---

#### 5.6.6 수동 뱃지 발급
**POST** `/api/v1/admin/badges/{badgeId}/issue`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "userId": "uuid",
  "reason": "이벤트 참여 보상"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "badgeId": "uuid",
    "userId": "uuid",
    "issueType": "manual",
    "issuedBy": "admin_uuid",
    "issuedAt": "2024-01-13T14:30:00Z"
  }
}
```

---

#### 5.6.7 뱃지 회수
**DELETE** `/api/v1/admin/badges/issued/{userBadgeId}`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "reason": "잘못된 발급"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "뱃지가 회수되었습니다."
  }
}
```

---

### 5.7 통계 API

#### 5.7.1 대시보드 통계
**GET** `/api/v1/admin/statistics/dashboard`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1234,
      "totalFamilyGroups": 567,
      "totalOpenBankingUsers": 890,
      "totalMissions": 2345
    },
    "recentIssues": [
      {
        "type": "error",
        "message": "오픈뱅킹 연동 실패",
        "count": 5,
        "lastOccurredAt": "2024-01-13T14:30:00Z"
      }
    ],
    "todaySummary": {
      "newUsers": 15,
      "newFamilyGroups": 8,
      "completedMissions": 23
    }
  }
}
```

---

#### 5.7.2 사용자 통계
**GET** `/api/v1/admin/statistics/users`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- period (선택): week, month, quarter, year
- startDate, endDate (선택)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1234,
      "activeUsers": 890,
      "inactiveUsers": 234,
      "withdrawnUsers": 110,
      "familyConnectionRate": 65,
      "openBankingConnectionRate": 72
    },
    "trend": [
      {
        "date": "2024-01-01",
        "newUsers": 10,
        "withdrawnUsers": 2
      }
    ],
    "statusDistribution": {
      "active": { "count": 890, "percentage": 72 },
      "inactive": { "count": 234, "percentage": 19 },
      "withdrawn": { "count": 110, "percentage": 9 }
    }
  }
}
```

---

#### 5.7.3 미션 통계
**GET** `/api/v1/admin/statistics/missions`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- period (선택): week, month, quarter, year
- startDate, endDate (선택)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalMissions": 2345,
      "completedMissions": 1523,
      "completionRate": 65,
      "averageGoalAmount": 5200000
    },
    "trend": [
      {
        "date": "2024-01-01",
        "created": 15,
        "completed": 8
      }
    ],
    "categoryDistribution": [
      {
        "categoryId": "uuid",
        "categoryName": "결혼 준비",
        "count": 1234,
        "percentage": 53
      }
    ],
    "typeDistribution": {
      "template": { "count": 1567, "percentage": 67 },
      "custom": { "count": 778, "percentage": 33 }
    }
  }
}
```

---

#### 5.7.4 가족 그룹 통계
**GET** `/api/v1/admin/statistics/family-groups`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- period (선택): week, month, quarter, year
- startDate, endDate (선택)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalGroups": 567,
      "connectionRate": 65,
      "averageConnectionTime": 2.5
    },
    "trend": [
      {
        "date": "2024-01-01",
        "created": 5,
        "dissolved": 1
      }
    ],
    "shareSettingsDistribution": {
      "full": { "count": 234, "percentage": 41 },
      "balance_only": { "count": 189, "percentage": 33 },
      "private": { "count": 144, "percentage": 26 }
    }
  }
}
```

---

#### 5.7.5 오픈뱅킹 통계
**GET** `/api/v1/admin/statistics/openbanking`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- period (선택): week, month, quarter, year
- startDate, endDate (선택)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "overview": {
      "connectedUsers": 890,
      "connectionRate": 72,
      "averageAccountsPerUser": 3.2
    },
    "trend": [
      {
        "date": "2024-01-01",
        "connected": 8,
        "disconnected": 2
      }
    ],
    "bankDistribution": [
      {
        "bankCode": "088",
        "bankName": "신한은행",
        "count": 234,
        "percentage": 26
      }
    ]
  }
}
```

---

### 5.8 오픈뱅킹 모니터링 API

#### 5.8.1 연동 상태 현황
**GET** `/api/v1/admin/openbanking/status`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "overview": {
      "success": 850,
      "failed": 40,
      "pending": 10
    },
    "bankStatus": [
      {
        "bankCode": "088",
        "bankName": "신한은행",
        "success": 234,
        "failed": 12,
        "pending": 5,
        "status": "normal"
      }
    ],
    "recentHistory": [
      {
        "userId": "uuid",
        "userEmail": "user@example.com",
        "bankName": "신한은행",
        "action": "connect",
        "result": "success",
        "timestamp": "2024-01-13T14:30:00Z"
      }
    ]
  }
}
```

---

#### 5.8.2 오류 로그 조회
**GET** `/api/v1/admin/openbanking/errors`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- search (선택): 사용자/은행 검색
- level (선택): error, warn, info
- bankCode (선택): 은행 코드
- startDate, endDate (선택)
- page, limit, sort, order

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "email": "user@example.com"
      },
      "bankCode": "088",
      "bankName": "신한은행",
      "errorType": "AUTH_FAILED",
      "errorMessage": "인증 실패",
      "level": "error",
      "details": {...},
      "resolved": false,
      "timestamp": "2024-01-13T14:30:00Z"
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

---

#### 5.8.3 오류 해결 처리
**PATCH** `/api/v1/admin/openbanking/errors/{errorId}/resolve`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "resolution": "사용자에게 재연동 안내"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "resolved": true,
    "resolvedAt": "2024-01-13T14:30:00Z",
    "resolvedBy": "admin_uuid"
  }
}
```

---

### 5.9 시스템 설정 API

#### 5.9.1 시스템 설정 조회
**GET** `/api/v1/admin/settings`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "invite_code_expiry_days": 7,
    "invite_code_length": 12,
    "max_family_members": 2,
    "default_share_status": "private",
    "available_share_options": ["full", "balance_only", "private"]
  }
}
```

---

#### 5.9.2 시스템 설정 변경
**PATCH** `/api/v1/admin/settings`

**Headers**: Authorization 필수 (Admin, super_admin only)

**Request Body**:
```json
{
  "invite_code_expiry_days": 14,
  "default_share_status": "balance_only"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "설정이 변경되었습니다.",
    "updatedSettings": {
      "invite_code_expiry_days": 14,
      "default_share_status": "balance_only"
    }
  }
}
```

---

#### 5.9.3 공지사항 목록 조회
**GET** `/api/v1/admin/announcements`

**Headers**: Authorization 필수 (Admin)

**Query Parameters**:
- status (선택): active, inactive
- displayType (선택): popup, banner
- page, limit, sort, order

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "서비스 점검 안내",
      "displayType": "popup",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-01-20T23:59:59Z",
      "status": "active",
      "createdBy": "관리자",
      "createdAt": "2024-01-13T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

---

#### 5.9.4 공지사항 생성
**POST** `/api/v1/admin/announcements`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "title": "신규 기능 안내",
  "content": "새로운 뱃지 시스템이 추가되었습니다.",
  "displayType": "banner",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "status": "active"
}
```

**Response** (201): 공지사항 상세 응답

---

#### 5.9.5 공지사항 수정
**PATCH** `/api/v1/admin/announcements/{announcementId}`

**Headers**: Authorization 필수 (Admin)

**Request Body**:
```json
{
  "title": "신규 기능 안내 (업데이트)",
  "content": "업데이트된 내용",
  "status": "active"
}
```

**Response** (200): 공지사항 상세 응답

---

#### 5.9.6 공지사항 삭제
**DELETE** `/api/v1/admin/announcements/{announcementId}`

**Headers**: Authorization 필수 (Admin)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "공지사항이 삭제되었습니다."
  }
}
```

---

#### 5.9.7 어드민 계정 목록 조회
**GET** `/api/v1/admin/admins`

**Headers**: Authorization 필수 (Admin, super_admin only)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "admin@nestack.com",
      "name": "관리자",
      "role": "super_admin",
      "status": "active",
      "lastLoginAt": "2024-01-13T10:00:00Z",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

#### 5.9.8 어드민 계정 생성
**POST** `/api/v1/admin/admins`

**Headers**: Authorization 필수 (Admin, super_admin only)

**Request Body**:
```json
{
  "email": "newadmin@nestack.com",
  "password": "AdminPassword123!",
  "name": "새 관리자",
  "role": "admin"
}
```

**Response** (201): 어드민 계정 상세 응답

---

#### 5.9.9 어드민 계정 수정
**PATCH** `/api/v1/admin/admins/{adminId}`

**Headers**: Authorization 필수 (Admin, super_admin only)

**Request Body**:
```json
{
  "name": "수정된 이름",
  "role": "admin",
  "status": "active"
}
```

**Response** (200): 어드민 계정 상세 응답

---

#### 5.9.10 어드민 계정 삭제
**DELETE** `/api/v1/admin/admins/{adminId}`

**Headers**: Authorization 필수 (Admin, super_admin only)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "어드민 계정이 삭제되었습니다."
  }
}
```

---

## 6. 부록

### 6.1 은행 코드 목록

| 은행코드 | 은행명 |
|----------|--------|
| 002 | KDB산업은행 |
| 003 | IBK기업은행 |
| 004 | KB국민은행 |
| 007 | 수협은행 |
| 011 | NH농협은행 |
| 020 | 우리은행 |
| 023 | SC제일은행 |
| 027 | 씨티은행 |
| 031 | 대구은행 |
| 032 | 부산은행 |
| 034 | 광주은행 |
| 035 | 제주은행 |
| 037 | 전북은행 |
| 039 | 경남은행 |
| 045 | 새마을금고 |
| 048 | 신협 |
| 071 | 우체국 |
| 081 | 하나은행 |
| 088 | 신한은행 |
| 089 | 케이뱅크 |
| 090 | 카카오뱅크 |
| 092 | 토스뱅크 |

### 6.2 JWT 토큰 구조

**Access Token Payload**:
```json
{
  "sub": "user_uuid",
  "type": "access",
  "role": "user",
  "iat": 1705150200,
  "exp": 1705153800
}
```

**Refresh Token Payload**:
```json
{
  "sub": "user_uuid",
  "type": "refresh",
  "jti": "unique_token_id",
  "iat": 1705150200,
  "exp": 1705755000
}
```

**Admin Token Payload**:
```json
{
  "sub": "admin_uuid",
  "type": "access",
  "role": "super_admin",
  "iat": 1705150200,
  "exp": 1705153800
}
```

### 6.3 이벤트 타입 (SSE)

| 이벤트 | 설명 | 데이터 |
|--------|------|--------|
| mission_updated | 미션 상태/금액 변경 | missionId, status, currentAmount |
| mission_completed | 미션 완료 | missionId, earnedBadge |
| transaction_synced | 거래 내역 동기화 | accountId, newTransactions, balance |
| badge_earned | 뱃지 획득 | badgeId, name, imageUrl |
| family_data_updated | 가족 데이터 변경 | type, accountId/missionId, data |
| family_joined | 가족 그룹 연결 | familyGroupId, partnerId, partnerName |
| family_left | 가족 그룹 탈퇴 | familyGroupId |

---

## 문서 버전
- **버전**: 1.0.0
- **작성일**: 2025-01-14
- **작성자**: Nestack 개발팀
