import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Card } from './Card'
import { CurrencyDisplay, PercentDisplay } from './CountUpNumber'

interface StatCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  trend?: {
    value: number
    label?: string
    isPositiveGood?: boolean
  }
  icon?: React.ReactNode
  variant?: 'default' | 'gradient' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export function StatCard({
  label,
  value,
  prefix,
  suffix,
  trend,
  icon,
  variant = 'default',
  size = 'md',
  className,
  onClick,
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0
  const isGood = trend?.isPositiveGood !== false ? isPositive : !isPositive

  return (
    <Card
      variant={variant}
      interactive={!!onClick}
      onClick={onClick}
      className={cn(
        'overflow-hidden',
        size === 'sm' && 'p-4',
        size === 'md' && 'p-5',
        size === 'lg' && 'p-6',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'font-medium',
              variant === 'gradient' ? 'text-white/80' : 'text-stone-500',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {label}
          </p>
          <div
            className={cn(
              'mt-1 font-bold tabular-nums',
              variant === 'gradient' ? 'text-white' : 'text-stone-900',
              size === 'sm' && 'text-xl',
              size === 'md' && 'text-2xl',
              size === 'lg' && 'text-3xl'
            )}
          >
            {prefix && <span>{prefix}</span>}
            <CurrencyDisplay
              value={value}
              currency={suffix ?? ''}
              duration={600}
            />
          </div>
        </div>
        {icon && (
          <div
            className={cn(
              'flex-shrink-0 rounded-xl p-2.5',
              variant === 'gradient'
                ? 'bg-white/20'
                : 'bg-primary-50'
            )}
          >
            <span className={variant === 'gradient' ? 'text-white' : 'text-primary-500'}>
              {icon}
            </span>
          </div>
        )}
      </div>

      {trend && (
        <div
          className={cn(
            'mt-3 flex items-center gap-1',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          <span
            className={cn(
              'flex items-center gap-0.5 font-medium',
              variant === 'gradient'
                ? 'text-white/90'
                : isGood
                  ? 'text-green-600'
                  : 'text-red-500'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <PercentDisplay value={Math.abs(trend.value)} duration={400} />
          </span>
          {trend.label && (
            <span
              className={cn(
                variant === 'gradient' ? 'text-white/70' : 'text-stone-500'
              )}
            >
              {trend.label}
            </span>
          )}
        </div>
      )}
    </Card>
  )
}

// 간단한 숫자 스탯 카드
interface SimpleStatProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  className?: string
}

export function SimpleStat({ label, value, icon, className }: SimpleStatProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100">
          <span className="text-stone-600">{icon}</span>
        </div>
      )}
      <div>
        <p className="text-sm text-stone-500">{label}</p>
        <p className="text-lg font-bold text-stone-900">{value}</p>
      </div>
    </div>
  )
}

// 미니 스탯 (가로형)
interface MiniStatProps {
  label: string
  value: string | number
  suffix?: string
  color?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function MiniStat({ label, value, suffix, color = 'default', className }: MiniStatProps) {
  const colorClasses = {
    default: 'text-stone-900',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-500',
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-sm text-stone-500">{label}</span>
      <span className={cn('text-sm font-semibold tabular-nums', colorClasses[color])}>
        {value}
        {suffix}
      </span>
    </div>
  )
}
