import React, { useRef, useState, useEffect } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, TextInput } from 'react-native'
import { Stack, Text } from 'tamagui'
import { useMutation } from '@tanstack/react-query'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button } from '../../shared/components/ui/Button'
import { Screen } from '../../shared/components/layout/Screen'
import { useTheme } from '../../shared/hooks/useTheme'
import type { OnboardingStackParamList } from '../../app/navigation/types'
import { ArrowLeft, TicketCheck } from 'lucide-react-native'
import Toast from 'react-native-toast-message'

type Props = NativeStackScreenProps<OnboardingStackParamList, 'InviteCode'>

const CODE_LENGTH = 12 // XXXX-XXXX-XXXX = 12 chars without dashes
const SEGMENT_LENGTH = 4

export default function InviteCodeScreen({ navigation, route }: Props) {
  const { colors } = useTheme()
  const initialCode = route.params?.code ?? ''
  const [codeSegments, setCodeSegments] = useState<string[]>(() => {
    const cleaned = initialCode.replace(/-/g, '').toUpperCase()
    return [
      cleaned.slice(0, 4),
      cleaned.slice(4, 8),
      cleaned.slice(8, 12),
    ]
  })
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null])

  const fullCode = codeSegments.join('-')
  const isCodeComplete = codeSegments.every((seg) => seg.length === SEGMENT_LENGTH)

  const { mutate: joinFamily, isPending } = useMutation({
    mutationFn: async (inviteCode: string) => {
      const { apiClient } = await import('../../api/client')
      const { API_ENDPOINTS } = await import('../../api/endpoints')
      const response = await apiClient.post(API_ENDPOINTS.FAMILY.JOIN, { inviteCode })
      return response.data
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '가족 참여 완료',
        text2: '가족 그룹에 성공적으로 참여했습니다!',
      })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '초대코드가 유효하지 않습니다'
      Toast.show({
        type: 'error',
        text1: '참여 실패',
        text2: message,
      })
    },
  })

  useEffect(() => {
    // Auto-submit if code came from deep link and is complete
    if (initialCode && isCodeComplete) {
      joinFamily(fullCode)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSegmentChange = (index: number, text: string) => {
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    const newSegments = [...codeSegments]
    newSegments[index] = cleaned.slice(0, SEGMENT_LENGTH)
    setCodeSegments(newSegments)

    // Auto-advance to next segment
    if (cleaned.length === SEGMENT_LENGTH && index < 2) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (index: number, key: string) => {
    // Go back on backspace when current segment is empty
    if (key === 'Backspace' && codeSegments[index].length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = () => {
    if (isCodeComplete) {
      joinFamily(fullCode)
    }
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
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text fontSize={18} fontWeight="700" color={colors.text} marginLeft={12}>
            초대코드 입력
          </Text>
        </Stack>

        <Stack flex={1} paddingHorizontal={24} paddingTop={32}>
          {/* Icon */}
          <Stack alignItems="center" marginBottom={32}>
            <Stack
              width={80}
              height={80}
              borderRadius={4}
              backgroundColor={`${colors.primary}15`}
              alignItems="center"
              justifyContent="center"
              marginBottom={16}
            >
              <TicketCheck size={40} color={colors.primary} />
            </Stack>
            <Text fontSize={16} fontWeight="600" color={colors.text} textAlign="center">
              초대코드를 입력해주세요
            </Text>
            <Text
              fontSize={14}
              color={colors.textSecondary}
              textAlign="center"
              marginTop={8}
              lineHeight={22}
            >
              가족 구성원에게 받은 초대코드를{'\n'}아래에 입력하세요.
            </Text>
          </Stack>

          {/* Code Input */}
          <Stack flexDirection="row" justifyContent="center" alignItems="center" gap={8}>
            {[0, 1, 2].map((index) => (
              <React.Fragment key={index}>
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref
                  }}
                  value={codeSegments[index]}
                  onChangeText={(text) => handleSegmentChange(index, text)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  maxLength={SEGMENT_LENGTH}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={{
                    width: 90,
                    height: 52,
                    borderWidth: 1.5,
                    borderColor:
                      codeSegments[index].length === SEGMENT_LENGTH
                        ? colors.primary
                        : colors.border,
                    borderRadius: 4,
                    fontSize: 18,
                    fontWeight: '700',
                    textAlign: 'center',
                    color: colors.text,
                    backgroundColor: colors.card,
                    letterSpacing: 2,
                  }}
                />
                {index < 2 && (
                  <Text fontSize={20} fontWeight="700" color={colors.border}>
                    -
                  </Text>
                )}
              </React.Fragment>
            ))}
          </Stack>

          {/* Submit */}
          <Stack marginTop={32}>
            <Button
              onPress={handleSubmit}
              isLoading={isPending}
              disabled={!isCodeComplete}
              fullWidth
              size="lg"
            >
              가족 참여하기
            </Button>
          </Stack>

          {/* Help */}
          <Text
            fontSize={12}
            color={colors.textTertiary}
            textAlign="center"
            marginTop={24}
            lineHeight={20}
          >
            초대코드는 XXXX-XXXX-XXXX 형식입니다.{'\n'}
            코드를 모르시면 가족 구성원에게 문의해주세요.
          </Text>
        </Stack>
      </KeyboardAvoidingView>
    </Screen>
  )
}
