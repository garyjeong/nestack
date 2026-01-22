// User types
export interface User {
  id: string
  email: string
  name: string
  profileImage?: string | null
  emailVerified: boolean
  provider: 'local' | 'google'
  status: 'active' | 'inactive' | 'suspended'
  familyGroupId?: string | null
  createdAt: string
  updatedAt: string
}

// Auth request DTOs
export interface SignupRequest {
  email: string
  password: string
  name: string
  termsAgreed: boolean
  privacyAgreed: boolean
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface GoogleLoginRequest {
  idToken: string
  rememberMe?: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// Auth response DTOs
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface SignupResponse {
  user: User
  message: string
}

export interface LoginResponse extends AuthTokens {
  user: User
}

export interface RefreshResponse extends AuthTokens {}

export interface VerifyEmailResponse {
  message: string
  user: User
}

// Validation schemas
export const AUTH_VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '올바른 이메일 형식이 아닙니다',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다',
  },
  name: {
    minLength: 2,
    maxLength: 50,
    message: '이름은 2-50자 사이여야 합니다',
  },
}
