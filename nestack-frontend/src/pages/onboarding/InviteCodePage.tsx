import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Copy, RefreshCw, Share2, ArrowLeft, CheckCircle, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { useInviteCode, useJoinFamily } from '@/features/family/hooks'

export default function InviteCodePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialMode = searchParams.get('mode') === 'join' ? 'join' : 'create'
  const [mode, setMode] = useState<'create' | 'join'>(initialMode)
  const [inputCode, setInputCode] = useState('')

  const {
    inviteCode,
    isLoading: isLoadingCode,
    regenerate,
    isRegenerating,
    copyToClipboard,
  } = useInviteCode()

  const { joinFamily, isLoading: isJoining } = useJoinFamily()

  // Format invite code input (XXXX-XXXX-XXXX)
  const handleCodeInput = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

    // Add dashes at appropriate positions
    let formatted = ''
    for (let i = 0; i < cleaned.length && i < 12; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += '-'
      }
      formatted += cleaned[i]
    }

    setInputCode(formatted)
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputCode.replace(/-/g, '').length === 12) {
      joinFamily(inputCode.replace(/-/g, ''))
    }
  }

  const handleShare = async () => {
    if (!inviteCode?.code) return

    const shareData = {
      title: 'Nestack 초대',
      text: `Nestack에서 함께 재정 목표를 달성해요! 초대 코드: ${formatCode(inviteCode.code)}`,
      url: window.location.origin,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or share failed
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const formatCode = (code: string) => {
    return code.match(/.{1,4}/g)?.join('-') || code
  }

  const getExpiryText = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? `${diffDays}일 후 만료` : '만료됨'
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/onboarding')}
          className="mb-4 flex items-center text-sm text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          돌아가기
        </button>

        {/* Mode Toggle */}
        <div className="mb-6 flex rounded-lg bg-stone-200 p-1">
          <button
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === 'create' ? 'bg-white shadow' : 'text-stone-600'
            }`}
            onClick={() => setMode('create')}
          >
            초대 코드 생성
          </button>
          <button
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === 'join' ? 'bg-white shadow' : 'text-stone-600'
            }`}
            onClick={() => setMode('join')}
          >
            초대 코드 입력
          </button>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {mode === 'create' ? (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-stone-900">초대 코드</h1>
                <p className="mt-2 text-stone-500">
                  파트너에게 공유할 초대 코드입니다
                </p>
              </div>

              {isLoadingCode ? (
                <div className="mb-6 rounded-lg bg-stone-100 p-6 text-center">
                  <div className="h-8 w-48 mx-auto animate-pulse rounded bg-stone-200" />
                </div>
              ) : inviteCode ? (
                <div className="mb-6 rounded-lg bg-stone-100 p-6 text-center">
                  <p className="text-sm text-stone-500">초대 코드</p>
                  <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-primary-600">
                    {formatCode(inviteCode.code)}
                  </p>
                  <p className="mt-2 text-xs text-stone-400">
                    {getExpiryText(inviteCode.expiresAt)}
                  </p>
                </div>
              ) : (
                <div className="mb-6 rounded-lg bg-stone-100 p-6 text-center">
                  <p className="text-stone-500">초대 코드가 없습니다</p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={copyToClipboard}
                  disabled={!inviteCode}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  코드 복사하기
                </Button>

                <Button
                  className="w-full"
                  onClick={handleShare}
                  disabled={!inviteCode}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  공유하기
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => regenerate()}
                  isLoading={isRegenerating}
                  disabled={!inviteCode}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  코드 재발급
                </Button>
              </div>

              <p className="mt-6 text-center text-xs text-stone-400">
                파트너가 이 코드를 입력하면 자동으로 연결됩니다
              </p>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-100">
                  <CheckCircle className="h-8 w-8 text-accent-600" />
                </div>
                <h1 className="text-2xl font-bold text-stone-900">초대 코드 입력</h1>
                <p className="mt-2 text-stone-500">
                  파트너에게 받은 초대 코드를 입력하세요
                </p>
              </div>

              <form onSubmit={handleJoin} className="space-y-4">
                <Input
                  type="text"
                  value={inputCode}
                  onChange={(e) => handleCodeInput(e.target.value)}
                  className="text-center font-mono text-xl tracking-widest"
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={14}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isJoining}
                  disabled={inputCode.replace(/-/g, '').length !== 12}
                >
                  연결하기
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-stone-400">
                초대 코드는 12자리 영문/숫자로 구성되어 있습니다
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
