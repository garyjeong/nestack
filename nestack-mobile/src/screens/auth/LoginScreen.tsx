import React from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { Stack, Text } from 'tamagui'
import { Button } from '../../shared/components/ui/Button'
import { Screen } from '../../shared/components/layout/Screen'
import { useGoogleLogin } from '../../features/auth/hooks'

export default function LoginScreen() {
  const { signInWithGoogle, isLoading } = useGoogleLogin()

  return (
    <Screen scrollable={false} edges={['top', 'bottom']}>
      <Stack flex={1} justifyContent="center" paddingHorizontal={24} gap={32}>
        {/* Logo & Title */}
        <Stack alignItems="center" gap={16}>
          <Text fontSize={40} fontWeight="800" color="#059669">
            Nestack
          </Text>
          <Text fontSize={16} color="#78716c" textAlign="center">
            함께 만드는 재무 목표{'\n'}
            커플의 자산 관리를 시작하세요
          </Text>
        </Stack>

        {/* Illustration */}
        <Stack alignItems="center" paddingVertical={40}>
          <View style={styles.illustrationContainer}>
            <Text fontSize={64}>💰</Text>
          </View>
        </Stack>

        {/* Google Login Button */}
        <Stack gap={16}>
          <Button
            onPress={signInWithGoogle}
            isLoading={isLoading}
            fullWidth
            size="lg"
            style={styles.googleButton}
          >
            <Stack flexDirection="row" alignItems="center" gap={12}>
              <Text fontSize={18}>G</Text>
              <Text fontSize={16} fontWeight="600">
                Google로 계속하기
              </Text>
            </Stack>
          </Button>

          <Text fontSize={12} color="#a8a29e" textAlign="center">
            계속 진행하면 서비스 이용약관 및{'\n'}
            개인정보 처리방침에 동의하는 것으로 간주됩니다.
          </Text>
        </Stack>
      </Stack>
    </Screen>
  )
}

const styles = StyleSheet.create({
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
})
