import { Link, useNavigate } from 'react-router-dom'
import { RefreshCw, Plus, TrendingUp, TrendingDown, Wallet, ChevronRight, Building2, CreditCard, PiggyBank } from 'lucide-react'
import { AppShell, Page, AnimatedSection, AnimatedList, AnimatedItem } from '@/shared/components/layout'
import { Card } from '@/shared/components/ui/Card'
import { CurrencyDisplay } from '@/shared/components/ui/CountUpNumber'
import { NoTransactionsEmpty } from '@/shared/components/feedback'
import {
  useAccounts,
  useTransactions,
  useFinanceSummary,
  useSyncAllAccounts,
  useOpenBankingAuth,
  useOpenBankingConnection,
} from '@/features/finance/hooks'
import { cn } from '@/shared/utils/cn'

// 은행 아이콘 매핑 (간소화)
const bankIcons: Record<string, React.ReactNode> = {
  default: <Building2 className="h-5 w-5" />,
}

export default function FinancePage() {
  const navigate = useNavigate()
  const { accounts, isLoading: isAccountsLoading } = useAccounts()
  const { transactions, isLoading: isTransactionsLoading } = useTransactions({ limit: 5 })
  const { summary, isLoading: isSummaryLoading } = useFinanceSummary()
  const { isConnected } = useOpenBankingConnection()
  const { syncAllAccounts, isLoading: isSyncing } = useSyncAllAccounts()
  const { startAuth, isLoading: isAuthLoading } = useOpenBankingAuth()

  const handleConnectBank = () => {
    startAuth()
  }

  // 저축률 계산
  const savingsRate = summary
    ? Math.round(((summary.monthlyIncome - summary.monthlyExpense) / summary.monthlyIncome) * 100) || 0
    : 0

  return (
    <AppShell>
      {/* 모바일 헤더 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">가계부</h1>
          {accounts.length > 0 && (
            <button
              onClick={() => syncAllAccounts()}
              disabled={isSyncing}
              className="p-2 -mr-2 rounded-xl hover:bg-stone-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('h-5 w-5 text-stone-600', isSyncing && 'animate-spin')} />
            </button>
          )}
        </div>
      </header>

      <Page className="pb-24">
        {/* 총 자산 카드 */}
        <AnimatedSection className="mb-6" delay={0}>
          {isSummaryLoading ? (
            <Card className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-20 bg-stone-200 rounded" />
                <div className="h-10 w-40 bg-stone-200 rounded" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-12 bg-stone-100 rounded-xl" />
                  <div className="h-12 bg-stone-100 rounded-xl" />
                  <div className="h-12 bg-stone-100 rounded-xl" />
                </div>
              </div>
            </Card>
          ) : summary ? (
            <Card variant="gradient" className="p-6 relative overflow-hidden">
              {/* 배경 데코 */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-white/80" />
                  <span className="text-sm text-white/80">총 자산</span>
                </div>
                <p className="text-3xl font-bold text-white mb-4">
                  <CurrencyDisplay value={summary.totalBalance} duration={800} />
                </p>

                {/* 수입/지출 요약 */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/15 rounded-xl p-3 text-center">
                    <p className="text-xs text-white/70 mb-1">연결 계좌</p>
                    <p className="font-bold text-white">{summary.connectedAccounts}개</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 text-center">
                    <p className="text-xs text-white/70 mb-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" /> 수입
                    </p>
                    <p className="font-bold text-white text-sm">
                      +<CurrencyDisplay value={summary.monthlyIncome} duration={600} />
                    </p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 text-center">
                    <p className="text-xs text-white/70 mb-1 flex items-center justify-center gap-1">
                      <TrendingDown className="h-3 w-3" /> 지출
                    </p>
                    <p className="font-bold text-white text-sm">
                      -<CurrencyDisplay value={summary.monthlyExpense} duration={600} />
                    </p>
                  </div>
                </div>

                {/* 저축률 표시 */}
                {savingsRate > 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-white/70" />
                    <span className="text-sm text-white/70">
                      이번 달 저축률 <span className="font-bold text-white">{savingsRate}%</span>
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ) : null}
        </AnimatedSection>

        <div className="space-y-6">
          {/* 연결된 계좌 */}
          <AnimatedSection delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-900">연결된 계좌</h2>
              {accounts.length > 0 && (
                <span className="text-sm text-stone-500">{accounts.length}개</span>
              )}
            </div>

            {isAccountsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="animate-pulse flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-stone-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-stone-200 rounded" />
                        <div className="h-3 w-32 bg-stone-100 rounded" />
                      </div>
                      <div className="h-5 w-20 bg-stone-200 rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
                  <CreditCard className="h-8 w-8 text-stone-400" />
                </div>
                <p className="text-stone-900 font-medium mb-1">연결된 계좌가 없어요</p>
                <p className="text-stone-500 text-sm mb-4">
                  오픈뱅킹으로 계좌를 연결해보세요
                </p>
                {!isConnected && (
                  <button
                    onClick={handleConnectBank}
                    disabled={isAuthLoading}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" />
                    계좌 연결하기
                  </button>
                )}
              </Card>
            ) : (
              <AnimatedList className="space-y-3">
                {accounts.map((account) => (
                  <AnimatedItem key={account.id}>
                    <Card interactive className="p-4">
                      <div className="flex items-center gap-3">
                        {/* 은행 아이콘 */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
                          <span className="text-stone-600">
                            {bankIcons.default}
                          </span>
                        </div>

                        {/* 계좌 정보 */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-900">{account.bankName}</p>
                          <p className="text-sm text-stone-500 truncate">{account.accountNumber}</p>
                        </div>

                        {/* 잔액 */}
                        <p className="font-bold text-stone-900 tabular-nums">
                          <CurrencyDisplay value={account.balance} duration={400} />
                        </p>
                      </div>
                    </Card>
                  </AnimatedItem>
                ))}

                {/* 계좌 추가 */}
                {!isConnected && (
                  <button
                    onClick={handleConnectBank}
                    disabled={isAuthLoading}
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-stone-200 text-stone-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">계좌 추가</span>
                  </button>
                )}
              </AnimatedList>
            )}
          </AnimatedSection>

          {/* 최근 거래 */}
          <AnimatedSection delay={0.2}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-900">최근 거래</h2>
              <Link
                to="/finance/transactions"
                className="flex items-center gap-0.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                전체보기 <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {isTransactionsLoading ? (
              <Card className="divide-y divide-stone-100">
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
              </Card>
            ) : transactions.length === 0 ? (
              <NoTransactionsEmpty onAction={() => navigate('/finance/connect')} />
            ) : (
              <Card>
                <AnimatedList className="divide-y divide-stone-100">
                  {transactions.map((tx) => (
                    <AnimatedItem key={tx.id}>
                      <div className="flex items-center gap-3 p-4">
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
                          {new Intl.NumberFormat('ko-KR').format(tx.amount)}원
                        </span>
                      </div>
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              </Card>
            )}
          </AnimatedSection>
        </div>
      </Page>
    </AppShell>
  )
}
