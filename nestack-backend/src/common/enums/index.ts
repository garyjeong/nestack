// User related enums
export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  WITHDRAWN = 'withdrawn',
}

// Family Group related enums
export enum FamilyGroupStatus {
  ACTIVE = 'active',
  DISSOLVED = 'dissolved',
}

export enum InviteCodeStatus {
  PENDING = 'pending',
  USED = 'used',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum ShareStatus {
  FULL = 'full',
  BALANCE_ONLY = 'balance_only',
  PRIVATE = 'private',
}

// Category related enums
export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// Mission related enums
export enum MissionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum MissionType {
  TEMPLATE = 'template',
  CUSTOM = 'custom',
}

export enum MissionLevel {
  MAIN = 'main',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
}

export enum GoalType {
  AMOUNT = 'amount',
  AMOUNT_COUNT = 'amount_count',
}

// Transaction related enums
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

// Badge related enums
export enum BadgeType {
  LIFECYCLE = 'lifecycle',
  STREAK = 'streak',
  FAMILY = 'family',
}

export enum BadgeIssueType {
  AUTO = 'auto',
  MANUAL = 'manual',
}

// Admin related enums
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
}

export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// Announcement related enums
export enum DisplayType {
  POPUP = 'popup',
  BANNER = 'banner',
}

export enum AnnouncementStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// Token related enums
export enum TokenType {
  EMAIL_VERIFY = 'email_verify',
  PASSWORD_RESET = 'password_reset',
}
