import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { useEmailVerification } from '@/features/auth/hooks'

export default function VerifyEmailPage() {
  const {
    token,
    isVerifying,
    isVerified,
    verifyError,
    resendVerification,
    isResending,
  } = useEmailVerification()

  const [resendEmail, setResendEmail] = useState('')
  const [showResendForm, setShowResendForm] = useState(false)

  const handleResend = () => {
    if (resendEmail) {
      resendVerification(resendEmail)
    }
  }

  // Verifying state (with token)
  if (token && isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-lg text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">이메일 인증 중...</h1>
            <p className="mt-2 text-stone-500">잠시만 기다려주세요</p>
          </div>
        </div>
      </div>
    )
  }

  // Verification success
  if (isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-lg text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <CheckCircle className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">인증 완료!</h1>
            <p className="mt-2 text-stone-500">
              이메일 인증이 완료되었습니다.<br />
              이제 로그인하실 수 있습니다.
            </p>
            <Link to="/login">
              <Button className="mt-6">로그인하기</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Verification error
  if (token && verifyError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-lg text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">인증 실패</h1>
            <p className="mt-2 text-stone-500">
              유효하지 않거나 만료된 인증 링크입니다.<br />
              인증 이메일을 다시 요청해주세요.
            </p>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="가입한 이메일 주소"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
                <Button
                  onClick={handleResend}
                  isLoading={isResending}
                  disabled={!resendEmail}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  인증 이메일 재발송
                </Button>
              </div>

              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  로그인으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default: waiting for email verification (no token)
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Mail className="h-8 w-8 text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">이메일을 확인해주세요</h1>
          <p className="mt-2 text-stone-500">
            인증 메일이 발송되었습니다.<br />
            메일함을 확인하고 인증 링크를 클릭해주세요.
          </p>

          <div className="mt-6 space-y-4">
            {showResendForm ? (
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="가입한 이메일 주소"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
                <Button
                  onClick={handleResend}
                  isLoading={isResending}
                  disabled={!resendEmail}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  인증 이메일 재발송
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowResendForm(true)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                이메일을 받지 못하셨나요?
              </button>
            )}

            <Link
              to="/login"
              className="block text-sm text-stone-500 hover:text-stone-700"
            >
              <ArrowLeft className="mr-1 inline h-4 w-4" />
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
