import { apiClient, extractData, type ApiResponse } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  GoogleLoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  RefreshResponse,
  VerifyEmailResponse,
  User,
} from '../types'

export const authApi = {
  // 회원가입
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await apiClient.post<ApiResponse<SignupResponse>>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    )
    return extractData(response)
  },

  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    )
    return extractData(response)
  },

  // Google 로그인
  googleLogin: async (data: GoogleLoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.GOOGLE,
      data
    )
    return extractData(response)
  },

  // 로그아웃
  logout: async (logoutAll = false): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { logoutAll })
  },

  // 토큰 갱신
  refresh: async (data: RefreshTokenRequest): Promise<RefreshResponse> => {
    const response = await apiClient.post<ApiResponse<RefreshResponse>>(
      API_ENDPOINTS.AUTH.REFRESH,
      data
    )
    return extractData(response)
  },

  // 이메일 인증
  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await apiClient.get<ApiResponse<VerifyEmailResponse>>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      { params: { token } }
    )
    return extractData(response)
  },

  // 이메일 인증 재발송
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      { email }
    )
    return extractData(response)
  },

  // 비밀번호 찾기
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    )
    return extractData(response)
  },

  // 비밀번호 재설정
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    )
    return extractData(response)
  },

  // 현재 사용자 정보 조회
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.USERS.ME
    )
    return extractData(response)
  },
}
