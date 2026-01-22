import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { showToast } from '@/shared/components/feedback'
import type { ForgotPasswordRequest, ResetPasswordRequest } from '../types'

export function useForgotPassword() {
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: () => {
      showToast.success(
        '이메일 발송 완료',
        '비밀번호 재설정 링크가 이메일로 발송되었습니다.'
      )
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '이메일 발송에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    forgotPassword: forgotPasswordMutation.mutate,
    forgotPasswordAsync: forgotPasswordMutation.mutateAsync,
    isLoading: forgotPasswordMutation.isPending,
    isSuccess: forgotPasswordMutation.isSuccess,
    error: forgotPasswordMutation.error,
  }
}

export function useResetPassword() {
  const navigate = useNavigate()

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      showToast.success(
        '비밀번호 변경 완료',
        '새 비밀번호로 로그인해주세요.'
      )
      navigate('/login')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '비밀번호 변경에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    resetPassword: resetPasswordMutation.mutate,
    resetPasswordAsync: resetPasswordMutation.mutateAsync,
    isLoading: resetPasswordMutation.isPending,
    error: resetPasswordMutation.error,
  }
}
