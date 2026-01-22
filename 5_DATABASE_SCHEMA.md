# Nestack Database Schema

> 데이터베이스 스키마 및 ERD (Entity Relationship Diagram)

---

## 1. 데이터베이스 개요

### 1.1 기술 스택
- **Database**: PostgreSQL 16
- **ORM**: TypeORM 0.3.x
- **Migration**: TypeORM Migration

### 1.2 명명 규칙
- **테이블명**: snake_case, 복수형 (예: `users`, `bank_accounts`)
- **컬럼명**: snake_case (예: `created_at`, `family_group_id`)
- **인덱스명**: `idx_{table}_{column}` (예: `idx_user_email`)
- **외래키**: `{table}_id` (예: `user_id`, `mission_id`)

### 1.3 공통 컬럼
모든 테이블은 다음 공통 컬럼을 포함:
- `id`: UUID, Primary Key
- `created_at`: TIMESTAMP, 생성일시
- `updated_at`: TIMESTAMP, 수정일시 (일부 테이블)
- `deleted_at`: TIMESTAMP, 소프트 삭제 (일부 테이블)

---

## 2. ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              NESTACK DATABASE ERD                                │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   admin_users    │
                              ├──────────────────┤
                              │ id (PK)          │
                              │ email            │
                              │ password_hash    │
                              │ name             │
                              │ role             │
                              │ status           │
                              └──────────────────┘

┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  family_groups   │          │      users       │          │   bank_accounts  │
├──────────────────┤          ├──────────────────┤          ├──────────────────┤
│ id (PK)          │◄────────┤│ id (PK)          │─────────►│ id (PK)          │
│ created_by       │         ││ email            │          │ user_id (FK)     │
│ status           │         ││ password_hash    │          │ bank_code        │
│ created_at       │         ││ name             │          │ bank_name        │
└────────┬─────────┘         ││ provider         │          │ account_number   │
         │                   ││ provider_id      │          │ balance          │
         │                   ││ email_verified   │          │ share_status     │
         │                   ││ status           │          │ fintech_use_num  │
         │                   ││ family_group_id  │──────────└────────┬─────────┘
         │                   │└──────────────────┘                   │
         │                   │         │                             │
         │                   │         │ 1:N                         │ 1:N
         │                   │         ▼                             ▼
         │                   │ ┌──────────────────┐          ┌──────────────────┐
         │                   │ │  refresh_tokens  │          │   transactions   │
         │                   │ ├──────────────────┤          ├──────────────────┤
         │                   │ │ id (PK)          │          │ id (PK)          │
         │                   │ │ user_id (FK)     │          │ bank_account_id  │
         │                   │ │ token_hash       │          │ mission_id (FK)  │
         │                   │ │ expires_at       │          │ type             │
         │                   │ └──────────────────┘          │ amount           │
         │                   │                               │ transaction_date │
         │                   │                               └──────────────────┘
         │ 1:N               │
         ▼                   │
┌──────────────────┐         │         ┌──────────────────┐
│   invite_codes   │         │         │     missions     │
├──────────────────┤         │         ├──────────────────┤
│ id (PK)          │         │         │ id (PK)          │
│ family_group_id  │         │    ────►│ user_id (FK)     │
│ code             │         │         │ family_group_id  │
│ status           │         │         │ template_id (FK) │
│ expires_at       │         │         │ category_id (FK) │
└──────────────────┘         │         │ parent_mission_id│◄──┐
                             │         │ name             │   │ Self-Reference
                             │         │ goal_amount      │───┘ (Parent-Child)
┌──────────────────┐         │         │ current_amount   │
│lifecycle_categories│       │         │ mission_level    │
├──────────────────┤         │         │ status           │
│ id (PK)          │─────────┼────────►│ due_date         │
│ name             │         │         └────────┬─────────┘
│ description      │         │                  │
│ icon             │         │                  │ 1:N
│ display_order    │         │                  ▼
└──────────────────┘         │         ┌──────────────────┐
                             │         │mission_shared_   │
┌──────────────────┐         │         │    accounts      │
│ mission_templates│         │         ├──────────────────┤
├──────────────────┤         │         │ id (PK)          │
│ id (PK)          │─────────┘         │ mission_id (FK)  │
│ category_id (FK) │                   │ bank_account_id  │
│ name             │                   └──────────────────┘
│ description      │
│ recommended_goal │                   ┌──────────────────┐
└──────────────────┘                   │      badges      │
                                       ├──────────────────┤
                                       │ id (PK)          │
                                       │ name             │
                                       │ badge_type       │
                                       │ condition_type   │
