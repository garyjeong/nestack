import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Filter } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { TransactionList, VirtualTransactionList } from '@/features/finance/components'
import { useTransactions, useAccounts } from '@/features/finance/hooks'
import type { TransactionFilters } from '@/features/finance/types'

type DateFilter = 'this_month' | 'last_month' | 'last_3_months' | 'all'
type TypeFilter = 'all' | 'deposit' | 'withdraw'

const dateFilterOptions: { value: DateFilter; label: string }[] = [
  { value: 'this_month', label: '이번 달' },
  { value: 'last_month', label: '지난 달' },
  { value: 'last_3_months', label: '최근 3개월' },
  { value: 'all', label: '전체' },
]

const typeFilterOptions: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'deposit', label: '입금' },
  { value: 'withdraw', label: '출금' },
]

export default function TransactionListPage() {
  const navigate = useNavigate()
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilter>('this_month')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<TypeFilter>('all')

  const { accounts } = useAccounts()

  // Calculate date range based on filter
  const getDateRange = (filter: DateFilter): { fromDate?: string; toDate?: string } => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    switch (filter) {
      case 'this_month':
        return {
          fromDate: new Date(year, month, 1).toISOString().split('T')[0],
          toDate: now.toISOString().split('T')[0],
        }
      case 'last_month':
        return {
          fromDate: new Date(year, month - 1, 1).toISOString().split('T')[0],
          toDate: new Date(year, month, 0).toISOString().split('T')[0],
        }
      case 'last_3_months':
        return {
          fromDate: new Date(year, month - 2, 1).toISOString().split('T')[0],
          toDate: now.toISOString().split('T')[0],
        }
      case 'all':
      default:
        return {}
    }
  }

  const filters: TransactionFilters = {
    accountId: selectedAccount || undefined,
    type: selectedTypeFilter === 'all' ? undefined : selectedTypeFilter,
    ...getDateRange(selectedDateFilter),
    limit: 50,
  }

  const { transactions, isLoading } = useTransactions(filters)

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-stone-600">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-stone-900">전체 거래 내역</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Account Filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedAccount('')}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition ${
                !selectedAccount
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              전체 계좌
            </button>
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccount(account.id)}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  selectedAccount === account.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                {account.accountAlias || account.bankName}
              </button>
            ))}
          </div>

          {/* Date & Type Filters */}
          <div className="flex gap-2">
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value as DateFilter)}
              className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              {dateFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value as TypeFilter)}
              className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              {typeFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction List - 20개 이상일 때 Virtual List 사용 */}
        {transactions.length > 20 ? (
          <VirtualTransactionList
            transactions={transactions}
            isLoading={isLoading}
            showAccount={!selectedAccount}
            emptyMessage="조건에 맞는 거래 내역이 없습니다"
            height="calc(100vh - 260px)"
          />
        ) : (
          <TransactionList
            transactions={transactions}
            isLoading={isLoading}
            showAccount={!selectedAccount}
            emptyMessage="조건에 맞는 거래 내역이 없습니다"
          />
        )}
      </main>
    </div>
  )
}
