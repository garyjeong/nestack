import { apiClient } from '../../../api/client'
import { API_ENDPOINTS } from '../../../api/endpoints'
import type {
  LoginResponse,
  GoogleLoginRequest,
  RefreshTokenRequest,
  RefreshResponse,
  User,
} from '../types'

export const authApi = {
  googleLogin: (data: GoogleLoginRequest) =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.GOOGLE, data),

  logout: (logoutAll?: boolean) =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { logoutAll }),

  refresh: (data: RefreshTokenRequest) =>
    apiClient.post<RefreshResponse>(API_ENDPOINTS.AUTH.REFRESH, data),

  getMe: () => apiClient.get<User>(API_ENDPOINTS.USERS.ME),

  updateProfile: (data: { name?: string }) =>
    apiClient.put<User>(API_ENDPOINTS.USERS.ME, data),
}
