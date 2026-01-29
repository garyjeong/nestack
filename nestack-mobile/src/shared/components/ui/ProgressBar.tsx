import React from 'react'
import { Stack, Text } from 'tamagui'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

interface ProgressBarProps {
  progress: number // 0-100
  color?: string
  height?: number
  showLabel?: boolean
  label?: string
}

export function ProgressBar({
  progress,
  color = '#059669',
  height = 8,
  showLabel,
  label,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${clampedProgress}%`, { duration: 600 }),
  }))

  return (
    <Stack gap={4}>
      {(showLabel || label) && (
        <Stack flexDirection="row" justifyContent="space-between">
          {label && <Text fontSize={12} color="#78716c">{label}</Text>}
          {showLabel && <Text fontSize={12} fontWeight="600" color="#1c1917">{Math.round(clampedProgress)}%</Text>}
        </Stack>
      )}
      <Stack
        height={height}
        backgroundColor="#e7e5e4"
        borderRadius={height / 2}
        overflow="hidden"
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: color,
              borderRadius: height / 2,
            },
            animatedStyle,
          ]}
        />
      </Stack>
    </Stack>
  )
}
