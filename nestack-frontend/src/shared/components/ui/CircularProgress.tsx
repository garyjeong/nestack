import { useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'

interface CircularProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  showValue?: boolean
  label?: string
  className?: string
  trackColor?: string
  progressColor?: string
  animated?: boolean
  children?: React.ReactNode
}

const sizeMap = {
  sm: 48,
  md: 64,
  lg: 80,
  xl: 120,
}

const strokeWidthMap = {
  sm: 4,
  md: 5,
  lg: 6,
  xl: 8,
}

export function CircularProgress({
  value,
  max = 100,
  size = 'md',
  strokeWidth,
  showValue = true,
  label,
  className,
  trackColor = 'stroke-stone-100',
  progressColor = 'stroke-primary-500',
  animated = true,
  children,
}: CircularProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  const diameter = sizeMap[size]
  const actualStrokeWidth = strokeWidth ?? strokeWidthMap[size]
  const radius = (diameter - actualStrokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min((animatedValue / max) * 100, 100)
  const offset = circumference - (percentage / 100) * circumference

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(value)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedValue(value)
    }
  }, [value, animated])

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStrokeWidth}
          className={trackColor}
        />
        {/* Progress */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStrokeWidth}
          strokeLinecap="round"
          className={cn(progressColor, animated && 'transition-all duration-700 ease-out')}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ? (
          children
        ) : showValue ? (
          <>
            <span
              className={cn(
                'font-bold text-stone-900',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
                size === 'xl' && 'text-2xl'
              )}
            >
              {Math.round(percentage)}%
            </span>
            {label && size !== 'sm' && (
              <span
                className={cn(
                  'text-stone-500 mt-0.5',
                  size === 'md' && 'text-[10px]',
                  size === 'lg' && 'text-xs',
                  size === 'xl' && 'text-sm'
                )}
              >
                {label}
              </span>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

// 그래디언트 버전
interface GradientCircularProgressProps extends Omit<CircularProgressProps, 'progressColor'> {
  gradientId?: string
}

export function GradientCircularProgress({
  gradientId = 'progressGradient',
  ...props
}: GradientCircularProgressProps) {
  const diameter = sizeMap[props.size ?? 'md']
  const actualStrokeWidth = props.strokeWidth ?? strokeWidthMap[props.size ?? 'md']
  const radius = (diameter - actualStrokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className={cn('relative inline-flex items-center justify-center', props.className)}>
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStrokeWidth}
          className={props.trackColor ?? 'stroke-stone-100'}
        />
        {/* Progress with gradient */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={actualStrokeWidth}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          className="transition-all duration-700 ease-out"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference - ((props.value / (props.max ?? 100)) * circumference),
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {props.children ? (
          props.children
        ) : props.showValue !== false ? (
          <>
            <span
              className={cn(
                'font-bold text-stone-900',
                props.size === 'sm' && 'text-xs',
                props.size === 'md' && 'text-sm',
                props.size === 'lg' && 'text-base',
                props.size === 'xl' && 'text-2xl'
              )}
            >
              {Math.round((props.value / (props.max ?? 100)) * 100)}%
            </span>
            {props.label && props.size !== 'sm' && (
              <span
                className={cn(
                  'text-stone-500 mt-0.5',
                  props.size === 'md' && 'text-[10px]',
                  props.size === 'lg' && 'text-xs',
                  props.size === 'xl' && 'text-sm'
                )}
              >
                {props.label}
              </span>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
