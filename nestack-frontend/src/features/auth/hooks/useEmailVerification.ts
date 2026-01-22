import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { showToast } from '@/shared/components/feedback'

export function useEmailVerification() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  // Auto-verify when token is present
  const verifyQuery = useQuery({
    queryKey: ['auth', 'verify-email', token],
    queryFn: () => authApi.verifyEmail(token!),
    enabled: !!token,
    retry: false,
  })

  // Handle successful verification
  if (verifyQuery.isSuccess && verifyQuery.data) {
    showToast.success('이메일 인증 완료', '로그인해주세요.')
    navigate('/login')
  }

  // Handle verification error
  if (verifyQuery.isError) {
    showToast.error('인증 실패', '유효하지 않거나 만료된 링크입니다.')
  }

  // Resend verification email
  const resendMutation = useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
    onSuccess: () => {
      showToast.success('이메일 발송 완료', '인증 이메일이 재발송되었습니다.')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '이메일 발송에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    token,
    isVerifying: verifyQuery.isLoading,
    isVerified: verifyQuery.isSuccess,
    verifyError: verifyQuery.error,
    resendVerification: resendMutation.mutate,
    isResending: resendMutation.isPending,
  }
}
