import React, { useCallback } from 'react'
import { Stack, type StackProps } from 'tamagui'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useTheme } from '@/shared/hooks/useTheme'

interface CardProps extends Omit<StackProps, 'onPress'> {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'elevated' | 'flat'
  pressable?: boolean
  onPress?: () => void
}

export function Card({
  children,
  variant = 'default',
  pressable = false,
  onPress,
  ...props
}: CardProps) {
  const { colors, isDark } = useTheme()
  const scale = useSharedValue(1)

  const getVariantStyle = useCallback(() => {
    const baseStyle = {
      backgroundColor: colors.card,
      borderRadius: 20,
    }

    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 1,
          shadowRadius: 12,
          elevation: 4,
        }
      case 'outline':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.border,
        }
      case 'elevated':
        return {
          ...baseStyle,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.4 : 1,
          shadowRadius: 16,
          elevation: 8,
        }
      case 'flat':
        return {
          ...baseStyle,
          backgroundColor: colors.backgroundSecondary,
        }
      default:
        return baseStyle
    }
  }, [variant, colors, isDark])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    if (pressable) {
      scale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 400,
      })
    }
  }, [pressable])

  const handlePressOut = useCallback(() => {
    if (pressable) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 400,
      })
    }
  }, [pressable])

  const variantStyle = getVariantStyle()

  if (pressable) {
    return (
      <Animated.View style={animatedStyle}>
        <Stack
          padding={20}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          {...variantStyle}
          {...props}
        >
          {children}
        </Stack>
      </Animated.View>
    )
  }

  return (
    <Stack padding={20} {...variantStyle} {...props}>
      {children}
    </Stack>
  )
}

// 작은 카드 (통계 표시용)
interface StatCardProps {
  icon?: React.ReactNode
  label: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  onPress?: () => void
}

export function StatCard({
  icon,
  label,
  value,
  subValue,
  trend,
  onPress,
}: StatCardProps) {
  const { colors } = useTheme()

  const trendColor =
    trend === 'up'
      ? colors.success
      : trend === 'down'
        ? colors.error
        : colors.textSecondary

  return (
    <Card
      variant="default"
      pressable={!!onPress}
      onPress={onPress}
      padding={16}
      flex={1}
    >
      <Stack gap={8}>
        {icon && (
          <Stack
            width={40}
            height={40}
            borderRadius={12}
            backgroundColor={colors.backgroundSecondary}
            alignItems="center"
            justifyContent="center"
          >
            {icon}
          </Stack>
        )}
        <Stack gap={4}>
          <Stack>
            <Animated.Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                fontWeight: '500',
              }}
            >
              {label}
            </Animated.Text>
          </Stack>
          <Stack flexDirection="row" alignItems="baseline" gap={4}>
            <Animated.Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text,
              }}
            >
              {value}
            </Animated.Text>
            {subValue && (
              <Animated.Text
                style={{
                  fontSize: 13,
                  color: trendColor,
                  fontWeight: '500',
                }}
              >
                {subValue}
              </Animated.Text>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  )
}

// 리스트 아이템 카드
interface ListItemCardProps {
  leftIcon?: React.ReactNode
  title: string
  subtitle?: string
  rightContent?: React.ReactNode
  onPress?: () => void
}

export function ListItemCard({
  leftIcon,
  title,
  subtitle,
  rightContent,
  onPress,
}: ListItemCardProps) {
  const { colors } = useTheme()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 })
    }
  }, [onPress])

  const handlePressOut = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 })
    }
  }, [onPress])

  return (
    <Animated.View style={animatedStyle}>
      <Stack
        flexDirection="row"
        alignItems="center"
        padding={16}
        backgroundColor={colors.card}
        borderRadius={16}
        gap={12}
        onPressIn={onPress ? handlePressIn : undefined}
        onPressOut={onPress ? handlePressOut : undefined}
        onPress={onPress}
      >
        {leftIcon && (
          <Stack
            width={44}
            height={44}
            borderRadius={12}
            backgroundColor={colors.backgroundSecondary}
            alignItems="center"
            justifyContent="center"
          >
            {leftIcon}
          </Stack>
        )}
        <Stack flex={1} gap={2}>
          <Animated.Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            {title}
          </Animated.Text>
          {subtitle && (
            <Animated.Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              {subtitle}
            </Animated.Text>
          )}
        </Stack>
        {rightContent}
      </Stack>
    </Animated.View>
  )
}
