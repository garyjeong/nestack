import { ArrowUpRight, ArrowDownLeft, Target } from 'lucide-react'
import type { Transaction } from '../types'

interface TransactionItemProps {
  transaction: Transaction
  showAccount?: boolean
  onMissionLink?: (transactionId: string) => void
}

export function TransactionItem({
  transaction,
  showAccount = false,
  onMissionLink,
}: TransactionItemProps) {
  const isDeposit = transaction.transactionType === 'deposit'

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isDeposit ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        {isDeposit ? (
          <ArrowDownLeft className="h-5 w-5 text-green-600" />
        ) : (
          <ArrowUpRight className="h-5 w-5 text-red-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-stone-900 truncate">
            {transaction.merchantName || transaction.description}
          </p>
          {transaction.mission && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full shrink-0">
              <Target className="h-3 w-3" />
              {transaction.mission.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <span>{formatDate(transaction.transactionDate)}</span>
          <span>·</span>
          <span>{formatTime(transaction.transactionDate)}</span>
          {showAccount && transaction.bankAccount && (
            <>
              <span>·</span>
              <span>{transaction.bankAccount.bankName}</span>
            </>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p
          className={`font-semibold ${
            isDeposit ? 'text-green-600' : 'text-stone-900'
          }`}
        >
          {isDeposit ? '+' : '-'}{formatAmount(transaction.amount)}원
        </p>
        <p className="text-xs text-stone-400">
          잔액 {formatAmount(transaction.balance)}원
        </p>
      </div>

      {onMissionLink && !transaction.mission && (
        <button
          onClick={() => onMissionLink(transaction.id)}
          className="p-2 text-stone-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition"
        >
          <Target className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
