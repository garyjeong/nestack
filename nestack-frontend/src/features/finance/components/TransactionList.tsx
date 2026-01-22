import { TransactionItem } from './TransactionItem'
import { Skeleton } from '@/shared/components/feedback'
import { EmptyState } from '@/shared/components/feedback'
import { Receipt } from 'lucide-react'
import type { Transaction } from '../types'

interface TransactionListProps {
  transactions: Transaction[]
  isLoading?: boolean
  showAccount?: boolean
  emptyMessage?: string
  onMissionLink?: (transactionId: string) => void
}

export function TransactionList({
  transactions,
  isLoading = false,
  showAccount = false,
  emptyMessage = '거래 내역이 없습니다',
  onMissionLink,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="divide-y divide-stone-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="거래 내역 없음"
        description={emptyMessage}
      />
    )
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.transactionDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-stone-500 mb-2">{date}</h3>
          <div className="divide-y divide-stone-100 bg-white rounded-xl border border-stone-200">
            {dateTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                showAccount={showAccount}
                onMissionLink={onMissionLink}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
