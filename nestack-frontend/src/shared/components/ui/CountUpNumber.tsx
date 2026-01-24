import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/utils/cn'

interface CountUpNumberProps {
  value: number
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  className?: string
  formatOptions?: Intl.NumberFormatOptions
  locale?: string
}

export function CountUpNumber({
  value,
  duration = 800,
  delay = 0,
  prefix = '',
  suffix = '',
  className,
  formatOptions,
  locale = 'ko-KR',
}: CountUpNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousValue = useRef(0)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const startTime = performance.now() + delay

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    }

    const animate = (currentTime: number) => {
      if (currentTime < startTime) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)

      const currentValue = startValue + (endValue - startValue) * easedProgress
      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        setIsAnimating(true)
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        setDisplayValue(endValue)
        previousValue.current = endValue
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration, delay])

  const formattedValue = new Intl.NumberFormat(locale, formatOptions).format(displayValue)

  return (
    <span
      className={cn(
        'tabular-nums transition-opacity',
        isAnimating && 'opacity-90',
        className
      )}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}

// 금액 표시용 헬퍼 컴포넌트
interface CurrencyDisplayProps extends Omit<CountUpNumberProps, 'formatOptions' | 'suffix'> {
  currency?: string
}

export function CurrencyDisplay({
  value,
  currency = '원',
  locale = 'ko-KR',
  ...props
}: CurrencyDisplayProps) {
  return (
    <CountUpNumber
      value={value}
      locale={locale}
      suffix={currency}
      formatOptions={{
        maximumFractionDigits: 0,
      }}
      {...props}
    />
  )
}

// 퍼센트 표시용 헬퍼 컴포넌트
interface PercentDisplayProps extends Omit<CountUpNumberProps, 'formatOptions' | 'suffix'> {
  decimals?: number
}

export function PercentDisplay({
  value,
  decimals = 0,
  ...props
}: PercentDisplayProps) {
  return (
    <CountUpNumber
      value={value}
      suffix="%"
      formatOptions={{
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }}
      {...props}
    />
  )
}
