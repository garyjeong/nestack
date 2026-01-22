import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Target,
  MoreVertical,
  Play,
  Check,
  X,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import { Modal } from '@/shared/components/ui/Modal'
import { Skeleton } from '@/shared/components/feedback'
import { MissionProgress, MissionList } from '@/features/mission/components'
import { useMission, useUpdateMissionStatus, useDeleteMission } from '@/features/mission/hooks'
import type { MissionStatus } from '@/features/mission/types'
import { useState } from 'react'

const statusConfig: Record<MissionStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: '대기', variant: 'default' },
  in_progress: { label: '진행중', variant: 'warning' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'danger' },
  cancelled: { label: '취소', variant: 'default' },
}

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { mission, isLoading } = useMission(id!)
  const { updateStatus, isLoading: isUpdating } = useUpdateMissionStatus(id!)
  const { deleteMission, isLoading: isDeleting } = useDeleteMission()

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleStatusChange = (status: MissionStatus) => {
    updateStatus({ status })
    setShowMenu(false)
  }

  const handleDelete = () => {
    deleteMission(id!)
  }

  if (isLoading) {
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

  if (!mission) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 mb-4">미션을 찾을 수 없습니다</p>
          <Link to="/missions">
            <Button>미션 목록으로</Button>
          </Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[mission.status]
  const monthlyTarget = Math.ceil(
    (mission.targetAmount - mission.currentAmount) /
      Math.max(1, Math.ceil(mission.daysRemaining / 30))
  )

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-stone-600">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-stone-900">미션 상세</h1>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg bg-white shadow-lg border border-stone-200">
                  <Link
                    to={`/missions/${id}/edit`}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50"
                  >
                    <Edit className="h-4 w-4" />
                    수정
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setShowDeleteModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-stone-50 w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Mission Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Badge variant={status.variant}>{status.label}</Badge>
            {mission.category && (
              <span className="text-sm text-stone-500">{mission.category.name}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">{mission.name}</h2>
          {mission.description && (
            <p className="text-stone-500">{mission.description}</p>
          )}
        </Card>

        {/* Progress */}
        <Card className="p-6">
          <h3 className="font-semibold text-stone-900 mb-4">진행 현황</h3>
          <MissionProgress
            currentAmount={mission.currentAmount}
            targetAmount={mission.targetAmount}
            progress={mission.progress}
          />
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-stone-50 p-4 text-center">
              <Calendar className="h-5 w-5 mx-auto mb-2 text-stone-400" />
              <p className="text-sm text-stone-500">남은 기간</p>
              <p className="text-lg font-bold text-stone-900">{mission.daysRemaining}일</p>
            </div>
            <div className="rounded-lg bg-stone-50 p-4 text-center">
              <Target className="h-5 w-5 mx-auto mb-2 text-stone-400" />
              <p className="text-sm text-stone-500">월 목표</p>
              <p className="text-lg font-bold text-stone-900">{formatAmount(monthlyTarget)}원</p>
            </div>
          </div>
        </Card>

        {/* Date Info */}
        <Card className="p-6">
          <h3 className="font-semibold text-stone-900 mb-4">기간</h3>
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-stone-500">시작일</p>
              <p className="font-medium text-stone-900">{formatDate(mission.startDate)}</p>
            </div>
            <div className="h-0.5 flex-1 mx-4 bg-stone-200" />
            <div className="text-right">
              <p className="text-stone-500">종료일</p>
              <p className="font-medium text-stone-900">{formatDate(mission.endDate)}</p>
            </div>
          </div>
        </Card>

        {/* Sub Missions */}
        {mission.subMissions && mission.subMissions.length > 0 && (
          <div>
            <h3 className="font-semibold text-stone-900 mb-4 px-1">하위 미션</h3>
            <MissionList missions={mission.subMissions} />
          </div>
        )}
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4">
        <div className="mx-auto max-w-lg flex gap-3">
          {mission.status === 'pending' && (
            <Button
              onClick={() => handleStatusChange('in_progress')}
              className="flex-1"
              isLoading={isUpdating}
            >
              <Play className="mr-2 h-4 w-4" />
              시작하기
            </Button>
          )}
          {mission.status === 'in_progress' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('failed')}
                className="flex-1"
                isLoading={isUpdating}
              >
                <X className="mr-2 h-4 w-4" />
                실패
              </Button>
              <Button
                onClick={() => handleStatusChange('completed')}
                className="flex-1"
                isLoading={isUpdating}
              >
                <Check className="mr-2 h-4 w-4" />
                완료
              </Button>
            </>
          )}
          {(mission.status === 'completed' || mission.status === 'failed') && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange('in_progress')}
              className="flex-1"
              isLoading={isUpdating}
            >
              다시 시작
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="미션 삭제"
      >
        <p className="text-stone-600 mb-6">
          이 미션을 삭제하시겠습니까? 하위 미션도 함께 삭제됩니다.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="flex-1"
          >
            삭제
          </Button>
        </div>
      </Modal>
    </div>
  )
}
