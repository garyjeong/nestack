export * from './error-codes.constant';

// System Settings Keys
export const SYSTEM_SETTINGS = {
  INVITE_CODE_EXPIRY_DAYS: 'invite_code_expiry_days',
  INVITE_CODE_LENGTH: 'invite_code_length',
  MAX_FAMILY_MEMBERS: 'max_family_members',
  DEFAULT_SHARE_STATUS: 'default_share_status',
} as const;

// Default Values
export const DEFAULTS = {
  INVITE_CODE_EXPIRY_DAYS: 7,
  INVITE_CODE_LENGTH: 12,
  MAX_FAMILY_MEMBERS: 2,
  DEFAULT_SHARE_STATUS: 'private',
  PAGINATION_LIMIT: 20,
  MAX_PAGINATION_LIMIT: 100,
} as const;

// Password Rules
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  PATTERN: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
  MESSAGE: '비밀번호는 8자 이상, 영문/숫자/특수문자 조합이어야 합니다.',
} as const;
