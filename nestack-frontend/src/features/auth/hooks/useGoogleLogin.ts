import { useGoogleLogin as useGoogleOAuthLogin } from '@react-oauth/google'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/app/store'
import { authApi } from '../api/authApi'
import { AUTH_QUERY_KEY } from './useAuth'
import { showToast } from '@/shared/components/feedback'

export function useGoogleLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setTokens, setUser } = useAppStore()

  const googleLoginMutation = useMutation({
    mutationFn: (idToken: string) => authApi.googleLogin({ idToken }),
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

  const login = useGoogleOAuthLogin({
    onSuccess: async (tokenResponse) => {
      // Get ID token from access token using userinfo endpoint
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to get user info')
        }

        // Since we're using implicit flow, we need to use the access token
        // The backend should be configured to accept access tokens and verify them
        googleLoginMutation.mutate(tokenResponse.access_token)
      } catch (error) {
        showToast.error('로그인 실패', 'Google 사용자 정보를 가져오는데 실패했습니다')
      }
    },
    onError: (error) => {
      console.error('Google Login Error:', error)
      showToast.error('로그인 실패', 'Google 로그인이 취소되었습니다')
    },
  })

  return {
    login,
    isLoading: googleLoginMutation.isPending,
  }
}
