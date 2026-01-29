// User types
export interface User {
  id: string
  email: string
  name: string
  profileImage?: string | null
  emailVerified: boolean
  provider: 'google'
  status: 'active' | 'inactive' | 'suspended'
  familyGroupId?: string | null
  createdAt: string
  updatedAt: string
}

export interface GoogleLoginRequest {
  idToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse extends AuthTokens {
  userId: string
  email: string
  name: string
  tokens: {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
  }
}

export interface RefreshResponse extends AuthTokens {}
