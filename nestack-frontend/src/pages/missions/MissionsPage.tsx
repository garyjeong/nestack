import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter } from 'lucide-react'
import { AppShell } from '@/shared/components/layout/AppShell'
import { Button } from '@/shared/components/ui/Button'
import {
  MissionList,
  CategoryFilter,
} from '@/features/mission/components'
import { useMissions, useMissionSummary } from '@/features/mission/hooks'
import type { MissionStatus, MissionFilters } from '@/features/mission/types'

const statusTabs: { value: MissionStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'in_progress', label: '진행중' },
  { value: 'completed', label: '완료' },
  { value: 'pending', label: '대기' },
]

export default function MissionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedStatus, setSelectedStatus] = useState<MissionStatus | 'all'>('all')

  const filters: MissionFilters = {
    categoryId: selectedCategory,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  }

  const { missions, isLoading } = useMissions(filters)
  const { summary } = useMissionSummary()

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">미션</h1>
          <Button variant="ghost" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">{summary.activeMissions}</p>
              <p className="text-xs text-stone-500">진행중</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{summary.completedMissions}</p>
              <p className="text-xs text-stone-500">완료</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {formatAmount(summary.totalSavedAmount)}
              </p>
              <p className="text-xs text-stone-500">총 저축</p>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Category Filter */}
        <div className="mb-4">
          <CategoryFilter
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Status Tabs */}
        <div className="mb-6 flex gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                selectedStatus === tab.value
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mission List */}
        <MissionList
          missions={missions}
          isLoading={isLoading}
          emptyMessage={
            selectedStatus === 'all'
              ? '아직 미션이 없습니다. 새로운 미션을 시작해보세요!'
              : `${statusTabs.find((t) => t.value === selectedStatus)?.label} 미션이 없습니다`
          }
        />
      </main>

      {/* FAB */}
      <Link
        to="/missions/create"
        className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition hover:bg-primary-600 hover:scale-105"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </AppShell>
  )
}
