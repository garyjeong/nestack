import React, { useEffect } from 'react'
import { Stack } from 'tamagui'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8 }: SkeletonProps) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: '#e7e5e4',
        },
        animatedStyle,
      ]}
    />
  )
}
