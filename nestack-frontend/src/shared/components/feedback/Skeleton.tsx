import { cn } from '@/shared/utils/cn'

interface SkeletonProps {
  className?: string
  /** Shape of the skeleton */
  variant?: 'default' | 'circular' | 'rounded' | 'text'
  /** Animation type */
  animation?: 'pulse' | 'shimmer' | 'none'
  /** Width (can be number for px or string for Tailwind classes) */
  width?: number | string
  /** Height (can be number for px or string for Tailwind classes) */
  height?: number | string
}

export function Skeleton({
  className,
  variant = 'default',
  animation = 'shimmer',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-lg',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
    text: 'rounded',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'skeleton',
    none: '',
  }

  const style: React.CSSProperties = {}
  if (typeof width === 'number') style.width = width
  if (typeof height === 'number') style.height = height

  return (
    <div
      className={cn(
        'bg-stone-200 dark:bg-stone-700',
        variantClasses[variant],
        animationClasses[animation],
        typeof width === 'string' && width,
        typeof height === 'string' && height,
        className
      )}
      style={Object.keys(style).length > 0 ? style : undefined}
    />
  )
}

// Pre-built skeleton variants
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  )
}

export function SkeletonButton({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-9 w-20',
    md: 'h-11 w-24',
    lg: 'h-14 w-32',
  }

  return (
    <Skeleton
      variant="rounded"
      className={cn(sizeClasses[size], className)}
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-white dark:bg-stone-800 p-4 shadow-sm dark:shadow-stone-900/50', className)}>
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonMissionCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-white dark:bg-stone-800 p-5 shadow-sm dark:shadow-stone-900/50', className)}>
      <div className="flex gap-4">
        {/* Circular progress placeholder */}
        <Skeleton variant="circular" className="h-16 w-16 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Title and percentage */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-10" />
          </div>

          {/* Category and days */}
          <Skeleton className="h-4 w-1/2 mb-3" />

          {/* Progress bar */}
          <Skeleton className="h-2 w-full rounded-full" />

          {/* Amount labels */}
          <div className="flex justify-between mt-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonAccountCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-white dark:bg-stone-800 p-4 shadow-sm dark:shadow-stone-900/50', className)}>
      <div className="flex items-center gap-3">
        {/* Bank icon */}
        <Skeleton variant="rounded" className="h-12 w-12" />

        {/* Account info */}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Balance */}
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  )
}

export function SkeletonTransactionItem({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 p-4', className)}>
      {/* Icon */}
      <Skeleton variant="rounded" className="h-10 w-10" />

      {/* Description */}
      <div className="flex-1 min-w-0 space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Amount */}
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-4', className)}>
      <SkeletonAvatar size="md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// Full page skeletons
export function SkeletonPage({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6 p-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-10 w-10" />
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Hero card */}
      <Skeleton variant="rounded" className="h-40 w-full" />

      {/* Section header */}
      <Skeleton className="h-5 w-24" />

      {/* List items */}
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export function SkeletonSummaryCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-6', className)}>
      <div className="space-y-4">
        {/* Label */}
        <Skeleton animation="pulse" className="h-4 w-16 bg-white/20" />

        {/* Value */}
        <Skeleton animation="pulse" className="h-10 w-40 bg-white/20" />

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white/15 p-3">
              <Skeleton animation="pulse" className="h-3 w-12 mx-auto mb-2 bg-white/20" />
              <Skeleton animation="pulse" className="h-5 w-10 mx-auto bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonBadgeGrid({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl bg-white dark:bg-stone-800 p-4 text-center shadow-sm">
          <Skeleton variant="circular" className="h-16 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-16 mx-auto mb-1" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
      ))}
    </div>
  )
}
