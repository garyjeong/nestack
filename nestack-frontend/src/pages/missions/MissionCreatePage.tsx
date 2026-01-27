import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Card } from '@/shared/components/ui/Card'
import { Skeleton } from '@/shared/components/feedback'
import {
  useCreateMission,
  useLifeCycleCategories,
  useMissionTemplates,
} from '@/features/mission/hooks'
import { createMissionSchema, type CreateMissionFormData } from '@/features/mission/schemas'
import type { MissionType, MissionTemplate } from '@/features/mission/types'

// Category icon mapping
const categoryIcons: Record<string, string> = {
  housing: '🏠',
  wedding: '💒',
  travel: '✈️',
  education: '📚',
  retirement: '🏖️',
  emergency: '🚨',
  investment: '📈',
  other: '📋',
}

// Mission type labels
const missionTypeLabels: Record<MissionType, string> = {
  main: '메인 미션',
  monthly: '월간 미션',
  weekly: '주간 미션',
  daily: '일간 미션',
}

type Step = 'category' | 'template' | 'form'

export default function MissionCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Check if coming from a template or parent mission
  const preselectedCategoryId = searchParams.get('categoryId')
  const parentMissionId = searchParams.get('parentId')

  const [step, setStep] = useState<Step>(preselectedCategoryId ? 'template' : 'category')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(preselectedCategoryId || '')
  const [selectedTemplate, setSelectedTemplate] = useState<MissionTemplate | null>(null)

  const { categories, isLoading: isCategoriesLoading } = useLifeCycleCategories()
  const { templates, isLoading: isTemplatesLoading } = useMissionTemplates(selectedCategoryId || undefined)
  const { createMission, isLoading: isCreating } = useCreateMission()

  // Get today's date for default start date
  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionSchema),
    defaultValues: {
      categoryId: selectedCategoryId,
      type: parentMissionId ? 'monthly' : 'main',
      startDate: today,
      endDate: '',
      parentMissionId: parentMissionId || undefined,
    },
  })

  const watchedType = watch('type')

  // Update form when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      setValue('categoryId', selectedCategoryId)
    }
  }, [selectedCategoryId, setValue])

  // Update form when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setValue('name', selectedTemplate.name)
      setValue('description', selectedTemplate.description)
      setValue('targetAmount', selectedTemplate.defaultTargetAmount)
      setValue('type', selectedTemplate.type)
      setValue('templateId', selectedTemplate.id)

      // Calculate end date based on default duration
      if (selectedTemplate.defaultDuration > 0) {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + selectedTemplate.defaultDuration)
        setValue('endDate', endDate.toISOString().split('T')[0])
      }
    }
  }, [selectedTemplate, setValue])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setStep('template')
  }

  const handleTemplateSelect = (template: MissionTemplate | null) => {
    setSelectedTemplate(template)
    setStep('form')
  }

  const handleSkipTemplate = () => {
    setSelectedTemplate(null)
    setStep('form')
  }

  const handleBack = () => {
    if (step === 'form') {
      setStep('template')
    } else if (step === 'template') {
      if (preselectedCategoryId) {
        navigate(-1)
      } else {
        setStep('category')
      }
    } else {
      navigate(-1)
    }
  }

  const onSubmit = (data: CreateMissionFormData) => {
    createMission({
      ...data,
      sharedAccountIds: [], // TODO: Add account selection
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const parseAmount = (value: string): number => {
    return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
  }

  // Category selection step
  if (step === 'category') {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-stone-600">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-stone-900">카테고리 선택</h1>
          </div>
        </header>

        <main className="mx-auto px-4 py-6">
          <p className="mb-6 text-stone-600">
            어떤 목표를 위해 미션을 만드시나요?
          </p>

          {isCategoriesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:border-primary-500 hover:bg-primary-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {categoryIcons[category.icon] || '📋'}
                    </span>
                    <div className="text-left">
                      <p className="font-medium text-stone-900">{category.name}</p>
                      <p className="text-sm text-stone-500">{category.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-400" />
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  // Template selection step
  if (step === 'template') {
    const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="text-stone-600">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-stone-900">템플릿 선택</h1>
              {selectedCategory && (
                <p className="text-sm text-stone-500">
                  {categoryIcons[selectedCategory.icon] || '📋'} {selectedCategory.name}
                </p>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto px-4 py-6">
          <p className="mb-6 text-stone-600">
            추천 템플릿을 선택하거나 직접 만들어보세요.
          </p>

          {isTemplatesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Custom mission option */}
              <button
                onClick={handleSkipTemplate}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl border-2 border-dashed border-stone-300 hover:border-primary-500 hover:bg-primary-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
                    <span className="text-xl">✏️</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-stone-900">직접 만들기</p>
                    <p className="text-sm text-stone-500">나만의 미션을 만들어보세요</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-400" />
              </button>

              {/* Template options */}
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:border-primary-500 hover:bg-primary-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                      <span className="text-xl">{template.icon || '🎯'}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-stone-900">{template.name}</p>
                      <p className="text-sm text-stone-500">{template.description}</p>
                      <p className="text-xs text-primary-600 mt-1">
                        목표: {formatAmount(template.defaultTargetAmount)}원 · {template.defaultDuration}일
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-400" />
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  // Form step
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-stone-600">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-stone-900">
              {selectedTemplate ? '템플릿 수정' : '새 미션 만들기'}
            </h1>
            {selectedCategory && (
              <p className="text-sm text-stone-500">
                {categoryIcons[selectedCategory.icon] || '📋'} {selectedCategory.name}
              </p>
            )}
          </div>
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

              {/* Mission Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  미션 유형
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(missionTypeLabels) as MissionType[]).map((type) => (
                    <label
                      key={type}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition ${
                        watchedType === type
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={type}
                        {...register('type')}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{missionTypeLabels[type]}</span>
                      {watchedType === type && <Check className="h-4 w-4" />}
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
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
                <Input
                  type="date"
                  label="시작일"
                  error={errors.startDate?.message}
                  {...register('startDate')}
                />
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
            <div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isCreating}
              >
                미션 생성하기
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
