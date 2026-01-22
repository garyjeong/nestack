import { Link } from 'react-router-dom'
import { RefreshCw, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { AppShell } from '@/shared/components/layout/AppShell'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Skeleton } from '@/shared/components/feedback'
import { AccountList } from '@/features/finance/components'
import { TransactionItem } from '@/features/finance/components'
import {
  useAccounts,
  useTransactions,
  useFinanceSummary,
  useSyncAllAccounts,
  useOpenBankingAuth,
  useOpenBankingConnection,
} from '@/features/finance/hooks'

export default function FinancePage() {
  const { accounts, isLoading: isAccountsLoading } = useAccounts()
  const { transactions, isLoading: isTransactionsLoading } = useTransactions({ limit: 5 })
  const { summary, isLoading: isSummaryLoading } = useFinanceSummary()
  const { isConnected } = useOpenBankingConnection()
  const { syncAllAccounts, isLoading: isSyncing } = useSyncAllAccounts()
  const { startAuth, isLoading: isAuthLoading } = useOpenBankingAuth()

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const handleConnectBank = () => {
    startAuth()
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">가계부</h1>
          {accounts.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => syncAllAccounts()}
              isLoading={isSyncing}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Summary Card */}
        {isSummaryLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : summary ? (
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-5 w-5 opacity-80" />
                <span className="text-sm opacity-80">총 자산</span>
              </div>
              <p className="text-3xl font-bold">{formatAmount(summary.totalBalance)}원</p>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-stone-500 mb-1">연결 계좌</p>
                <p className="font-bold text-stone-900">{summary.connectedAccounts}개</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-xs text-stone-500 mb-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>수입</span>
                </div>
                <p className="font-bold text-green-600">+{formatAmount(summary.monthlyIncome)}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-xs text-stone-500 mb-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span>지출</span>
                </div>
                <p className="font-bold text-red-600">-{formatAmount(summary.monthlyExpense)}</p>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Accounts Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-900">연결된 계좌</h2>
            {accounts.length > 0 && (
              <span className="text-sm text-stone-500">{accounts.length}개</span>
            )}
          </div>

          <AccountList
            accounts={accounts}
            isLoading={isAccountsLoading}
            emptyMessage="아직 연결된 계좌가 없습니다. 오픈뱅킹으로 계좌를 연결해보세요."
          />

          {!isConnected && !isAccountsLoading && (
            <Button
              variant="outline"
              className="mt-4 w-full border-2 border-dashed"
              onClick={handleConnectBank}
              isLoading={isAuthLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              오픈뱅킹 계좌 연결하기
            </Button>
          )}
        </section>

        {/* Recent Transactions Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-900">최근 거래</h2>
            <Link to="/finance/transactions" className="text-sm text-primary-600">
              전체보기
            </Link>
          </div>

          {isTransactionsLoading ? (
            <Card className="p-4">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </Card>
          ) : transactions.length > 0 ? (
            <Card className="divide-y divide-stone-100">
              {transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  showAccount
                />
              ))}
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-stone-500">거래 내역이 없습니다</p>
            </Card>
          )}
        </section>
      </main>
    </AppShell>
  )
}
