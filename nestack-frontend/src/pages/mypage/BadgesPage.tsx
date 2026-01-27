import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X, Lock } from 'lucide-react'
import { AppShell, Page } from '@/shared/components/layout'
import { Card } from '@/shared/components/ui/Card'
import { ProgressBar } from '@/shared/components/ui/ProgressBar'
import { Skeleton } from '@/shared/components/feedback'
import { useBadges, useBadgeDetail } from '@/features/badge/hooks'
import type { Badge, UserBadge } from '@/features/badge/types'

// Badge icon background colors based on category
const categoryColors: Record<string, string> = {
  mission: 'bg-yellow-100',
  finance: 'bg-blue-100',
  family: 'bg-pink-100',
  streak: 'bg-green-100',
  special: 'bg-purple-100',
}

interface BadgeCardProps {
  badge: Badge
  earned: boolean
  earnedAt?: string
  onClick: () => void
}

function BadgeCard({ badge, earned, earnedAt, onClick }: BadgeCardProps) {
  const bgColor = earned ? categoryColors[badge.category] || 'bg-stone-100' : 'bg-stone-100'

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md ${
        !earned ? 'opacity-50' : ''
      }`}
    >
      <div
        className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${bgColor}`}
      >
        {earned ? badge.icon : <Lock className="h-6 w-6 text-stone-400" />}
      </div>
      <p className="text-sm font-medium text-stone-900">{badge.name}</p>
      <p className="text-xs text-stone-500">
        {earned && earnedAt
          ? new Date(earnedAt).toLocaleDateString('ko-KR')
          : '???'}
      </p>
    </button>
  )
}

interface BadgeDetailModalProps {
  badgeId: string
  onClose: () => void
}

function BadgeDetailModal({ badgeId, onClose }: BadgeDetailModalProps) {
  const { data: detail, isLoading } = useBadgeDetail(badgeId)

  if (isLoading || !detail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  const { badge, earned, earnedAt, progress, currentValue, targetValue } = detail
  const bgColor = earned ? categoryColors[badge.category] || 'bg-stone-100' : 'bg-stone-100'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${bgColor}`}>
            {earned ? badge.icon : <Lock className="h-6 w-6 text-stone-400" />}
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 transition-colors hover:text-stone-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <h2 className="mb-2 text-xl font-bold text-stone-900">{badge.name}</h2>
        <p className="mb-4 text-sm text-stone-600">{badge.description}</p>

        <div className="mb-4 rounded-lg bg-stone-50 p-3">
          <p className="mb-1 text-xs font-medium text-stone-500">획득 조건</p>
          <p className="text-sm text-stone-700">{badge.requirement}</p>
        </div>

        {earned ? (
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-sm font-medium text-green-700">
              {earnedAt && new Date(earnedAt).toLocaleDateString('ko-KR')}에 획득
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">진행률</span>
              <span className="font-medium text-stone-900">
                {currentValue} / {targetValue}
              </span>
            </div>
            <ProgressBar value={progress} max={100} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function BadgesPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useBadges()
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null)

  const earnedBadges = data?.earnedBadges || []
  const availableBadges = data?.availableBadges || []

  return (
    <AppShell showBottomNav={false}>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1 text-stone-600 transition-colors hover:bg-stone-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-stone-900">뱃지</h1>
        </div>
      </header>

      <Page>
        {isLoading ? (
          <div className="space-y-6">
            <section>
              <Skeleton className="mb-4 h-6 w-32" />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="mx-auto mb-2 h-16 w-16 rounded-full" />
                    <Skeleton className="mx-auto h-4 w-16" />
                    <Skeleton className="mx-auto mt-1 h-3 w-12" />
                  </Card>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Earned Badges */}
            <section>
              <h2 className="mb-4 font-semibold text-stone-900">
                획득한 뱃지 ({earnedBadges.length})
              </h2>
              {earnedBadges.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-stone-500">아직 획득한 뱃지가 없습니다.</p>
                  <p className="mt-1 text-sm text-stone-400">미션을 완료하여 뱃지를 획득해보세요!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {earnedBadges.map((userBadge: UserBadge) => (
                    <BadgeCard
                      key={userBadge.id}
                      badge={userBadge.badge}
                      earned={true}
                      earnedAt={userBadge.earnedAt}
                      onClick={() => setSelectedBadgeId(userBadge.badge.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Available Badges */}
            <section>
              <h2 className="mb-4 font-semibold text-stone-900">
                미획득 뱃지 ({availableBadges.length})
              </h2>
              {availableBadges.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-stone-500">모든 뱃지를 획득했습니다!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {availableBadges.map((badge: Badge) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      earned={false}
                      onClick={() => setSelectedBadgeId(badge.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </Page>

      {/* Badge Detail Modal */}
      {selectedBadgeId && (
        <BadgeDetailModal
          badgeId={selectedBadgeId}
          onClose={() => setSelectedBadgeId(null)}
        />
      )}
    </AppShell>
  )
}
