import { Link } from 'react-router-dom'
import { ChevronRight, TrendingUp, TrendingDown, Bell, Home, Heart, Plane, Wallet } from 'lucide-react'
import { AppShell, Page } from '@/shared/components/layout'
import { Card } from '@/shared/components/ui/Card'
import { Avatar } from '@/shared/components/ui/Avatar'
import { CurrencyDisplay, PercentDisplay } from '@/shared/components/ui/CountUpNumber'
import { GradientCircularProgress } from '@/shared/components/ui/CircularProgress'
import { useAppStore } from '@/app/store'
import { useMissionSummary } from '@/features/mission/hooks/useMissionSummary'
import { useMissions } from '@/features/mission/hooks/useMissions'
import { useFinanceSummary } from '@/features/finance/hooks/useFinanceSummary'
import { useTransactions } from '@/features/finance/hooks/useTransactions'
import { cn } from '@/shared/utils/cn'

// 미션 카테고리 아이콘 매핑
const categoryIcons: Record<string, React.ReactNode> = {
  housing: <Home className="h-5 w-5" />,
  wedding: <Heart className="h-5 w-5" />,
  travel: <Plane className="h-5 w-5" />,
  default: <Wallet className="h-5 w-5" />,
}

export default function HomePage() {
  const { user, isSSEConnected } = useAppStore()
  const { summary: missionSummary, isLoading: isLoadingMissionSummary } = useMissionSummary()
  const { missions: activeMissions, isLoading: isLoadingMissions } = useMissions({ status: 'in_progress', limit: 5 })
  const { summary: financeSummary, isLoading: isLoadingFinanceSummary } = useFinanceSummary()
  const { transactions: recentTransactions, isLoading: isLoadingTransactions } = useTransactions({ limit: 5 })

  // 지난달 대비 증감률 (목업 데이터)
  const savingsGrowth = 12.5

  return (
    <AppShell>
      {/* 모바일 헤더 - 간소화 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <img src="/logo.svg" alt="Nestack" className="h-7" />
          <div className="flex items-center gap-3">
            <span className={cn(
              'flex h-2 w-2 rounded-full',
              isSSEConnected ? 'bg-green-500' : 'bg-stone-300'
            )} />
            <button className="relative p-2 -mr-2 rounded-xl hover:bg-stone-100 transition-colors">
              <Bell className="h-5 w-5 text-stone-600" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-500" />
            </button>
          </div>
        </div>
      </header>

      <Page className="pb-24 lg:pb-8">
        {/* 인사말 섹션 */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Avatar
              src={user?.profileImage}
              name={user?.name || ''}
              size="md"
            />
            <div>
              <p className="text-lg font-bold text-stone-900">
                {user?.name ? `${user.name}님` : '안녕하세요'} 👋
              </p>
              <p className="text-sm text-stone-500">
                {user?.familyGroupId ? '함께 목표를 향해 달려가고 있어요' : '오늘도 목표를 향해 함께해요'}
              </p>
            </div>
          </div>
        </section>

        {/* 총 저축액 카드 - 토스 스타일 */}
        <section className="mb-6">
          <Card variant="gradient" className="p-6 relative overflow-hidden">
            {/* 배경 패턴 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <p className="text-sm text-white/80 mb-1">이번 달 총 저축액</p>
              {isLoadingFinanceSummary ? (
                <div className="h-10 w-40 bg-white/20 rounded-lg animate-pulse" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    <CurrencyDisplay
                      value={financeSummary?.totalBalance ?? 0}
                      duration={800}
                    />
                  </span>
                </div>
              )}

              {/* 증감률 */}
              <div className="mt-3 flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  savingsGrowth >= 0 ? 'bg-white/20 text-white' : 'bg-red-400/20 text-red-100'
                )}>
                  {savingsGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <PercentDisplay value={Math.abs(savingsGrowth)} duration={600} />
                </span>
                <span className="text-xs text-white/70">지난달 대비</span>
              </div>
            </div>
          </Card>
        </section>

        {/* 미션 카드 - 수평 스크롤 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900">진행 중인 미션</h2>
            <Link
              to="/missions"
              className="flex items-center gap-0.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              전체보기 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoadingMissions ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-36">
                  <Card className="p-4 h-44">
                    <div className="animate-pulse space-y-3">
                      <div className="h-16 w-16 mx-auto rounded-full bg-stone-200" />
                      <div className="h-4 w-20 mx-auto rounded bg-stone-200" />
                      <div className="h-3 w-16 mx-auto rounded bg-stone-100" />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : activeMissions.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
                <Wallet className="h-8 w-8 text-stone-400" />
              </div>
              <p className="text-stone-500 mb-3">진행 중인 미션이 없어요</p>
              <Link
                to="/missions/create"
                className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors active:scale-[0.98]"
              >
                새 미션 만들기
              </Link>
            </Card>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {activeMissions.map((mission) => {
                const icon = categoryIcons[mission.category?.id ?? 'default'] || categoryIcons.default
                return (
                  <Link
                    key={mission.id}
                    to={`/missions/${mission.id}`}
                    className="flex-shrink-0 w-36"
                  >
                    <Card interactive className="p-4 h-44 flex flex-col items-center justify-center text-center">
                      {/* 원형 진행률 */}
                      <GradientCircularProgress
                        value={mission.progress}
                        size="lg"
                        className="mb-3"
                      >
                        <div className="text-primary-500">
                          {icon}
                        </div>
                      </GradientCircularProgress>

                      {/* 미션 이름 */}
                      <p className="font-semibold text-stone-900 text-sm truncate w-full">
                        {mission.name}
                      </p>

                      {/* D-day */}
                      <p className="text-xs text-stone-500 mt-1">
                        D-{mission.daysRemaining}
                      </p>
                    </Card>
                  </Link>
                )
              })}

              {/* 미션 추가 카드 */}
              <Link to="/missions/create" className="flex-shrink-0 w-36">
                <Card className="p-4 h-44 flex flex-col items-center justify-center border-2 border-dashed border-stone-200 bg-transparent shadow-none hover:border-primary-300 hover:bg-primary-50/50 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center mb-2">
                    <span className="text-2xl text-stone-400">+</span>
                  </div>
                  <p className="text-sm text-stone-500">미션 추가</p>
                </Card>
              </Link>
            </div>
          )}
        </section>

        {/* 요약 통계 */}
        <section className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {/* 이번 달 미션 진행률 */}
            <Card className="p-4">
              <p className="text-xs text-stone-500 mb-1">이번 달 미션</p>
              {isLoadingMissionSummary ? (
                <div className="h-7 w-16 bg-stone-200 rounded animate-pulse" />
              ) : (
                <p className="text-xl font-bold text-stone-900">
                  <PercentDisplay value={missionSummary?.monthlyProgress ?? 0} duration={600} />
                </p>
              )}
              <p className="text-xs text-stone-400 mt-1">
                {missionSummary?.completedMissions ?? 0}/{(missionSummary?.activeMissions ?? 0) + (missionSummary?.completedMissions ?? 0)} 완료
              </p>
            </Card>

            {/* 연결된 계좌 */}
            <Card className="p-4">
              <p className="text-xs text-stone-500 mb-1">연결된 계좌</p>
              {isLoadingFinanceSummary ? (
                <div className="h-7 w-12 bg-stone-200 rounded animate-pulse" />
              ) : (
                <p className="text-xl font-bold text-stone-900">
                  {financeSummary?.connectedAccounts ?? 0}개
                </p>
              )}
              <p className="text-xs text-stone-400 mt-1">
                총 자산 관리 중
              </p>
            </Card>
          </div>
        </section>

        {/* 최근 거래 - 타임라인 스타일 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900">최근 활동</h2>
            <Link
              to="/finance/transactions"
              className="flex items-center gap-0.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              전체보기 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <Card>
            {isLoadingTransactions ? (
              <div className="divide-y divide-stone-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <div className="h-10 w-10 rounded-xl bg-stone-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-stone-200 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-stone-100 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-20 bg-stone-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
                  <Wallet className="h-7 w-7 text-stone-400" />
                </div>
                <p className="text-stone-500">최근 거래 내역이 없어요</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-4">
                    {/* 아이콘 */}
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        tx.transactionType === 'deposit'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-stone-100 text-stone-600'
                      )}
                    >
                      {tx.transactionType === 'deposit' ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>

                    {/* 설명 */}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-900 truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-stone-500">
                        {tx.bankAccount?.bankName}
                      </p>
                    </div>

                    {/* 금액 */}
                    <span
                      className={cn(
                        'font-semibold tabular-nums text-sm',
                        tx.transactionType === 'deposit' ? 'text-green-600' : 'text-stone-900'
                      )}
                    >
                      {tx.transactionType === 'deposit' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </Page>
    </AppShell>
  )
}

// Helper function for currency formatting
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원'
}
