import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { showToast } from '@/shared/components/feedback'
import type { SignupRequest } from '../types'

export function useSignup() {
  const navigate = useNavigate()

  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: () => {
      showToast.success(
        '회원가입 완료',
        '인증 이메일이 발송되었습니다. 이메일을 확인해주세요.'
      )
      // Redirect to verify email page
      navigate('/verify-email')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '회원가입에 실패했습니다'
      showToast.error('회원가입 실패', message)
    },
  })

  return {
    signup: signupMutation.mutate,
    signupAsync: signupMutation.mutateAsync,
    isLoading: signupMutation.isPending,
    error: signupMutation.error,
  }
}
