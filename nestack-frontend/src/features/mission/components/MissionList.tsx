import { MissionCard } from './MissionCard'
import { Skeleton } from '@/shared/components/feedback'
import { EmptyState } from '@/shared/components/feedback'
import { Target } from 'lucide-react'
import type { Mission } from '../types'

interface MissionListProps {
  missions: Mission[]
  isLoading?: boolean
  emptyMessage?: string
}

export function MissionList({
  missions,
  isLoading = false,
  emptyMessage = '미션이 없습니다',
}: MissionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-12 rounded" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-2 w-full rounded-full mb-3" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (missions.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="미션 없음"
        description={emptyMessage}
      />
    )
  }

  return (
    <div className="space-y-4">
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} />
      ))}
    </div>
  )
}
