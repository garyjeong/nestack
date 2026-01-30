import React, { useState } from 'react'
import { ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { Stack, Text } from 'tamagui'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'
import { Screen } from '../../shared/components/layout/Screen'
import { useTheme } from '../../shared/hooks/useTheme'
import {
  useLifeCycleCategories,
  useMissionTemplates,
  useCreateMission,
} from '../../features/mission/hooks'
import type { LifeCycleCategory, MissionTemplate, MissionType } from '../../features/mission/types'
import type { MissionStackParamList } from '../../app/navigation/types'
import { formatCurrency } from '../../shared/utils/format'
import {
  ArrowLeft,
  Target,
  ChevronRight,
  Check,
  Calendar,
  DollarSign,
} from 'lucide-react-native'

type Props = NativeStackScreenProps<MissionStackParamList, 'MissionCreate'>

type Step = 'category' | 'template' | 'form'

const MISSION_TYPES: { key: MissionType; label: string }[] = [
  { key: 'main', label: '메인 미션' },
  { key: 'monthly', label: '월간 미션' },
  { key: 'weekly', label: '주간 미션' },
  { key: 'daily', label: '일일 미션' },
]

const missionSchema = z.object({
  name: z.string().min(1, '미션 이름을 입력해주세요').max(100, '100자 이하로 입력해주세요'),
  description: z.string().optional(),
  targetAmount: z.string().min(1, '목표 금액을 입력해주세요'),
  startDate: z.string().min(1, '시작일을 선택해주세요'),
  endDate: z.string().min(1, '종료일을 선택해주세요'),
})

type MissionForm = z.infer<typeof missionSchema>

export default function MissionCreateScreen({ navigation, route }: Props) {
  const { colors } = useTheme()
  const initialCategoryId = route.params?.categoryId
  const initialTemplateId = route.params?.templateId

  const [step, setStep] = useState<Step>(
    initialTemplateId ? 'form' : initialCategoryId ? 'template' : 'category',
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
    initialCategoryId,
  )
  const [selectedTemplate, setSelectedTemplate] = useState<MissionTemplate | undefined>()
  const [selectedType, setSelectedType] = useState<MissionType>('main')

  const { data: categories } = useLifeCycleCategories()
  const { data: templates } = useMissionTemplates(selectedCategoryId)
  const { mutate: createMission, isPending } = useCreateMission()

  const today = new Date().toISOString().split('T')[0]

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MissionForm>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      name: '',
      description: '',
      targetAmount: '',
      startDate: today,
      endDate: '',
    },
  })

  const handleSelectCategory = (category: LifeCycleCategory) => {
    setSelectedCategoryId(category.id)
    setStep('template')
  }

  const handleSelectTemplate = (template: MissionTemplate) => {
    setSelectedTemplate(template)
    setValue('name', template.name)
    setValue('targetAmount', String(template.defaultTargetAmount))
    setSelectedType(template.type)
    // Set end date based on default duration
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + template.defaultDuration)
    setValue('endDate', endDate.toISOString().split('T')[0])
    setStep('form')
  }

  const handleSkipTemplate = () => {
    setStep('form')
  }

  const onSubmit = (data: MissionForm) => {
    createMission(
      {
        categoryId: selectedCategoryId!,
        templateId: selectedTemplate?.id,
        name: data.name,
        description: data.description,
        type: selectedType,
        targetAmount: Number(data.targetAmount),
        startDate: data.startDate,
        endDate: data.endDate,
      },
      {
        onSuccess: () => {
          navigation.goBack()
        },
      },
    )
  }

  const getStepTitle = () => {
    switch (step) {
      case 'category': return '카테고리 선택'
      case 'template': return '템플릿 선택'
      case 'form': return '미션 설정'
    }
  }

  return (
    <Screen edges={['top']}>
      {/* Header */}
      <Stack
        flexDirection="row"
        alignItems="center"
        paddingHorizontal={16}
        paddingVertical={12}
      >
        <Pressable
          onPress={() => {
            if (step === 'form' && !initialTemplateId) {
              setStep(selectedTemplate ? 'template' : 'category')
            } else if (step === 'template') {
              setStep('category')
            } else {
              navigation.goBack()
            }
          }}
        >
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text fontSize={18} fontWeight="700" color={colors.text} marginLeft={12}>
          {getStepTitle()}
        </Text>
      </Stack>

      {/* Step: Category Selection */}
      {step === 'category' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, gap: 12 }}
        >
          <Text fontSize={15} color={colors.textSecondary} marginBottom={8}>
            미션의 라이프사이클 카테고리를 선택하세요
          </Text>
          {(categories ?? []).map((category) => (
            <Pressable key={category.id} onPress={() => handleSelectCategory(category)}>
              <Stack
                backgroundColor={colors.card}
                borderRadius={4}
                padding={16}
                borderWidth={1}
                borderColor={selectedCategoryId === category.id ? colors.primary : colors.border}
                flexDirection="row"
                alignItems="center"
              >
                <Stack
                  width={44}
                  height={44}
                  borderRadius={4}
                  backgroundColor={`${colors.primary}15`}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Target size={22} color={colors.primary} />
                </Stack>
                <Stack flex={1} marginLeft={12}>
                  <Text fontSize={15} fontWeight="600" color={colors.text}>
                    {category.name}
                  </Text>
                  <Text fontSize={12} color={colors.textSecondary} marginTop={2} numberOfLines={2}>
                    {category.description}
                  </Text>
                </Stack>
                <ChevronRight size={20} color={colors.border} />
              </Stack>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Step: Template Selection */}
      {step === 'template' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, gap: 12 }}
        >
          <Text fontSize={15} color={colors.textSecondary} marginBottom={8}>
            추천 템플릿을 선택하거나 직접 만들 수 있습니다
          </Text>

          {/* Custom option */}
          <Pressable onPress={handleSkipTemplate}>
            <Stack
              backgroundColor={colors.card}
              borderRadius={4}
              padding={16}
              borderWidth={1}
              borderColor={colors.border}
              borderStyle="dashed"
              flexDirection="row"
              alignItems="center"
            >
              <Stack
                width={44}
                height={44}
                borderRadius={4}
                backgroundColor={colors.backgroundSecondary}
                alignItems="center"
                justifyContent="center"
              >
                <Target size={22} color={colors.textSecondary} />
              </Stack>
              <Stack flex={1} marginLeft={12}>
                <Text fontSize={15} fontWeight="600" color={colors.text}>
                  직접 만들기
                </Text>
                <Text fontSize={12} color={colors.textSecondary} marginTop={2}>
                  나만의 미션을 직접 설정하세요
                </Text>
              </Stack>
              <ChevronRight size={20} color={colors.border} />
            </Stack>
          </Pressable>

          {/* Templates */}
          {(templates ?? []).map((template) => (
            <Pressable key={template.id} onPress={() => handleSelectTemplate(template)}>
              <Stack
                backgroundColor={colors.card}
                borderRadius={4}
                padding={16}
                borderWidth={1}
                borderColor={colors.border}
                flexDirection="row"
                alignItems="center"
              >
                <Stack
                  width={44}
                  height={44}
                  borderRadius={4}
                  backgroundColor={`${colors.primary}15`}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Target size={22} color={colors.primary} />
                </Stack>
                <Stack flex={1} marginLeft={12}>
                  <Text fontSize={15} fontWeight="600" color={colors.text}>
                    {template.name}
                  </Text>
                  <Text fontSize={12} color={colors.textSecondary} marginTop={2} numberOfLines={1}>
                    목표: {formatCurrency(template.defaultTargetAmount)} / {template.defaultDuration}일
                  </Text>
                </Stack>
                <ChevronRight size={20} color={colors.border} />
              </Stack>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Step: Form */}
      {step === 'form' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, gap: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Mission Type */}
            <Stack gap={8}>
              <Text fontSize={14} fontWeight="600" color={colors.text}>
                미션 유형
              </Text>
              <Stack flexDirection="row" flexWrap="wrap" gap={8}>
                {MISSION_TYPES.map((type) => {
                  const isActive = selectedType === type.key
                  return (
                    <Pressable key={type.key} onPress={() => setSelectedType(type.key)}>
                      <Stack
                        paddingHorizontal={14}
                        paddingVertical={8}
                        borderRadius={4}
                        backgroundColor={isActive ? colors.primary : colors.card}
                        borderWidth={1}
                        borderColor={isActive ? colors.primary : colors.border}
                        flexDirection="row"
                        alignItems="center"
                        gap={4}
                      >
                        {isActive && <Check size={14} color="#ffffff" />}
                        <Text
                          fontSize={13}
                          fontWeight="500"
                          color={isActive ? '#ffffff' : colors.textSecondary}
                        >
                          {type.label}
                        </Text>
                      </Stack>
                    </Pressable>
                  )
                })}
              </Stack>
            </Stack>

            {/* Name */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="미션 이름"
                  placeholder="미션 이름을 입력하세요"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon={<Target size={20} color={colors.textTertiary} />}
                  error={errors.name?.message}
                />
              )}
            />

            {/* Description */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="설명 (선택)"
                  placeholder="미션에 대한 설명을 입력하세요"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                />
              )}
            />

            {/* Target Amount */}
            <Controller
              control={control}
              name="targetAmount"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="목표 금액"
                  placeholder="목표 금액을 입력하세요"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  leftIcon={<DollarSign size={20} color={colors.textTertiary} />}
                  error={errors.targetAmount?.message}
                />
              )}
            />

            {/* Start Date */}
            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="시작일"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  leftIcon={<Calendar size={20} color={colors.textTertiary} />}
                  error={errors.startDate?.message}
                />
              )}
            />

            {/* End Date */}
            <Controller
              control={control}
              name="endDate"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="종료일"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  leftIcon={<Calendar size={20} color={colors.textTertiary} />}
                  error={errors.endDate?.message}
                />
              )}
            />

            {/* Submit */}
            <Stack marginTop={8}>
              <Button
                onPress={handleSubmit(onSubmit)}
                isLoading={isPending}
                fullWidth
                size="lg"
              >
                미션 생성
              </Button>
            </Stack>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  )
}
