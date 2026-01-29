import React from 'react'
import { Stack, Text } from 'tamagui'
import { useMutation } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button } from '../../shared/components/ui/Button'
import { Screen } from '../../shared/components/layout/Screen'
import type { OnboardingStackParamList } from '../../app/navigation/types'
import { useAuthStore } from '../../store/authStore'
import { Users, UserPlus, Heart } from 'lucide-react-native'
import Toast from 'react-native-toast-message'

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>

export default function WelcomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user)

  const { mutate: createFamily, isPending } = useMutation({
    mutationFn: async () => {
      // This will be wired to family API
      const { apiClient } = await import('../../api/client')
      const { API_ENDPOINTS } = await import('../../api/endpoints')
      const response = await apiClient.post(API_ENDPOINTS.FAMILY.BASE, {})
      return response.data
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '가족 생성 완료',
        text2: '새로운 가족 그룹이 만들어졌습니다!',
      })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '가족 생성에 실패했습니다'
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: message,
      })
    },
  })

  return (
    <Screen scrollable={false} edges={['top', 'bottom']}>
      <Stack flex={1} justifyContent="center" paddingHorizontal={24}>
        {/* Illustration area */}
        <Stack alignItems="center" marginBottom={48}>
          <Stack
            width={120}
            height={120}
            borderRadius={60}
            backgroundColor="#ecfdf5"
            alignItems="center"
            justifyContent="center"
            marginBottom={24}
          >
            <Heart size={56} color="#059669" />
          </Stack>

          <Text fontSize={28} fontWeight="800" color="#1c1917" textAlign="center">
            환영합니다{user?.name ? `, ${user.name}님` : ''}!
          </Text>
          <Text
            fontSize={15}
            color="#78716c"
            textAlign="center"
            marginTop={12}
            lineHeight={24}
          >
            Nestack과 함께 가족의 재무 목표를{'\n'}
            달성해보세요. 가족 그룹에 참여하거나{'\n'}
            새로운 그룹을 만들어 시작할 수 있습니다.
          </Text>
        </Stack>

        {/* Action buttons */}
        <Stack gap={16}>
          {/* Create new family */}
          <Button
            onPress={() => createFamily()}
            isLoading={isPending}
            fullWidth
            size="lg"
          >
            <Stack flexDirection="row" alignItems="center" gap={8}>
              <Users size={20} color="#ffffff" />
              <Text fontSize={16} fontWeight="600" color="#ffffff">
                새로운 가족 만들기
              </Text>
            </Stack>
          </Button>

          {/* Join with invite code */}
          <Button
            variant="outline"
            onPress={() => navigation.navigate('InviteCode', {})}
            fullWidth
            size="lg"
          >
            <Stack flexDirection="row" alignItems="center" gap={8}>
              <UserPlus size={20} color="#059669" />
              <Text fontSize={16} fontWeight="600" color="#059669">
                초대코드로 참여하기
              </Text>
            </Stack>
          </Button>
        </Stack>

        {/* Help text */}
        <Text
          fontSize={12}
          color="#a8a29e"
          textAlign="center"
          marginTop={32}
          lineHeight={20}
        >
          가족 구성원으로부터 초대코드를 받으셨나요?{'\n'}
          초대코드를 입력하여 기존 가족 그룹에 참여하세요.
        </Text>
      </Stack>
    </Screen>
  )
}
