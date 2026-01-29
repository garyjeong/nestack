import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Stack, Text } from 'tamagui'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import { useTheme } from '@/shared/hooks/useTheme'

interface ProgressBarProps {
  progress: number // 0-100
  height?: number
  showLabel?: boolean
  label?: string
  useGradient?: boolean
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function ProgressBar({
  progress,
  height = 8,
  showLabel,
  label,
  useGradient = true,
  variant = 'default',
}: ProgressBarProps) {
  const { colors, palette } = useTheme()
  const animatedProgress = useSharedValue(0)
  const clampedProgress = Math.max(0, Math.min(100, progress))

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    })
  }, [clampedProgress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }))

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return colors.success
      case 'warning':
        return colors.warning
      case 'error':
        return colors.error
      default:
        return colors.primary
    }
  }

  const getGradientColors = () => {
    switch (variant) {
      case 'success':
        return [colors.success, '#34D399']
      case 'warning':
        return [colors.warning, '#FBBF24']
      case 'error':
        return [colors.error, '#F87171']
      default:
        return palette.gradient
    }
  }

  return (
    <Stack gap={6}>
      {(showLabel || label) && (
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          {label && (
            <Text fontSize={13} color={colors.textSecondary} fontWeight="500">
              {label}
            </Text>
          )}
          {showLabel && (
            <Text fontSize={14} fontWeight="700" color={colors.text}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </Stack>
      )}
      <Stack
        height={height}
        backgroundColor={colors.border}
        borderRadius={height / 2}
        overflow="hidden"
      >
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: height / 2,
              overflow: 'hidden',
            },
            animatedStyle,
          ]}
        >
          {useGradient ? (
            <LinearGradient
              colors={[...getGradientColors()]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <Stack flex={1} backgroundColor={getVariantColor()} />
          )}
        </Animated.View>
      </Stack>
    </Stack>
  )
}

// 미션 카드용 컴팩트 프로그레스 바
interface CompactProgressBarProps {
  progress: number
  height?: number
}

export function CompactProgressBar({ progress, height = 6 }: CompactProgressBarProps) {
  const { colors, palette } = useTheme()
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <Stack
      height={height}
      backgroundColor={colors.border}
      borderRadius={height / 2}
      overflow="hidden"
    >
      <Stack
        height="100%"
        width={`${clampedProgress}%`}
        borderRadius={height / 2}
        overflow="hidden"
      >
        <LinearGradient
          colors={[...palette.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Stack>
    </Stack>
  )
}