┌──────────────────┐                   │ condition_value  │
│   user_badges    │                   └────────┬─────────┘
├──────────────────┤                            │
│ id (PK)          │                            │ 1:N
│ user_id (FK)     │◄───────────────────────────┘
│ badge_id (FK)    │
│ issue_type       │
│ issued_at        │
└──────────────────┘

┌──────────────────┐          ┌──────────────────┐
│openbanking_tokens│          │  announcements   │
├──────────────────┤          ├──────────────────┤
│ id (PK)          │          │ id (PK)          │
│ user_id (FK)     │          │ title            │
│ access_token     │          │ content          │
│ refresh_token    │          │ display_type     │
│ expires_at       │          │ status           │
└──────────────────┘          └──────────────────┘
```

---

## 3. 테이블 상세

### 3.1 User Module

#### users
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| email | VARCHAR(255) | NO | - | 이메일 (Unique) |
| password_hash | VARCHAR(255) | YES | - | 비밀번호 해시 (bcrypt) |
| name | VARCHAR(100) | NO | - | 이름 |
| profile_image_url | VARCHAR(500) | YES | - | 프로필 이미지 URL |
| provider | ENUM | NO | 'local' | 인증 제공자 (local, google) |
| provider_id | VARCHAR(255) | YES | - | 소셜 로그인 Provider ID |
| email_verified | BOOLEAN | NO | false | 이메일 인증 여부 |
| email_verified_at | TIMESTAMP | YES | - | 이메일 인증 일시 |
| status | ENUM | NO | 'active' | 상태 (active, inactive, withdrawn) |
| last_login_at | TIMESTAMP | YES | - | 마지막 로그인 일시 |
| family_group_id | UUID | YES | - | 가족 그룹 FK |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |
| deleted_at | TIMESTAMP | YES | - | 삭제일시 (소프트 삭제) |

**Indexes:**
- `idx_user_email` (email)
- `idx_user_family_group` (family_group_id)
- `idx_user_provider` (provider, provider_id)

#### refresh_tokens
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | 사용자 FK |
| token_hash | VARCHAR(255) | NO | - | 토큰 해시 |
| device_info | VARCHAR(255) | YES | - | 디바이스 정보 |
| expires_at | TIMESTAMP | NO | - | 만료 일시 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |

#### email_verification_tokens
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | 사용자 FK |
| token | VARCHAR(255) | NO | - | 인증 토큰 |
| token_type | ENUM | NO | - | 토큰 타입 (email_verify, password_reset) |
| expires_at | TIMESTAMP | NO | - | 만료 일시 |
| used_at | TIMESTAMP | YES | - | 사용 일시 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |

---

### 3.2 Family Module

#### family_groups
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| created_by | UUID | NO | - | 생성자 ID |
| status | ENUM | NO | 'active' | 상태 (active, dissolved) |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |

#### invite_codes
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| family_group_id | UUID | NO | - | 가족 그룹 FK |
| code | VARCHAR(12) | NO | - | 12자리 초대 코드 (Unique) |
| status | ENUM | NO | 'pending' | 상태 (pending, used, expired, revoked) |
| expires_at | TIMESTAMP | NO | - | 만료 일시 (7일) |
| used_by | UUID | YES | - | 사용자 ID |
| used_at | TIMESTAMP | YES | - | 사용 일시 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |

---

### 3.3 Mission Module

#### lifecycle_categories
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| name | VARCHAR(50) | NO | - | 카테고리명 |
| description | TEXT | YES | - | 설명 |
| icon | VARCHAR(50) | YES | - | 아이콘 이름 |
| display_order | INTEGER | NO | 0 | 표시 순서 |
| status | ENUM | NO | 'active' | 상태 (active, inactive) |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |

**기본 카테고리:**
- 결혼 준비 (marriage)
- 주택 마련 (housing)
- 출산/육아 (parenting) - Phase 3
- 노후 준비 (retirement) - Phase 3

#### mission_templates
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| category_id | UUID | NO | - | 카테고리 FK |
| name | VARCHAR(100) | NO | - | 템플릿명 |
| description | TEXT | YES | - | 설명 |
| recommended_goal | DECIMAL(18,2) | YES | - | 권장 목표 금액 |
| display_order | INTEGER | NO | 0 | 표시 순서 |
| status | ENUM | NO | 'active' | 상태 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |

#### missions
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | 사용자 FK |
| family_group_id | UUID | YES | - | 가족 그룹 FK (공동 미션) |
| template_id | UUID | YES | - | 템플릿 FK |
| category_id | UUID | NO | - | 카테고리 FK |
| parent_mission_id | UUID | YES | - | 상위 미션 FK (계층 구조) |
| name | VARCHAR(100) | NO | - | 미션명 |
| description | TEXT | YES | - | 설명 |
| goal_amount | DECIMAL(18,2) | NO | - | 목표 금액 |
| current_amount | DECIMAL(18,2) | NO | 0 | 현재 금액 |
| mission_type | ENUM | NO | - | 타입 (template, custom) |
| mission_level | ENUM | NO | 'main' | 레벨 (main, monthly, weekly, daily) |
| status | ENUM | NO | 'pending' | 상태 (pending, in_progress, completed, failed) |
| start_date | DATE | YES | - | 시작일 |
| due_date | DATE | NO | - | 목표일 |
| completed_at | TIMESTAMP | YES | - | 완료 일시 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |

**Indexes:**
- `idx_mission_user` (user_id)
- `idx_mission_family_group` (family_group_id)
- `idx_mission_parent` (parent_mission_id)
- `idx_mission_status` (status)

#### mission_shared_accounts
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| mission_id | UUID | NO | - | 미션 FK |
| bank_account_id | UUID | NO | - | 계좌 FK |
| created_at | TIMESTAMP | NO | now() | 생성일시 |

---

### 3.4 Finance Module

#### bank_accounts
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | 사용자 FK |
| bank_code | VARCHAR(10) | NO | - | 은행 코드 |
| bank_name | VARCHAR(50) | NO | - | 은행명 |
| account_number | VARCHAR(50) | NO | - | 계좌번호 (암호화) |
| account_number_masked | VARCHAR(50) | NO | - | 마스킹된 계좌번호 |
| account_alias | VARCHAR(100) | YES | - | 계좌 별명 |
| account_type | VARCHAR(50) | YES | - | 계좌 유형 |
| balance | DECIMAL(18,2) | NO | 0 | 잔액 |
| fintech_use_num | VARCHAR(100) | NO | - | 핀테크 이용번호 |
| share_status | ENUM | NO | 'private' | 공유 상태 (full, balance_only, private) |
| is_hidden | BOOLEAN | NO | false | 숨김 여부 |
| last_synced_at | TIMESTAMP | YES | - | 마지막 동기화 일시 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |

**Indexes:**
- `idx_bank_account_user` (user_id)
- `idx_bank_account_fintech` (fintech_use_num)

#### transactions
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| bank_account_id | UUID | NO | - | 계좌 FK |
| transaction_id | VARCHAR(100) | NO | - | 오픈뱅킹 거래 ID |
| type | ENUM | NO | - | 거래 유형 (deposit, withdrawal) |
| amount | DECIMAL(18,2) | NO | - | 금액 |
| balance_after | DECIMAL(18,2) | NO | - | 거래 후 잔액 |
| description | VARCHAR(255) | YES | - | 적요 |
| counterparty | VARCHAR(100) | YES | - | 거래 상대방 |
| transaction_date | DATE | NO | - | 거래일 |
| transaction_time | TIME | YES | - | 거래 시간 |
| mission_id | UUID | YES | - | 연결된 미션 FK |
| created_at | TIMESTAMP | NO | now() | 생성일시 |

**Indexes:**
- `idx_transaction_bank_account` (bank_account_id)
- `idx_transaction_mission` (mission_id)
- `idx_transaction_date` (transaction_date)

#### openbanking_tokens
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | 사용자 FK (Unique) |
| access_token | TEXT | NO | - | 액세스 토큰 (암호화) |
| refresh_token | TEXT | NO | - | 리프레시 토큰 (암호화) |
| token_type | VARCHAR(50) | NO | 'Bearer' | 토큰 타입 |
| scope | TEXT | YES | - | 권한 범위 |
| expires_at | TIMESTAMP | NO | - | 만료 일시 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |

---

### 3.5 Badge Module

#### badges
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| name | VARCHAR(100) | NO | - | 뱃지명 |
| description | TEXT | YES | - | 설명 |
| image_url | VARCHAR(500) | YES | - | 이미지 URL |
| badge_type | ENUM | NO | - | 타입 (lifecycle, streak, family) |
| condition_type | VARCHAR(50) | NO | - | 조건 타입 |
| condition_value | JSONB | NO | - | 조건 값 |
| status | ENUM | NO | 'active' | 상태 (active, inactive) |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |

**condition_value 예시:**
```json
// lifecycle 타입
{ "categoryId": "uuid", "completedCount": 3 }

