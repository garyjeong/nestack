import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Users, UserPlus, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { useCreateFamily } from '@/features/family/hooks'
import { useAuth } from '@/features/auth/hooks'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createFamily, isLoading: isCreating } = useCreateFamily()
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select')

  const handleCreateFamily = () => {
    createFamily({})
  }

  const handleJoinFamily = () => {
    navigate('/onboarding/invite?mode=join')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo & Welcome */}
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-500 text-white">
            <Heart className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900">
            환영합니다{user?.name ? `, ${user.name}님` : ''}!
          </h1>
          <p className="mt-3 text-lg text-stone-600">
            Nestack과 함께 커플의 재정 목표를 달성하세요
          </p>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          {/* Create Family Option */}
          <button
            onClick={() => setMode('create')}
            className={`w-full rounded-xl border-2 bg-white p-6 text-left shadow-lg transition ${
              mode === 'create'
                ? 'border-primary-500 ring-2 ring-primary-200'
                : 'border-transparent hover:border-stone-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <UserPlus className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-stone-900">
                  새로운 연결 시작하기
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  초대 코드를 생성하고 파트너에게 공유하세요
                </p>
              </div>
            </div>
          </button>

          {/* Join Family Option */}
          <button
            onClick={() => setMode('join')}
            className={`w-full rounded-xl border-2 bg-white p-6 text-left shadow-lg transition ${
              mode === 'join'
                ? 'border-primary-500 ring-2 ring-primary-200'
                : 'border-transparent hover:border-stone-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100">
                <Users className="h-6 w-6 text-accent-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-stone-900">
                  초대 코드로 연결하기
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  파트너에게 받은 초대 코드를 입력하세요
                </p>
              </div>
            </div>
          </button>

          {/* Action Button */}
          {mode !== 'select' && (
            <Button
              onClick={mode === 'create' ? handleCreateFamily : handleJoinFamily}
              className="w-full"
              size="lg"
              isLoading={isCreating}
            >
              {mode === 'create' ? '초대 코드 생성하기' : '초대 코드 입력하기'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <div className="mt-8">
          <p className="text-sm text-stone-500">
            파트너 연결은 나중에 해도 됩니다
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            나중에 연결하기
          </button>
        </div>
      </div>
    </div>
  )
}
