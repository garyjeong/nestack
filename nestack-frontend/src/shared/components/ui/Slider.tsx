import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/utils/cn'

// ============================================
// Slider Component
// ============================================

interface SliderProps {
  /** Current value */
  value?: number
  /** Default value */
  defaultValue?: number
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Callback when value changes */
  onChange?: (value: number) => void
  /** Callback when interaction ends */
  onChangeEnd?: (value: number) => void
  /** Label */
  label?: string
  /** Show value tooltip */
  showValue?: boolean
  /** Format value for display */
  formatValue?: (value: number) => string
  /** Show min/max labels */
  showMinMax?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Color variant */
  variant?: 'primary' | 'accent' | 'success'
  /** Size */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Slider({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  label,
  showValue = true,
  formatValue = (v) => v.toString(),
  showMinMax,
  disabled,
  variant = 'primary',
  size = 'md',
  className,
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const value = controlledValue !== undefined ? controlledValue : internalValue

  // Calculate percentage
  const percentage = ((value - min) / (max - min)) * 100

  // Variant colors
  const variantClasses = {
    primary: 'bg-primary-500',
    accent: 'bg-accent-500',
    success: 'bg-emerald-500',
  }

  // Size classes
  const sizeClasses = {
    sm: { track: 'h-1', thumb: 'h-4 w-4' },
    md: { track: 'h-2', thumb: 'h-5 w-5' },
    lg: { track: 'h-3', thumb: 'h-6 w-6' },
  }

  // Get value from position
  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value

      const rect = trackRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percent * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      return Math.max(min, Math.min(max, steppedValue))
    },
    [min, max, step, value]
  )

  // Handle mouse/touch move
  const handleMove = useCallback(
    (clientX: number) => {
      if (disabled) return
      const newValue = getValueFromPosition(clientX)
      if (newValue !== value) {
        setInternalValue(newValue)
        onChange?.(newValue)
      }
    },
    [disabled, getValueFromPosition, onChange, value]
  )

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    handleMove(e.clientX)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onChangeEnd?.(value)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMove, onChangeEnd, value])

  // Handle touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    setIsDragging(true)
    handleMove(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return
    handleMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    onChangeEnd?.(value)
  }

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    let newValue = value
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(max, value + step)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(min, value - step)
        break
      case 'Home':
        newValue = min
        break
      case 'End':
        newValue = max
        break
      default:
        return
    }

    e.preventDefault()
    setInternalValue(newValue)
    onChange?.(newValue)
    onChangeEnd?.(newValue)
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Label and Value */}
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {formatValue(value)}
            </span>
          )}
        </div>
      )}

      {/* Slider Track */}
      <div
        ref={trackRef}
        className={cn(
          'relative w-full cursor-pointer rounded-full bg-stone-200 dark:bg-stone-700',
          sizeClasses[size].track,
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Filled Track */}
        <motion.div
          className={cn('absolute left-0 top-0 h-full rounded-full', variantClasses[variant])}
          style={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* Thumb */}
        <motion.div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          onKeyDown={handleKeyDown}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-md',
            'border-2 border-stone-200 dark:border-stone-600',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            'transition-transform',
            isDragging && 'scale-110',
            sizeClasses[size].thumb
          )}
          style={{ left: `${percentage}%` }}
          animate={{ left: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Min/Max Labels */}
      {showMinMax && (
        <div className="mt-1 flex justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// Range Slider Component
// ============================================

interface RangeSliderProps {
  /** Current range value */
  value?: [number, number]
  /** Default value */
  defaultValue?: [number, number]
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Minimum gap between handles */
  minGap?: number
  /** Callback when value changes */
  onChange?: (value: [number, number]) => void
  /** Callback when interaction ends */
  onChangeEnd?: (value: [number, number]) => void
  /** Label */
  label?: string
  /** Show values */
  showValue?: boolean
  /** Format value for display */
  formatValue?: (value: number) => string
  /** Disabled state */
  disabled?: boolean
  className?: string
}

export function RangeSlider({
  value: controlledValue,
  defaultValue = [25, 75],
  min = 0,
  max = 100,
  step = 1,
  minGap = 0,
  onChange,
  onChangeEnd,
  label,
  showValue = true,
  formatValue = (v) => v.toString(),
  disabled,
  className,
}: RangeSliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [activeHandle, setActiveHandle] = useState<'start' | 'end' | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const value = controlledValue || internalValue
  const [startValue, endValue] = value

  const startPercent = ((startValue - min) / (max - min)) * 100
  const endPercent = ((endValue - min) / (max - min)) * 100

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0
      const rect = trackRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percent * (max - min)
      return Math.round(rawValue / step) * step
    },
    [min, max, step]
  )

  const handleMove = useCallback(
    (clientX: number) => {
      if (disabled || !activeHandle) return

      const newValue = getValueFromPosition(clientX)
      let newRange: [number, number]

      if (activeHandle === 'start') {
        const maxStart = endValue - minGap
        newRange = [Math.max(min, Math.min(maxStart, newValue)), endValue]
      } else {
        const minEnd = startValue + minGap
        newRange = [startValue, Math.min(max, Math.max(minEnd, newValue))]
      }

      setInternalValue(newRange)
      onChange?.(newRange)
    },
    [disabled, activeHandle, getValueFromPosition, startValue, endValue, min, max, minGap, onChange]
  )

  useEffect(() => {
    if (!activeHandle) return

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const handleMouseUp = () => {
      setActiveHandle(null)
      onChangeEnd?.(value)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [activeHandle, handleMove, onChangeEnd, value])

  const handleMouseDown = (handle: 'start' | 'end') => (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setActiveHandle(handle)
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Label and Values */}
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {formatValue(startValue)} - {formatValue(endValue)}
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        className={cn(
          'relative h-2 w-full rounded-full bg-stone-200 dark:bg-stone-700',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {/* Filled Track */}
        <div
          className="absolute h-full rounded-full bg-primary-500"
          style={{
            left: `${startPercent}%`,
            width: `${endPercent - startPercent}%`,
          }}
        />

        {/* Start Handle */}
        <div
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 cursor-pointer',
            'rounded-full bg-white shadow-md border-2 border-stone-200 dark:border-stone-600',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            activeHandle === 'start' && 'scale-110'
          )}
          style={{ left: `${startPercent}%` }}
          onMouseDown={handleMouseDown('start')}
        />

        {/* End Handle */}
        <div
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 cursor-pointer',
            'rounded-full bg-white shadow-md border-2 border-stone-200 dark:border-stone-600',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            activeHandle === 'end' && 'scale-110'
          )}
          style={{ left: `${endPercent}%` }}
          onMouseDown={handleMouseDown('end')}
        />
      </div>

      {/* Min/Max Labels */}
      <div className="mt-1 flex justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}
