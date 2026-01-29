import React from 'react'
import { KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { Stack, Text } from 'tamagui'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'
import { Screen } from '../../shared/components/layout/Screen'
import { useAuthStore } from '../../store/authStore'
import { apiClient } from '../../api/client'
import { API_ENDPOINTS } from '../../api/endpoints'
import type { MyPageStackParamList } from '../../app/navigation/types'
import { ArrowLeft, User } from 'lucide-react-native'
import Toast from 'react-native-toast-message'

type Props = NativeStackScreenProps<MyPageStackParamList, 'ProfileEdit'>

const profileSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(50, '이름은 50자 이하여야 합니다'),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfileEditScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await apiClient.put(API_ENDPOINTS.USERS.ME, data)
      return response.data
    },
    onSuccess: (data: any) => {
      if (user) {
        setUser({ ...user, name: data.name ?? user.name })
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
    },
  })

  const onSubmit = (data: ProfileForm) => {
    updateProfile(
      { name: data.name },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: '프로필 수정 완료',
            text2: '이름이 성공적으로 변경되었습니다',
          })
          navigation.goBack()
        },
        onError: (error: any) => {
          const message =
            error?.body?.error?.message ?? '프로필 수정에 실패했습니다'
          Toast.show({
            type: 'error',
            text1: '수정 실패',
            text2: message,
          })
        },
      },
    )
  }

  return (
    <Screen scrollable={false} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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
            프로필 수정
          </Text>
        </Stack>

        <Stack flex={1} paddingHorizontal={24} paddingTop={24} gap={24}>
          {/* Avatar */}
          <Stack alignItems="center" marginBottom={8}>
            <Stack
              width={80}
              height={80}
              borderRadius={40}
              backgroundColor="#d1fae5"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={36} fontWeight="700" color="#059669">
                {user?.name?.charAt(0) ?? 'N'}
              </Text>
            </Stack>
          </Stack>

          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="이름"
                placeholder="이름을 입력하세요"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon={<User size={20} color="#a8a29e" />}
                error={errors.name?.message}
              />
            )}
          />

          {/* Email (read-only) */}
          <Stack gap={6}>
            <Text fontSize={14} fontWeight="600" color="#1c1917">
              이메일
            </Text>
            <Stack
              backgroundColor="#f5f5f4"
              borderRadius={12}
              padding={14}
            >
              <Text fontSize={14} color="#78716c">
                {user?.email ?? ''}
              </Text>
            </Stack>
            <Text fontSize={12} color="#a8a29e">
              이메일은 변경할 수 없습니다
            </Text>
          </Stack>

          {/* Submit */}
          <Button
            onPress={handleSubmit(onSubmit)}
            isLoading={isPending}
            fullWidth
            size="lg"
          >
            저장
          </Button>
        </Stack>
      </KeyboardAvoidingView>
    </Screen>
  )
}
