import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useTheme } from '@/shared/hooks/useTheme'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface CircularProgressProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  useGradient?: boolean
  showPercentage?: boolean
  children?: React.ReactNode
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 10,
  useGradient = true,
  showPercentage = true,
  children,
}: CircularProgressProps) {
  const { colors, palette } = useTheme()
  const animatedProgress = useSharedValue(0)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    })
  }, [progress])

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (circumference * animatedProgress.value) / 100
    return {
      strokeDashoffset,
    }
  })

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {useGradient && (
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={palette.gradient[0]} />
              <Stop offset="100%" stopColor={palette.gradient[1]} />
            </LinearGradient>
          </Defs>
        )}

        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={useGradient ? 'url(#progressGradient)' : colors.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center Content */}
      <View style={[styles.centerContent, { width: size, height: size }]}>
        {children ? (
          children
        ) : showPercentage ? (
          <Animated.Text style={[styles.percentageText, { color: colors.text }]}>
            {Math.round(progress)}%
          </Animated.Text>
        ) : null}
      </View>
    </View>
  )
}

// 작은 원형 진행률 (리스트용)
interface MiniCircularProgressProps {
  progress: number
  size?: number
}

export function MiniCircularProgress({ progress, size = 40 }: MiniCircularProgressProps) {
  const { colors, palette } = useTheme()
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2
  const strokeDashoffset = circumference - (circumference * progress) / 100

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="miniGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={palette.gradient[0]} />
            <Stop offset="100%" stopColor={palette.gradient[1]} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#miniGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '700',
  },
})
