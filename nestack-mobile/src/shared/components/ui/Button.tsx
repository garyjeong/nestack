import React, { useCallback } from 'react'
import { ActivityIndicator, Platform } from 'react-native'
import { Stack, Text } from 'tamagui'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { useTheme } from '@/shared/hooks/useTheme'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
  onPress?: () => void
}

const sizeStyles = {
  sm: { height: 40, paddingHorizontal: 16, fontSize: 14, iconSize: 16 },
  md: { height: 48, paddingHorizontal: 20, fontSize: 15, iconSize: 18 },
  lg: { height: 56, paddingHorizontal: 24, fontSize: 16, iconSize: 20 },
}

// 햅틱 피드백 함수
const triggerHaptic = () => {
  if (Platform.OS === 'ios') {
    // iOS native haptic via Reanimated
  }
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  fullWidth,
  leftIcon,
  rightIcon,
  children,
  onPress,
}: ButtonProps) {
  const { colors, isDark } = useTheme()
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  // 테마 기반 variant 스타일
  const getVariantStyle = useCallback(() => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.primary,
          pressedBg: colors.primary + 'E0',
          color: '#FFFFFF',
          borderColor: 'transparent',
          borderWidth: 0,
        }
      case 'secondary':
        return {
          bg: isDark ? colors.card : colors.backgroundSecondary,
          pressedBg: isDark ? colors.border : colors.border,
          color: colors.text,
          borderColor: 'transparent',
          borderWidth: 0,
        }
      case 'outline':
        return {
          bg: 'transparent',
          pressedBg: colors.backgroundSecondary,
          color: colors.primary,
          borderColor: colors.primary,
          borderWidth: 1.5,
        }
      case 'ghost':
        return {
          bg: 'transparent',
          pressedBg: colors.backgroundSecondary,
          color: colors.text,
          borderColor: 'transparent',
          borderWidth: 0,
        }
      case 'danger':
        return {
          bg: colors.error,
          pressedBg: colors.error + 'E0',
          color: '#FFFFFF',
          borderColor: 'transparent',
          borderWidth: 0,
        }
      case 'success':
        return {
          bg: colors.success,
          pressedBg: colors.success + 'E0',
          color: '#FFFFFF',
          borderColor: 'transparent',
          borderWidth: 0,
        }
      default:
        return {
          bg: colors.primary,
          pressedBg: colors.primary + 'E0',
          color: '#FFFFFF',
          borderColor: 'transparent',
          borderWidth: 0,
        }
    }
  }, [variant, colors, isDark])

  const v = getVariantStyle()
  const s = sizeStyles[size]
  const isDisabled = disabled || isLoading

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 400,
    })
    opacity.value = withTiming(0.9, { duration: 100 })
  }, [])

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    })
    opacity.value = withTiming(1, { duration: 100 })
  }, [])

  const handlePress = useCallback(() => {
    if (isDisabled || !onPress) return
    runOnJS(triggerHaptic)()
    onPress()
  }, [isDisabled, onPress])

  return (
    <Animated.View
      style={[
        animatedStyle,
        fullWidth ? { width: '100%' } : undefined,
      ]}
    >
      <Stack
        onPressIn={isDisabled ? undefined : handlePressIn}
        onPressOut={isDisabled ? undefined : handlePressOut}
        onPress={handlePress}
        backgroundColor={v.bg}
        borderColor={v.borderColor}
        borderWidth={v.borderWidth}
        height={s.height}
        paddingHorizontal={s.paddingHorizontal}
        borderRadius={4}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap={10}
        opacity={isDisabled ? 0.5 : 1}
        width={fullWidth ? '100%' : undefined}
        // 그림자 (primary, danger, success에만)
        {...(variant === 'primary' || variant === 'danger' || variant === 'success'
          ? {
              shadowColor: v.bg,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }
          : {})}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={v.color} />
        ) : (
          <>
            {leftIcon}
            <Text color={v.color} fontSize={s.fontSize} fontWeight="600">
              {children}
            </Text>
            {rightIcon}
          </>
        )}
      </Stack>
    </Animated.View>
  )
}

// 아이콘 버튼 (원형)
interface IconButtonProps {
  icon: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onPress?: () => void
  disabled?: boolean
}

const iconButtonSizes = {
  sm: 36,
  md: 44,
  lg: 52,
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  onPress,
  disabled,
}: IconButtonProps) {
  const { colors, isDark } = useTheme()
  const scale = useSharedValue(1)

  const getStyle = useCallback(() => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primary, color: '#FFFFFF' }
      case 'secondary':
        return { bg: isDark ? colors.card : colors.backgroundSecondary, color: colors.text }
      case 'ghost':
      default:
        return { bg: 'transparent', color: colors.textSecondary }
    }
  }, [variant, colors, isDark])

  const style = getStyle()
  const buttonSize = iconButtonSizes[size]

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 })
  }, [])

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }, [])

  return (
    <Animated.View style={animatedStyle}>
      <Stack
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        onPress={disabled ? undefined : onPress}
        width={buttonSize}
        height={buttonSize}
        borderRadius={buttonSize / 2}
        backgroundColor={style.bg}
        alignItems="center"
        justifyContent="center"
        opacity={disabled ? 0.5 : 1}
      >
        {icon}
      </Stack>
    </Animated.View>
  )
}

// FAB (Floating Action Button)
interface FABProps {
  icon: React.ReactNode
  onPress?: () => void
  disabled?: boolean
}

export function FAB({ icon, onPress, disabled }: FABProps) {
  const { colors } = useTheme()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 })
  }, [])

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }, [])

  return (
    <Animated.View style={animatedStyle}>
      <Stack
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        onPress={disabled ? undefined : onPress}
        width={60}
        height={60}
        borderRadius={30}
        backgroundColor={colors.primary}
        alignItems="center"
        justifyContent="center"
        opacity={disabled ? 0.5 : 1}
        shadowColor={colors.primary}
        shadowOffset={{ width: 0, height: 6 }}
        shadowOpacity={0.4}
        shadowRadius={12}
      >
        {icon}
      </Stack>
    </Animated.View>
  )
}
