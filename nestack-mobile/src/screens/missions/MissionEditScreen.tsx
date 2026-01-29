import React from 'react'
import { ScrollView, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { Stack, Text } from 'tamagui'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'
import { Screen } from '../../shared/components/layout/Screen'
import { useMission, useUpdateMission } from '../../features/mission/hooks'
import type { MissionStackParamList } from '../../app/navigation/types'
import { ArrowLeft, Target, DollarSign, Calendar } from 'lucide-react-native'

type Props = NativeStackScreenProps<MissionStackParamList, 'MissionEdit'>

const editMissionSchema = z.object({
  name: z.string().min(1, '미션 이름을 입력해주세요').max(100, '100자 이하로 입력해주세요'),
  description: z.string().optional(),
  targetAmount: z.string().min(1, '목표 금액을 입력해주세요'),
  endDate: z.string().min(1, '종료일을 입력해주세요'),
})

type EditMissionForm = z.infer<typeof editMissionSchema>

export default function MissionEditScreen({ navigation, route }: Props) {
  const { id } = route.params
  const { data: mission, isLoading: isMissionLoading } = useMission(id)
  const { mutate: updateMission, isPending } = useUpdateMission(id)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditMissionForm>({
    resolver: zodResolver(editMissionSchema),
    values: mission
      ? {
          name: mission.name,
          description: mission.description ?? '',
          targetAmount: String(mission.targetAmount),
          endDate: mission.endDate.split('T')[0],
        }
      : undefined,
  })

  const onSubmit = (data: EditMissionForm) => {
    updateMission(
      {
        name: data.name,
        description: data.description,
        targetAmount: Number(data.targetAmount),
        endDate: data.endDate,
      },
      {
        onSuccess: () => {
          navigation.goBack()
        },
      },
    )
  }

  if (isMissionLoading || !mission) {
    return (
      <Screen edges={['top']}>
        <Stack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#059669" />
        </Stack>
      </Screen>
    )
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
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1c1917" />
        </Pressable>
        <Text fontSize={18} fontWeight="700" color="#1c1917" marginLeft={12}>
          미션 수정
        </Text>
      </Stack>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
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
                leftIcon={<Target size={20} color="#a8a29e" />}
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
                leftIcon={<DollarSign size={20} color="#a8a29e" />}
                error={errors.targetAmount?.message}
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
                leftIcon={<Calendar size={20} color="#a8a29e" />}
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
              수정 완료
            </Button>
          </Stack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
