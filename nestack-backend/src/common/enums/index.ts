// User related enums
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  KAKAO = 'KAKAO',
  APPLE = 'APPLE',
}

// Family related enums
export enum FamilyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum InviteCodeStatus {
  PENDING = 'PENDING',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// Mission related enums
export enum MissionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MissionType {
  TEMPLATE = 'TEMPLATE',
  CUSTOM = 'CUSTOM',
}

export enum MissionLevel {
  MAIN = 'MAIN',
  SUB = 'SUB',
}

export enum GoalType {
  AMOUNT = 'AMOUNT',
  COUNT = 'COUNT',
  PERCENTAGE = 'PERCENTAGE',
}

// Finance related enums
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum ShareStatus {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED',
}

// Badge related enums
export enum BadgeType {
  LIFECYCLE = 'LIFECYCLE',
  ACHIEVEMENT = 'ACHIEVEMENT',
  STREAK = 'STREAK',
  SPECIAL = 'SPECIAL',
}

export enum BadgeConditionType {
  MISSION_COMPLETE = 'MISSION_COMPLETE',
  SAVINGS_AMOUNT = 'SAVINGS_AMOUNT',
  STREAK_DAYS = 'STREAK_DAYS',
  CATEGORY_COMPLETE = 'CATEGORY_COMPLETE',
  FIRST_ACTION = 'FIRST_ACTION',
}

export enum BadgeIssueType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

// Admin related enums
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

export enum AdminStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum AnnouncementDisplayType {
  BANNER = 'BANNER',
  POPUP = 'POPUP',
  NOTICE = 'NOTICE',
}

export enum AnnouncementStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// Token related enums
export enum TokenType {
  EMAIL_VERIFY = 'EMAIL_VERIFY',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

// Category status
export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
