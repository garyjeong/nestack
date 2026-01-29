import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Flame, Target, Home, Heart, Plane, Sparkles } from 'lucide-react'
import { AppShell, Page, AnimatedSection, AnimatedList, AnimatedItem } from '@/shared/components/layout'
import { Card } from '@/shared/components/ui/Card'
import { Chip } from '@/shared/components/ui/Chip'
import { ProgressBar } from '@/shared/components/ui/ProgressBar'
import { CurrencyDisplay, PercentDisplay } from '@/shared/components/ui/CountUpNumber'
import { GradientCircularProgress } from '@/shared/components/ui/CircularProgress'
import { NoMissionsEmpty } from '@/shared/components/feedback'
import { useMissions, useMissionSummary } from '@/features/mission/hooks'
import type { MissionStatus, MissionFilters } from '@/features/mission/types'
import { cn } from '@/shared/utils/cn'

// 카테고리 옵션
const categoryOptions = [
  { value: 'all', label: '전체', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'housing', label: '주거', icon: <Home className="h-4 w-4" /> },
  { value: 'wedding', label: '결혼', icon: <Heart className="h-4 w-4" /> },
  { value: 'travel', label: '여행', icon: <Plane className="h-4 w-4" /> },
]

// 상태 옵션
const statusOptions = [
  { value: 'all' as const, label: '전체' },
  { value: 'in_progress' as const, label: '진행중' },
  { value: 'completed' as const, label: '완료' },
  { value: 'pending' as const, label: '대기' },
]

// 카테고리 아이콘 매핑
const categoryIcons: Record<string, React.ReactNode> = {
  housing: <Home className="h-5 w-5" />,
  wedding: <Heart className="h-5 w-5" />,
  travel: <Plane className="h-5 w-5" />,
  default: <Target className="h-5 w-5" />,
}

export default function MissionsPage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<MissionStatus | 'all'>('all')

  const filters: MissionFilters = {
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  }

  const { missions, isLoading } = useMissions(filters)
  const { summary } = useMissionSummary()

  // 연속 저축일 (목업)
  const streakDays = 14

  return (
    <AppShell>
      {/* 모바일 헤더 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto">
          <h1 className="text-xl font-bold text-stone-900">미션</h1>
        </div>
      </header>

      <Page className="pb-24">
        {/* 게이미피케이션 배너 */}
        <AnimatedSection className="mb-6" delay={0}>
          <Card className="gradient-primary p-5 text-white relative overflow-hidden">
            {/* 배경 데코 */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full" />

            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <Flame className="h-7 w-7 text-orange-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{streakDays}일</span>
                  <span className="text-white/80 text-sm">연속 저축 중!</span>
                </div>
                <p className="text-white/70 text-sm mt-0.5">
                  스트릭 뱃지까지 {21 - streakDays}일 남았어요
                </p>
              </div>
            </div>

            {/* 프로그레스 */}
            <div className="mt-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${(streakDays / 21) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </AnimatedSection>

        {/* 요약 통계 */}
        {summary && (
          <AnimatedSection className="mb-6" delay={0.1}>
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {summary.activeMissions}
                </p>
                <p className="text-xs text-stone-500 mt-1">진행중</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-stone-900">
                  {summary.completedMissions}
                </p>
                <p className="text-xs text-stone-500 mt-1">완료</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-lg font-bold text-stone-900">
                  <CurrencyDisplay value={summary.totalSavedAmount} duration={600} />
                </p>
                <p className="text-xs text-stone-500 mt-1">총 저축</p>
              </Card>
            </div>
          </AnimatedSection>
        )}

        {/* 카테고리 필터 - Chip 스타일 */}
        <AnimatedSection className="mb-4" delay={0.15}>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {categoryOptions.map((option) => (
              <Chip
                key={option.value}
                icon={option.icon}
                selected={selectedCategory === option.value}
                onClick={() => setSelectedCategory(option.value)}
                size="lg"
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </AnimatedSection>

        {/* 상태 필터 */}
        <AnimatedSection className="mb-6" delay={0.2}>
          <div className="flex gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-[0.97]',
                  selectedStatus === option.value
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:bg-stone-100'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* 미션 목록 */}
        <AnimatedSection delay={0.25}>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5">
                  <div className="animate-pulse flex gap-4">
                    <div className="h-16 w-16 rounded-full bg-stone-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-32 bg-stone-200 rounded" />
                      <div className="h-4 w-48 bg-stone-100 rounded" />
                      <div className="h-2 w-full bg-stone-100 rounded" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : missions.length === 0 ? (
            <NoMissionsEmpty onAction={() => navigate('/missions/create')} />
          ) : (
            <AnimatedList className="space-y-4">
              {missions.map((mission) => {
                const icon = categoryIcons[mission.category?.id ?? 'default'] || categoryIcons.default
                const isCompleted = mission.status === 'completed'

                return (
                  <AnimatedItem key={mission.id}>
                    <Link to={`/missions/${mission.id}`}>
                      <Card interactive className="p-5">
                      <div className="flex gap-4">
                        {/* 원형 진행률 */}
                        <GradientCircularProgress
                          value={mission.progress}
                          size="lg"
                          showValue={false}
                        >
                          <div className={cn(
                            isCompleted ? 'text-primary-500' : 'text-stone-400'
                          )}>
                            {icon}
                          </div>
                        </GradientCircularProgress>

                        {/* 미션 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-stone-900 truncate">
                              {mission.name}
                            </h3>
                            <span className={cn(
                              'flex-shrink-0 text-sm font-semibold',
                              isCompleted ? 'text-primary-500' : 'text-stone-600'
                            )}>
                              <PercentDisplay value={mission.progress} duration={400} />
                            </span>
                          </div>

                          <p className="text-sm text-stone-500 mb-3">
                            {mission.category?.name} · D-{mission.daysRemaining}
                          </p>

                          {/* 금액 진행 */}
                          <div className="space-y-2">
                            <ProgressBar
                              value={mission.progress}
                              variant="gradient"
                              size="sm"
                              animated
                            />
                            <div className="flex justify-between text-xs">
                              <span className="text-stone-500">
                                <CurrencyDisplay value={mission.currentAmount} duration={400} />
                              </span>
                              <span className="text-stone-400">
                                <CurrencyDisplay value={mission.targetAmount} duration={400} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 파트너 공유 표시 */}
                      {mission.familyGroupId && (
                        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <div className="h-6 w-6 rounded-full bg-primary-100 border-2 border-white" />
                            <div className="h-6 w-6 rounded-full bg-accent-100 border-2 border-white" />
                          </div>
                          <span className="text-xs text-stone-500">파트너와 함께</span>
                        </div>
                      )}
                      </Card>
                    </Link>
                  </AnimatedItem>
                )
              })}
            </AnimatedList>
          )}
        </AnimatedSection>
      </Page>

      {/* FAB - 앱 컨테이너 내 고정 */}
      <div className="fixed bottom-20 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 pointer-events-none">
        <Link
          to="/missions/create"
          className="absolute bottom-0 right-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 pointer-events-auto"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </AppShell>
  )
}
