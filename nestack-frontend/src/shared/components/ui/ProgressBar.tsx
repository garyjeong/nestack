import { useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'gradient' | 'accent' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  label?: string
  animated?: boolean
  className?: string
}

const sizeClasses = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

const trackSizeClasses = {
  xs: 'rounded',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
}

const variantClasses = {
  primary: 'bg-primary-500',
  gradient: 'gradient-primary',
  accent: 'bg-accent-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label = '진행률',
  animated = true,
  className,
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value)
  const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayValue(value)
    }
  }, [value, animated])

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="text-stone-500">{label}</span>
          <span className="font-semibold text-stone-900 tabular-nums">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden bg-stone-100',
          sizeClasses[size],
          trackSizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-700 ease-out',
            trackSizeClasses[size],
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// 세그먼트 프로그레스 바
interface SegmentedProgressProps {
  segments: number
  completed: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'gradient' | 'success'
  className?: string
}

export function SegmentedProgress({
  segments,
  completed,
  size = 'md',
  variant = 'primary',
  className,
}: SegmentedProgressProps) {
  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 transition-colors duration-300',
            sizeClasses[size],
            trackSizeClasses[size],
            i < completed ? variantClasses[variant] : 'bg-stone-100'
          )}
        />
      ))}
    </div>
  )
}

// 스텝 프로그레스
interface StepProgressProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          {/* Step dot */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                i < currentStep
                  ? 'bg-primary-500 text-white'
                  : i === currentStep
                    ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500'
                    : 'bg-stone-100 text-stone-400'
              )}
            >
              {i < currentStep ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cn(
                'mt-1.5 text-xs font-medium whitespace-nowrap',
                i <= currentStep ? 'text-stone-900' : 'text-stone-400'
              )}
            >
              {step}
            </span>
          </div>

          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              className={cn(
                'mx-2 h-0.5 w-12 transition-colors duration-300',
                i < currentStep ? 'bg-primary-500' : 'bg-stone-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
