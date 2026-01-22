import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Settings, Building2, Lock, Users, Eye } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Modal } from '@/shared/components/ui/Modal'
import { Skeleton } from '@/shared/components/feedback'
import { TransactionList } from '@/features/finance/components'
import {
  useAccount,
  useAccountTransactions,
  useSyncAccount,
  useUpdateAccount,
} from '@/features/finance/hooks'
import type { ShareStatus } from '@/features/finance/types'

const shareStatusConfig: Record<ShareStatus, { label: string; description: string; icon: typeof Eye }> = {
  full: { label: '전체 공유', description: '잔액과 거래내역 모두 공유', icon: Users },
  balance_only: { label: '잔액만 공유', description: '잔액만 공유, 거래내역은 비공개', icon: Eye },
  private: { label: '비공개', description: '나만 볼 수 있음', icon: Lock },
}

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const { account, isLoading: isAccountLoading } = useAccount(id!)
  const { transactions, isLoading: isTransactionsLoading } = useAccountTransactions(id!)
  const { syncAccount, isLoading: isSyncing } = useSyncAccount(id!)
  const { updateAccount, isLoading: isUpdating } = useUpdateAccount(id!)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const handleShareStatusChange = (status: ShareStatus) => {
    updateAccount({ shareStatus: status })
    setShowSettingsModal(false)
  }

  if (isAccountLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </main>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 mb-4">계좌를 찾을 수 없습니다</p>
          <Link to="/finance">
            <Button>가계부로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  const shareStatus = shareStatusConfig[account.shareStatus]
  const ShareIcon = shareStatus.icon

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-stone-600">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-stone-900">계좌 상세</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => syncAccount()}
              isLoading={isSyncing}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Account Info Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
              <Building2 className="h-7 w-7 text-stone-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900">
                  {account.accountAlias || account.bankName}
                </h2>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShareIcon className="h-3 w-3" />
                  {shareStatus.label}
                </Badge>
              </div>
              <p className="text-sm text-stone-500">
                {account.bankName} · {account.accountNumber}
              </p>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <p className="text-sm text-stone-500 mb-1">현재 잔액</p>
            <p className="text-3xl font-bold text-stone-900">
              {formatAmount(account.balance)}원
            </p>
            {account.lastSyncedAt && (
              <p className="text-xs text-stone-400 mt-2">
                마지막 동기화: {new Date(account.lastSyncedAt).toLocaleString('ko-KR')}
              </p>
            )}
          </div>
        </Card>

        {/* Transactions */}
        <section>
          <h3 className="font-semibold text-stone-900 mb-4">거래 내역</h3>
          <TransactionList
            transactions={transactions}
            isLoading={isTransactionsLoading}
            emptyMessage="이 계좌의 거래 내역이 없습니다"
          />
        </section>
      </main>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="계좌 설정"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-3">공유 설정</h4>
            <div className="space-y-2">
              {(Object.keys(shareStatusConfig) as ShareStatus[]).map((status) => {
                const config = shareStatusConfig[status]
                const Icon = config.icon
                const isSelected = account.shareStatus === status

                return (
                  <button
                    key={status}
                    onClick={() => handleShareStatusChange(status)}
                    disabled={isUpdating}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-primary-600' : 'text-stone-400'}`} />
                    <div className="text-left">
                      <p className={`font-medium ${isSelected ? 'text-primary-700' : 'text-stone-900'}`}>
                        {config.label}
                      </p>
                      <p className="text-sm text-stone-500">{config.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
