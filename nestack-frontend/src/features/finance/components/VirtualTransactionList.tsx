import { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { TransactionItem } from './TransactionItem'
import { Skeleton } from '@/shared/components/feedback'
import { EmptyState } from '@/shared/components/feedback'
import { Receipt } from 'lucide-react'
import type { Transaction } from '../types'

interface VirtualTransactionListProps {
  transactions: Transaction[]
  isLoading?: boolean
  showAccount?: boolean
  emptyMessage?: string
  onMissionLink?: (transactionId: string) => void
  /** 컨테이너 높이 (기본: 100vh - 250px) */
  height?: string
}

type ListItem =
  | { type: 'header'; date: string }
  | { type: 'transaction'; transaction: Transaction }

export function VirtualTransactionList({
  transactions,
  isLoading = false,
  showAccount = false,
  emptyMessage = '거래 내역이 없습니다',
  onMissionLink,
  height = 'calc(100vh - 250px)',
}: VirtualTransactionListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // 날짜별로 그룹화하고 플랫 리스트로 변환
  const flatItems = useMemo(() => {
    const grouped = transactions.reduce((groups, transaction) => {
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

    const items: ListItem[] = []
    Object.entries(grouped).forEach(([date, dateTransactions]) => {
      items.push({ type: 'header', date })
      dateTransactions.forEach((transaction) => {
        items.push({ type: 'transaction', transaction })
      })
    })
    return items
  }, [transactions])

  const rowVirtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = flatItems[index]
      // 헤더: 36px, 트랜잭션: 76px (대략)
      return item.type === 'header' ? 36 : 76
    },
    overscan: 5,
  })

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

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = flatItems[virtualRow.index]

          if (item.type === 'header') {
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <h3 className="text-sm font-medium text-stone-500 py-2">
                  {item.date}
                </h3>
              </div>
            )
          }

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="bg-white rounded-xl border border-stone-200 px-4">
                <TransactionItem
                  transaction={item.transaction}
                  showAccount={showAccount}
                  onMissionLink={onMissionLink}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
