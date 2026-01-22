import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { useSignup } from '@/features/auth/hooks'
import { signupSchema, type SignupFormData } from '@/features/auth/schemas'

export default function SignupPage() {
  const { signup, isLoading } = useSignup()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: SignupFormData) => {
    if (!termsAccepted || !privacyAccepted) {
      return
    }

    signup({
      email: data.email,
      password: data.password,
      name: data.name,
      termsAgreed: termsAccepted,
      privacyAgreed: privacyAccepted,
    })
  }

  const isFormValid = termsAccepted && privacyAccepted

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-stone-900">회원가입</h1>
            <p className="mt-2 text-stone-500">Nestack과 함께 시작하세요</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="이름"
              type="text"
              placeholder="홍길동"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="이메일"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="8자 이상, 영문/숫자/특수문자"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호 재입력"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="space-y-2">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-stone-600">
                  <Link to="/terms" className="text-primary-600 hover:underline">
                    이용약관
                  </Link>
                  에 동의합니다 (필수)
                </span>
              </label>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-stone-600">
                  <Link to="/privacy" className="text-primary-600 hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의합니다 (필수)
                </span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={!isFormValid}
            >
              회원가입
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            이미 계정이 있으신가요?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
