import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/app/store'
import { authApi } from '../api/authApi'
import { AUTH_QUERY_KEY } from './useAuth'
import { showToast } from '@/shared/components/feedback'
import type { LoginRequest, GoogleLoginRequest } from '../types'

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setTokens, setUser } = useAppStore()

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setTokens(response.accessToken, response.refreshToken)
      setUser(response.user)
      queryClient.setQueryData(AUTH_QUERY_KEY, response.user)

      showToast.success('로그인 성공', `${response.user.name}님, 환영합니다!`)

      // Redirect based on family group status
      if (!response.user.familyGroupId) {
        navigate('/onboarding')
      } else {
        navigate('/')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '로그인에 실패했습니다'
      showToast.error('로그인 실패', message)
    },
  })

  const googleLoginMutation = useMutation({
    mutationFn: (data: GoogleLoginRequest) => authApi.googleLogin(data),
    onSuccess: (response) => {
      setTokens(response.accessToken, response.refreshToken)
      setUser(response.user)
      queryClient.setQueryData(AUTH_QUERY_KEY, response.user)

      showToast.success('로그인 성공', `${response.user.name}님, 환영합니다!`)

      if (!response.user.familyGroupId) {
        navigate('/onboarding')
      } else {
        navigate('/')
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Google 로그인에 실패했습니다'
      showToast.error('로그인 실패', message)
    },
  })

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    googleLogin: googleLoginMutation.mutate,
    googleLoginAsync: googleLoginMutation.mutateAsync,
    isLoading: loginMutation.isPending || googleLoginMutation.isPending,
    error: loginMutation.error || googleLoginMutation.error,
  }
}
