import { Link } from 'react-router-dom'
import { Building2, ChevronRight, Lock, Users, Eye } from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import type { BankAccount, ShareStatus } from '../types'

interface AccountCardProps {
  account: BankAccount
}

const shareStatusConfig: Record<ShareStatus, { label: string; icon: typeof Eye; variant: 'default' | 'primary' | 'secondary' }> = {
  full: { label: '전체 공유', icon: Users, variant: 'primary' },
  balance_only: { label: '잔액만', icon: Eye, variant: 'secondary' },
  private: { label: '비공개', icon: Lock, variant: 'default' },
}

export function AccountCard({ account }: AccountCardProps) {
  const shareStatus = shareStatusConfig[account.shareStatus]
  const ShareIcon = shareStatus.icon

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const formatAccountNumber = (accountNumber: string) => {
    // Already masked from backend
    return accountNumber
  }

  return (
    <Link to={`/finance/accounts/${account.id}`}>
      <Card className="p-4 hover:bg-stone-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
              <Building2 className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-stone-900">
                  {account.accountAlias || account.bankName}
                </p>
                <Badge variant={shareStatus.variant} className="flex items-center gap-1">
                  <ShareIcon className="h-3 w-3" />
                  {shareStatus.label}
                </Badge>
              </div>
              <p className="text-sm text-stone-500">
                {account.bankName} {formatAccountNumber(account.accountNumber)}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-stone-400" />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-sm text-stone-500">잔액</p>
            <p className="text-xl font-bold text-stone-900">
              {formatAmount(account.balance)}원
            </p>
          </div>
          {account.lastSyncedAt && (
            <p className="text-xs text-stone-400">
              {new Date(account.lastSyncedAt).toLocaleDateString('ko-KR')} 동기화
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}
