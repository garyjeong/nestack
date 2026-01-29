import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { PasswordStrength, PasswordMatch } from '@/shared/components/ui/PasswordStrength'
import { useResetPassword } from '@/features/auth/hooks'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/features/auth/schemas'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const { resetPassword, isLoading } = useResetPassword()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  // 실시간 비밀번호 검증을 위한 watch
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password')
    }
  }, [token, navigate])

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return

    resetPassword({
      token,
      password: data.password,
    })
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-lg text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">잘못된 접근</h1>
            <p className="mt-2 text-stone-500">
              유효하지 않은 링크입니다.<br />
              비밀번호 재설정을 다시 요청해주세요.
            </p>
            <Link to="/forgot-password">
              <Button variant="outline" className="mt-6">
                비밀번호 찾기로 이동
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
              <Lock className="h-8 w-8 text-stone-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">비밀번호 재설정</h1>
            <p className="mt-2 text-stone-500">새로운 비밀번호를 입력해주세요</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                label="새 비밀번호"
                type="password"
                placeholder="8자 이상, 영문/숫자/특수문자"
                error={errors.password?.message}
                {...register('password')}
              />
              <PasswordStrength password={password || ''} />
            </div>

            <div className="space-y-2">
              <Input
                label="비밀번호 확인"
                type="password"
                placeholder="비밀번호 재입력"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <PasswordMatch
                password={password || ''}
                confirmPassword={confirmPassword || ''}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              비밀번호 변경
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            <Link
              to="/login"
              className="inline-flex items-center font-medium text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              로그인으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