// streak 타입
{ "consecutiveMonths": 3 }

// family 타입
{ "familyCompletedCount": 5 }
```

#### user_badges
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | 사용자 FK |
| badge_id | UUID | NO | - | 뱃지 FK |
| issue_type | ENUM | NO | 'auto' | 발급 타입 (auto, manual) |
| issued_at | TIMESTAMP | NO | now() | 발급 일시 |
| issued_by | UUID | YES | - | 수동 발급 시 관리자 ID |
| created_at | TIMESTAMP | NO | now() | 생성일시 |

**Unique Constraint:** (user_id, badge_id)

---

### 3.6 Admin Module

#### admin_users
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| email | VARCHAR(255) | NO | - | 이메일 (Unique) |
| password_hash | VARCHAR(255) | NO | - | 비밀번호 해시 |
| name | VARCHAR(100) | NO | - | 이름 |
| role | ENUM | NO | 'admin' | 역할 (super_admin, admin) |
| status | ENUM | NO | 'active' | 상태 (active, inactive) |
| last_login_at | TIMESTAMP | YES | - | 마지막 로그인 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |

#### announcements
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| title | VARCHAR(200) | NO | - | 제목 |
| content | TEXT | NO | - | 내용 |
| display_type | ENUM | NO | 'banner' | 표시 타입 (popup, banner) |
| status | ENUM | NO | 'active' | 상태 (active, inactive) |
| start_date | TIMESTAMP | YES | - | 게시 시작일 |
| end_date | TIMESTAMP | YES | - | 게시 종료일 |
| created_by | UUID | NO | - | 작성자 ID |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |

#### system_settings
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| key | VARCHAR(100) | NO | - | 설정 키 (Unique) |
| value | JSONB | NO | - | 설정 값 |
| description | TEXT | YES | - | 설명 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |
| updated_at | TIMESTAMP | NO | now() | 수정일시 |

---

## 4. ENUM 정의

### 4.1 User Enums
```sql
CREATE TYPE auth_provider AS ENUM ('local', 'google');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'withdrawn');
```

### 4.2 Family Enums
```sql
CREATE TYPE family_group_status AS ENUM ('active', 'dissolved');
CREATE TYPE invite_code_status AS ENUM ('pending', 'used', 'expired', 'revoked');
CREATE TYPE share_status AS ENUM ('full', 'balance_only', 'private');
```

### 4.3 Mission Enums
```sql
CREATE TYPE mission_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE mission_type AS ENUM ('template', 'custom');
CREATE TYPE mission_level AS ENUM ('main', 'monthly', 'weekly', 'daily');
CREATE TYPE category_status AS ENUM ('active', 'inactive');
```

### 4.4 Transaction Enums
```sql
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal');
```

### 4.5 Badge Enums
```sql
CREATE TYPE badge_type AS ENUM ('lifecycle', 'streak', 'family');
CREATE TYPE badge_status AS ENUM ('active', 'inactive');
CREATE TYPE badge_issue_type AS ENUM ('auto', 'manual');
```

### 4.6 Admin Enums
```sql
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin');
CREATE TYPE admin_status AS ENUM ('active', 'inactive');
CREATE TYPE display_type AS ENUM ('popup', 'banner');
CREATE TYPE announcement_status AS ENUM ('active', 'inactive');
```

### 4.7 Token Enums
```sql
CREATE TYPE token_type AS ENUM ('email_verify', 'password_reset');
```

---

## 5. 마이그레이션 명령어

```bash
# 마이그레이션 생성
npm run migration:generate -- src/database/migrations/MigrationName

# 마이그레이션 실행
npm run migration:run

# 마이그레이션 롤백
npm run migration:revert

# 마이그레이션 상태 확인
npm run migration:show
```

---

## 문서 버전
- **버전**: 1.0.0
- **작성일**: 2025-01-22
- **작성자**: Nestack 개발팀
