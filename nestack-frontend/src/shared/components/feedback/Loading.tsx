import { cn } from '@/shared/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-primary-500 border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  )
}

// Full page loading
export function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-stone-500">로딩중...</p>
      </div>
    </div>
  )
}

// Inline loading for buttons or small areas
export function InlineLoading({ text = '로딩중...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-stone-500">{text}</span>
    </div>
  )
}

// Loading overlay for cards or sections
interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
}

export function LoadingOverlay({ isLoading, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
}
