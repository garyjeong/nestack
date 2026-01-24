-- Flyway migration script V1
-- Initial database schema for Nestack

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);

-- Family Groups Table
CREATE TABLE IF NOT EXISTS family_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(500),
    provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    family_group_id UUID REFERENCES family_groups(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_family_group ON users(family_group_id);
CREATE INDEX IF NOT EXISTS idx_user_provider ON users(provider, provider_id);

-- Invite Codes Table
CREATE TABLE IF NOT EXISTS invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(12) UNIQUE NOT NULL,
    family_group_id UUID NOT NULL REFERENCES family_groups(id),
    created_by UUID NOT NULL,
    used_by UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invite_code_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_code_family_group ON invite_codes(family_group_id);

-- Lifecycle Categories Table
CREATE TABLE IF NOT EXISTS lifecycle_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Mission Templates Table
CREATE TABLE IF NOT EXISTS mission_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES lifecycle_categories(id),
    goal_type VARCHAR(50) NOT NULL DEFAULT 'AMOUNT',
    default_goal_amount DECIMAL(18, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    usage_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mission_template_category ON mission_templates(category_id);

-- Missions Table
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    family_group_id UUID REFERENCES family_groups(id),
    template_id UUID REFERENCES mission_templates(id),
    category_id UUID NOT NULL REFERENCES lifecycle_categories(id),
    parent_mission_id UUID REFERENCES missions(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    goal_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    current_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    mission_type VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',
    mission_level VARCHAR(50) NOT NULL DEFAULT 'MAIN',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    start_date DATE,
    due_date DATE NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mission_user ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_family_group ON missions(family_group_id);
CREATE INDEX IF NOT EXISTS idx_mission_parent ON missions(parent_mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_status ON missions(status);

-- Bank Accounts Table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    bank_code VARCHAR(10) NOT NULL,
    bank_name VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_number_masked VARCHAR(50) NOT NULL,
    account_alias VARCHAR(100),
    account_type VARCHAR(50),
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0,
    fintech_use_num VARCHAR(100) NOT NULL,
    share_status VARCHAR(50) NOT NULL DEFAULT 'PRIVATE',
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bank_account_user ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_account_fintech ON bank_accounts(fintech_use_num);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
    transaction_id VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'DEPOSIT',
    amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    balance_after DECIMAL(18, 2) NOT NULL DEFAULT 0,
    description VARCHAR(255),
    counterparty VARCHAR(100),
    transaction_date DATE NOT NULL,
    transaction_time TIME,
    mission_id UUID REFERENCES missions(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transaction_bank_account ON transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_transaction_mission ON transactions(mission_id);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON transactions(transaction_date);

-- Mission Shared Accounts Table
CREATE TABLE IF NOT EXISTS mission_shared_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID NOT NULL REFERENCES missions(id),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mission_shared_account ON mission_shared_accounts(mission_id, bank_account_id);

-- Badges Table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    badge_type VARCHAR(50) NOT NULL DEFAULT 'LIFECYCLE',
    condition_type VARCHAR(50) NOT NULL,
    condition_value JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    badge_id UUID NOT NULL REFERENCES badges(id),
    issue_type VARCHAR(50) NOT NULL DEFAULT 'AUTO',
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    issued_by UUID
);

CREATE INDEX IF NOT EXISTS idx_user_badge ON user_badges(user_id, badge_id);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    display_type VARCHAR(50) NOT NULL DEFAULT 'BANNER',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_by UUID NOT NULL REFERENCES admin_users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    device_info VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_token_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_token ON refresh_tokens(token);

-- Email Verification Tokens Table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'EMAIL_VERIFY',
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_token_user ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_token_token ON email_verification_tokens(token);

-- OpenBanking Tokens Table
CREATE TABLE IF NOT EXISTS openbanking_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_type VARCHAR(50) NOT NULL,
    scope VARCHAR(255) NOT NULL,
    user_seq_no VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default lifecycle categories
INSERT INTO lifecycle_categories (id, name, display_order, status) VALUES
    (uuid_generate_v4(), '결혼', 1, 'ACTIVE'),
    (uuid_generate_v4(), '내 집 마련', 2, 'ACTIVE'),
    (uuid_generate_v4(), '출산/육아', 3, 'ACTIVE'),
    (uuid_generate_v4(), '교육', 4, 'ACTIVE'),
    (uuid_generate_v4(), '은퇴', 5, 'ACTIVE'),
    (uuid_generate_v4(), '기타', 6, 'ACTIVE')
ON CONFLICT DO NOTHING;
