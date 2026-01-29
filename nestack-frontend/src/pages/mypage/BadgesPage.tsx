import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, Lock } from 'lucide-react'
import { AppShell, Page, AnimatedSection, AnimatedList, AnimatedItem } from '@/shared/components/layout'
import { Card } from '@/shared/components/ui/Card'
import { ProgressBar } from '@/shared/components/ui/ProgressBar'
import { Pressable, SuccessCheck } from '@/shared/components/ui/Interactions'
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
  const bgColor = earned ? categoryColors[badge.category] || 'bg-stone-100 dark:bg-stone-700' : 'bg-stone-100 dark:bg-stone-700'

  return (
    <Pressable pressScale={0.95} onClick={onClick}>
      <div
        className={`w-full rounded-xl bg-white dark:bg-stone-800 p-4 text-center shadow-sm transition-all hover:shadow-md dark:shadow-stone-900/50 ${
          !earned ? 'opacity-50' : ''
        }`}
      >
        <motion.div
          className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${bgColor}`}
          whileHover={earned ? { rotate: [0, -10, 10, -10, 0] } : undefined}
          transition={{ duration: 0.5 }}
        >
          {earned ? badge.icon : <Lock className="h-6 w-6 text-stone-400 dark:text-stone-500" />}
        </motion.div>
        <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{badge.name}</p>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {earned && earnedAt
            ? new Date(earnedAt).toLocaleDateString('ko-KR')
            : '???'}
        </p>
      </div>
    </Pressable>
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
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-4 w-full max-w-sm rounded-2xl bg-white dark:bg-stone-800 p-6 shadow-xl"
        >
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        </motion.div>
      </div>
    )
  }

  const { badge, earned, earnedAt, progress, currentValue, targetValue } = detail
  const bgColor = earned ? categoryColors[badge.category] || 'bg-stone-100 dark:bg-stone-700' : 'bg-stone-100 dark:bg-stone-700'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="mx-4 w-full max-w-sm rounded-2xl bg-white dark:bg-stone-800 p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between">
            <motion.div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${bgColor}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: earned ? [0, 360] : 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {earned ? badge.icon : <Lock className="h-6 w-6 text-stone-400 dark:text-stone-500" />}
            </motion.div>
            <Pressable pressScale={0.9} onClick={onClose}>
              <div className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-300">
                <X className="h-6 w-6" />
              </div>
            </Pressable>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="mb-2 text-xl font-bold text-stone-900 dark:text-stone-100">{badge.name}</h2>
            <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">{badge.description}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 rounded-lg bg-stone-50 dark:bg-stone-700 p-3"
          >
            <p className="mb-1 text-xs font-medium text-stone-500 dark:text-stone-400">획득 조건</p>
            <p className="text-sm text-stone-700 dark:text-stone-300">{badge.requirement}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {earned ? (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/30 p-3 text-center">
                <SuccessCheck show={true} size="sm" className="!h-5 !w-5" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {earnedAt && new Date(earnedAt).toLocaleDateString('ko-KR')}에 획득
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600 dark:text-stone-400">진행률</span>
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {currentValue} / {targetValue}
                  </span>
                </div>
                <ProgressBar value={progress} max={100} />
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
      <header className="sticky top-0 z-20 bg-white dark:bg-stone-900 px-4 py-4 shadow-sm dark:shadow-stone-800/50">
        <div className="flex items-center gap-4">
          <Pressable pressScale={0.9} onClick={() => navigate(-1)}>
            <div className="rounded-lg p-1 text-stone-600 dark:text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800">
              <ArrowLeft className="h-6 w-6" />
            </div>
          </Pressable>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">뱃지</h1>
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
            <AnimatedSection delay={0}>
              <h2 className="mb-4 font-semibold text-stone-900 dark:text-stone-100">
                획득한 뱃지 ({earnedBadges.length})
              </h2>
              {earnedBadges.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-stone-500 dark:text-stone-400">아직 획득한 뱃지가 없습니다.</p>
                  <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">미션을 완료하여 뱃지를 획득해보세요!</p>
                </Card>
              ) : (
                <AnimatedList className="grid grid-cols-3 gap-4">
                  {earnedBadges.map((userBadge: UserBadge) => (
                    <AnimatedItem key={userBadge.id}>
                      <BadgeCard
                        badge={userBadge.badge}
                        earned={true}
                        earnedAt={userBadge.earnedAt}
                        onClick={() => setSelectedBadgeId(userBadge.badge.id)}
                      />
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              )}
            </AnimatedSection>

            {/* Available Badges */}
            <AnimatedSection delay={0.2}>
              <h2 className="mb-4 font-semibold text-stone-900 dark:text-stone-100">
                미획득 뱃지 ({availableBadges.length})
              </h2>
              {availableBadges.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-stone-500 dark:text-stone-400">모든 뱃지를 획득했습니다!</p>
                </Card>
              ) : (
                <AnimatedList className="grid grid-cols-3 gap-4">
                  {availableBadges.map((badge: Badge) => (
                    <AnimatedItem key={badge.id}>
                      <BadgeCard
                        badge={badge}
                        earned={false}
                        onClick={() => setSelectedBadgeId(badge.id)}
                      />
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              )}
            </AnimatedSection>
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
