import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { useForgotPassword } from '@/features/auth/hooks'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/schemas'

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, isSuccess } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword({ email: data.email })
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-lg text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <CheckCircle className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">이메일 발송 완료</h1>
            <p className="mt-2 text-stone-500">
              비밀번호 재설정 링크가 발송되었습니다.<br />
              이메일을 확인해주세요.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                로그인으로 돌아가기
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
              <Mail className="h-8 w-8 text-stone-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">비밀번호 찾기</h1>
            <p className="mt-2 text-stone-500">
              가입한 이메일로 재설정 링크를 보내드립니다
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              재설정 링크 보내기
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
