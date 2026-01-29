import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { Stack, Text } from 'tamagui'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import { Screen } from '@/shared/components/layout/Screen'
import { GoogleIcon } from '@/shared/components/icons/GoogleIcon'
import { useGoogleLogin } from '@/features/auth/hooks'
import { useTheme } from '@/shared/hooks/useTheme'

export default function LoginScreen() {
  const { signInWithGoogle, isLoading } = useGoogleLogin()
  const { colors, palette } = useTheme()
  const scale = useSharedValue(1)

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  return (
    <Screen scrollable={false} edges={['top', 'bottom']}>
      <Stack flex={1} justifyContent="center" paddingHorizontal={24} gap={32}>
        {/* Logo & Title */}
        <Animated.View entering={FadeIn.duration(600)}>
          <Stack alignItems="center">
            <Text fontSize={52} fontWeight="800" color={colors.primary}>
              Nestack
            </Text>
          </Stack>
        </Animated.View>

        {/* Illustration */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Stack alignItems="center" paddingVertical={40}>
            <LinearGradient
              colors={[...palette.gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.illustrationContainer}
            >
              <View style={styles.illustrationInner}>
                <Text fontSize={56}>💰</Text>
              </View>
            </LinearGradient>
          </Stack>
        </Animated.View>

        {/* Google Login Button */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Stack gap={16}>
            <TouchableOpacity
              onPress={signInWithGoogle}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isLoading}
              activeOpacity={1}
            >
              <Animated.View style={animatedButtonStyle}>
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  gap={12}
                  height={56}
                  backgroundColor={colors.card}
                  borderRadius={14}
                  borderWidth={1}
                  borderColor={colors.border}
                  shadowColor="rgba(0,0,0,0.08)"
                  shadowOffset={{ width: 0, height: 4 }}
                  shadowOpacity={1}
                  shadowRadius={12}
                  opacity={isLoading ? 0.6 : 1}
                >
                  {/* Google Logo */}
                  <GoogleIcon size={20} />
                  <Text fontSize={16} fontWeight="600" color={colors.text}>
                    {isLoading ? '로그인 중...' : 'Google로 계속하기'}
                  </Text>
                </Stack>
              </Animated.View>
            </TouchableOpacity>

            <Text fontSize={12} color={colors.textTertiary} textAlign="center">
              계속 진행하면 서비스 이용약관 및{'\n'}
              개인정보 처리방침에 동의하는 것으로 간주됩니다.
            </Text>
          </Stack>
        </Animated.View>
      </Stack>
    </Screen>
  )
}

const styles = StyleSheet.create({
  illustrationContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 6,
  },
  illustrationInner: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
