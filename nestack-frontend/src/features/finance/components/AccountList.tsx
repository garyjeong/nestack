import { AccountCard } from './AccountCard'
import { Skeleton } from '@/shared/components/feedback'
import { EmptyState } from '@/shared/components/feedback'
import { Building2 } from 'lucide-react'
import type { BankAccount } from '../types'

interface AccountListProps {
  accounts: BankAccount[]
  isLoading?: boolean
  emptyMessage?: string
  onConnectBank?: () => void
}

export function AccountList({
  accounts,
  isLoading = false,
  emptyMessage = '연동된 계좌가 없습니다',
  onConnectBank,
}: AccountListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="계좌 없음"
        description={emptyMessage}
        actionLabel={onConnectBank ? '계좌 연결하기' : undefined}
        onAction={onConnectBank}
      />
    )
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  )
}
