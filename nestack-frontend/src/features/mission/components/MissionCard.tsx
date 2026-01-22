import { Link } from 'react-router-dom'
import { Calendar, Target, ChevronRight } from 'lucide-react'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { ProgressBar } from '@/shared/components/ui/ProgressBar'
import type { Mission, MissionStatus, MissionType } from '../types'

interface MissionCardProps {
  mission: Mission
}

const statusConfig: Record<MissionStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: '대기', variant: 'default' },
  in_progress: { label: '진행중', variant: 'warning' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'danger' },
  cancelled: { label: '취소', variant: 'default' },
}

const typeConfig: Record<MissionType, { label: string; color: string }> = {
  main: { label: '메인', color: 'bg-primary-100 text-primary-700' },
  monthly: { label: '월간', color: 'bg-blue-100 text-blue-700' },
  weekly: { label: '주간', color: 'bg-purple-100 text-purple-700' },
  daily: { label: '일간', color: 'bg-stone-100 text-stone-700' },
}

export function MissionCard({ mission }: MissionCardProps) {
  const status = statusConfig[mission.status]
  const type = typeConfig[mission.type]

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <Link to={`/missions/${mission.id}`}>
      <Card className="p-4 hover:bg-stone-50 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${type.color}`}>
              {type.label}
            </span>
            <Badge variant={status.variant}>
              {status.label}
            </Badge>
          </div>
          <ChevronRight className="h-5 w-5 text-stone-400" />
        </div>

        <h3 className="font-semibold text-stone-900 mb-1">{mission.name}</h3>

        {mission.description && (
          <p className="text-sm text-stone-500 mb-3 line-clamp-1">
            {mission.description}
          </p>
        )}

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-stone-600">
              {formatAmount(mission.currentAmount)}원
            </span>
            <span className="text-sm font-medium text-stone-900">
              {formatAmount(mission.targetAmount)}원
            </span>
          </div>
          <ProgressBar value={mission.progress} size="sm" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDate(mission.startDate)} - {formatDate(mission.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{mission.progress}% 달성</span>
          </div>
        </div>

        {/* Sub missions indicator */}
        {mission.subMissions && mission.subMissions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <p className="text-xs text-stone-500">
              하위 미션 {mission.subMissions.length}개
            </p>
          </div>
        )}
      </Card>
    </Link>
  )
}
