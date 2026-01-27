import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Card } from '@/shared/components/ui/Card'
import { Skeleton } from '@/shared/components/feedback'
import { useMission, useUpdateMission } from '@/features/mission/hooks'
import { updateMissionSchema, type UpdateMissionFormData } from '@/features/mission/schemas'
import { useEffect } from 'react'

export default function MissionEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { mission, isLoading: isMissionLoading } = useMission(id!)
  const { updateMission, isLoading: isUpdating } = useUpdateMission(id!)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateMissionFormData>({
    resolver: zodResolver(updateMissionSchema),
  })

  // Populate form when mission data is loaded
  useEffect(() => {
    if (mission) {
      reset({
        name: mission.name,
        description: mission.description || '',
        targetAmount: mission.targetAmount,
        endDate: mission.endDate.split('T')[0],
      })
    }
  }, [mission, reset])

  const onSubmit = (data: UpdateMissionFormData) => {
    updateMission(data, {
      onSuccess: () => {
        navigate(`/missions/${id}`)
      },
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const parseAmount = (value: string): number => {
    return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
  }

  if (isMissionLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <main className="mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </main>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 mb-4">미션을 찾을 수 없습니다</p>
          <Button onClick={() => navigate('/missions')}>미션 목록으로</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-stone-600">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-stone-900">미션 수정</h1>
        </div>
      </header>

      <main className="mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-stone-900">기본 정보</h2>
            <div className="space-y-4">
              <Input
                label="미션 이름"
                placeholder="예: 결혼자금 모으기"
                error={errors.name?.message}
                {...register('name')}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  설명 (선택)
                </label>
                <textarea
                  {...register('description')}
                  className="w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows={3}
                  placeholder="미션에 대한 설명을 입력하세요"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Target Settings */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-stone-900">목표 설정</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  목표 금액
                </label>
                <Controller
                  name="targetAmount"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-stone-300 px-4 py-3 pr-12 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="0"
                        value={field.value ? formatAmount(field.value) : ''}
                        onChange={(e) => {
                          const numValue = parseAmount(e.target.value)
                          field.onChange(numValue)
                        }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">
                        원
                      </span>
                    </div>
                  )}
                />
                {errors.targetAmount && (
                  <p className="mt-1 text-sm text-red-500">{errors.targetAmount.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Period Settings */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-stone-900">기간 설정</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    시작일
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-3 text-stone-500 cursor-not-allowed"
                    value={mission.startDate.split('T')[0]}
                    disabled
                  />
                  <p className="mt-1 text-xs text-stone-500">시작일은 변경할 수 없습니다</p>
                </div>
                <Input
                  type="date"
                  label="종료일"
                  error={errors.endDate?.message}
                  {...register('endDate')}
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div
              className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 bg-white border-t border-stone-200 px-4"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))', paddingTop: '1rem' }}
            >
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={isUpdating}
                disabled={!isDirty}
              >
                수정 완료
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
