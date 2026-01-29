import { Component, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'

// ============================================
// Error Fallback UI Component
// ============================================

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  /** Show detailed error info (dev mode) */
  showDetails?: boolean
  /** Custom title */
  title?: string
  /** Custom description */
  description?: string
  /** Variant style */
  variant?: 'page' | 'inline' | 'card'
  className?: string
}

export function ErrorFallback({
  error,
  resetError,
  showDetails = import.meta.env.DEV,
  title = '문제가 발생했습니다',
  description = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  variant = 'page',
  className,
}: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400',
          className
        )}
        role="alert"
      >
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetError}
          className="flex-shrink-0 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          다시 시도
        </Button>
      </motion.div>
    )
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'rounded-2xl bg-white dark:bg-stone-800 p-6 shadow-sm dark:shadow-stone-900/50 text-center',
          className
        )}
        role="alert"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
        <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">{description}</p>
        <Button onClick={resetError} size="sm" fullWidth>
          다시 시도
        </Button>
      </motion.div>
    )
  }

  // Page variant (full page error)
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center bg-stone-50 dark:bg-stone-900 p-6',
        className
      )}
      role="alert"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
        >
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </motion.div>

        {/* Error Message */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-2 text-2xl font-bold text-stone-900 dark:text-stone-100"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 text-stone-500 dark:text-stone-400"
        >
          {description}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3"
        >
          <Button onClick={resetError} leftIcon={<RefreshCw className="h-4 w-4" />} fullWidth>
            다시 시도
          </Button>
          <Button
            variant="outline"
            onClick={handleGoHome}
            leftIcon={<Home className="h-4 w-4" />}
            fullWidth
          >
            홈으로 이동
          </Button>
          <Button
            variant="ghost"
            onClick={handleRefresh}
            className="text-stone-500 dark:text-stone-400"
            fullWidth
          >
            페이지 새로고침
          </Button>
        </motion.div>

        {/* Error Details (Dev Mode) */}
        {showDetails && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-left"
          >
            <summary className="flex cursor-pointer items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300">
              <Bug className="h-4 w-4" />
              <span>개발자 정보 보기</span>
            </summary>
            <div className="mt-3 rounded-lg bg-stone-100 dark:bg-stone-800 p-4">
              <p className="mb-2 text-sm font-medium text-red-600 dark:text-red-400">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="max-h-40 overflow-auto text-xs text-stone-600 dark:text-stone-400 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </motion.details>
        )}
      </motion.div>
    </div>
  )
}

// ============================================
// Error Boundary Class Component
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback component */
  fallback?: ReactNode
  /** Fallback variant */
  fallbackVariant?: 'page' | 'inline' | 'card'
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  /** Called when error is reset */
  onReset?: () => void
  /** Reset keys - when these change, error state is reset */
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasKeysChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      )
      if (hasKeysChanged) {
        this.resetError()
      }
    }
  }

  resetError = () => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback, fallbackVariant = 'page' } = this.props

    if (hasError && error) {
      if (fallback) {
        return fallback
      }
      return (
        <ErrorFallback
          error={error}
          resetError={this.resetError}
          variant={fallbackVariant}
        />
      )
    }

    return children
  }
}

// ============================================
// Query Error Fallback (for React Query)
// ============================================

interface QueryErrorFallbackProps {
  error: Error
  refetch: () => void
  variant?: 'inline' | 'card'
  className?: string
}

export function QueryErrorFallback({
  error,
  refetch,
  variant = 'card',
  className,
}: QueryErrorFallbackProps) {
  return (
    <ErrorFallback
      error={error}
      resetError={refetch}
      variant={variant}
      title="데이터를 불러올 수 없습니다"
      description="네트워크 상태를 확인하고 다시 시도해주세요."
      className={className}
    />
  )
}

// ============================================
// Not Found Component
// ============================================

interface NotFoundProps {
  title?: string
  description?: string
  showHomeButton?: boolean
  className?: string
}

export function NotFound({
  title = '페이지를 찾을 수 없습니다',
  description = '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
  showHomeButton = true,
  className,
}: NotFoundProps) {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center bg-stone-50 dark:bg-stone-900 p-6',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* 404 Text */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="mb-6"
        >
          <span className="text-8xl font-bold text-stone-200 dark:text-stone-700">404</span>
        </motion.div>

        <h1 className="mb-2 text-2xl font-bold text-stone-900 dark:text-stone-100">{title}</h1>
        <p className="mb-8 text-stone-500 dark:text-stone-400">{description}</p>

        <div className="flex flex-col gap-3">
          <Button onClick={handleGoBack} variant="outline" fullWidth>
            이전 페이지로
          </Button>
          {showHomeButton && (
            <Button onClick={handleGoHome} leftIcon={<Home className="h-4 w-4" />} fullWidth>
              홈으로 이동
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
