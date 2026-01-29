import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Color variant */
  variant?: 'primary' | 'white' | 'gray'
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
}

const variantClasses = {
  primary: 'border-primary-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-stone-400 border-t-transparent dark:border-stone-500',
}

export function LoadingSpinner({ size = 'md', variant = 'primary', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  )
}

// Dots loading animation (similar to Toss/Kakao)
interface DotsLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function DotsLoading({ size = 'md', className }: DotsLoadingProps) {
  const dotSize = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('rounded-full bg-primary-500', dotSize[size])}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Full page loading with animation
export function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-900">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <LoadingSpinner size="lg" />
        </motion.div>
        <motion.p
          className="mt-4 text-stone-500 dark:text-stone-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          로딩중...
        </motion.p>
      </motion.div>
    </div>
  )
}

// Inline loading for buttons or small areas
export function InlineLoading({ text = '로딩중...' }: { text?: string }) {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <LoadingSpinner size="sm" />
      <span className="text-sm text-stone-500 dark:text-stone-400">{text}</span>
    </motion.div>
  )
}

// Loading overlay for cards or sections
interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  /** Show blur effect */
  blur?: boolean
}

export function LoadingOverlay({ isLoading, children, blur = false }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 dark:bg-stone-900/80',
              blur && 'backdrop-blur-sm'
            )}
          >
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Skeleton-style shimmer loading bar
interface ShimmerBarProps {
  className?: string
}

export function ShimmerBar({ className }: ShimmerBarProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-stone-200 dark:bg-stone-700',
        className
      )}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
