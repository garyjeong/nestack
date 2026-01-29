import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, ChevronUp } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Button } from './Button'

// ============================================
// Infinite Scroll Container
// ============================================

interface InfiniteScrollProps {
  children: ReactNode
  /** Whether more items are being loaded */
  isLoading?: boolean
  /** Whether there are more items to load */
  hasMore?: boolean
  /** Whether there was an error loading */
  isError?: boolean
  /** Error message to display */
  errorMessage?: string
  /** Callback when bottom is reached */
  onLoadMore: () => void
  /** Callback to retry on error */
  onRetry?: () => void
  /** Threshold in pixels before the bottom to trigger load */
  threshold?: number
  /** Root margin for intersection observer */
  rootMargin?: string
  /** Show end of list message */
  showEndMessage?: boolean
  /** End of list message */
  endMessage?: string
  /** Custom loader component */
  loader?: ReactNode
  /** Class name for container */
  className?: string
  /** Class name for loader wrapper */
  loaderClassName?: string
}

export function InfiniteScroll({
  children,
  isLoading = false,
  hasMore = true,
  isError = false,
  errorMessage = '데이터를 불러오는 중 오류가 발생했습니다.',
  onLoadMore,
  onRetry,
  threshold: _threshold = 100,
  rootMargin = '100px',
  showEndMessage = true,
  endMessage = '모든 항목을 불러왔습니다.',
  loader,
  className,
  loaderClassName,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for detecting scroll to bottom
  useEffect(() => {
    if (!hasMore || isLoading || isError) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore()
        }
      },
      { rootMargin }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading, isError, onLoadMore, rootMargin])

  return (
    <div className={className}>
      {children}

      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn('flex justify-center py-6', loaderClassName)}
          >
            {loader || <DefaultLoader />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {isError && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{errorMessage}</span>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                다시 시도
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* End of List */}
      <AnimatePresence>
        {!hasMore && !isLoading && !isError && showEndMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6 text-center text-sm text-stone-400 dark:text-stone-500"
          >
            {endMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Default loader component
function DefaultLoader() {
  return (
    <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">불러오는 중...</span>
    </div>
  )
}

// ============================================
// Scroll To Top Button
// ============================================

interface ScrollToTopProps {
  /** Threshold in pixels to show the button */
  threshold?: number
  /** Smooth scroll behavior */
  smooth?: boolean
  /** Button position */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  className?: string
}

export function ScrollToTop({
  threshold = 400,
  smooth = true,
  position = 'bottom-right',
  className,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }

  const positionClasses = {
    'bottom-right': 'right-4',
    'bottom-left': 'left-4',
    'bottom-center': 'left-1/2 -translate-x-1/2',
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-24 z-30 flex h-12 w-12 items-center justify-center',
            'rounded-full bg-white dark:bg-stone-800 shadow-lg dark:shadow-stone-900/50',
            'text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            positionClasses[position],
            className
          )}
          aria-label="맨 위로 스크롤"
        >
          <ChevronUp className="h-6 w-6" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// Need to import useState for ScrollToTop
import { useState } from 'react'

// ============================================
// Pull to Refresh (Enhanced)
// ============================================

interface PullToRefreshProps {
  children: ReactNode
  /** Callback when refresh is triggered */
  onRefresh: () => Promise<void>
  /** Whether refresh is in progress */
  isRefreshing?: boolean
  /** Pull distance required to trigger refresh */
  pullThreshold?: number
  /** Maximum pull distance */
  maxPull?: number
  /** Disabled state */
  disabled?: boolean
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  isRefreshing = false,
  pullThreshold = 80,
  maxPull = 120,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return
    if (window.scrollY > 0) return // Only trigger at top

    startY.current = e.touches[0].clientY
    setIsPulling(true)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff > 0) {
      // Apply resistance
      const resistance = 0.5
      const distance = Math.min(diff * resistance, maxPull)
      setPullDistance(distance)
    }
  }, [isPulling, disabled, isRefreshing, maxPull])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return

    setIsPulling(false)

    if (pullDistance >= pullThreshold && !isRefreshing) {
      await onRefresh()
    }

    setPullDistance(0)
  }, [isPulling, pullDistance, pullThreshold, isRefreshing, onRefresh])

  const progress = Math.min(pullDistance / pullThreshold, 1)
  const shouldShowIndicator = pullDistance > 10 || isRefreshing

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <AnimatePresence>
        {shouldShowIndicator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 top-0 -translate-x-1/2 z-10"
            style={{ transform: `translateX(-50%) translateY(${pullDistance - 40}px)` }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-stone-800 shadow-lg">
              {isRefreshing ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
              ) : (
                <motion.div
                  animate={{ rotate: progress * 180 }}
                  className="text-stone-400"
                >
                  <ChevronUp className="h-5 w-5" style={{ transform: 'rotate(180deg)' }} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{ y: isPulling || isRefreshing ? pullDistance : 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ============================================
// Load More Button (Alternative to infinite scroll)
// ============================================

interface LoadMoreButtonProps {
  /** Whether more items are being loaded */
  isLoading?: boolean
  /** Whether there are more items to load */
  hasMore?: boolean
  /** Callback when button is clicked */
  onLoadMore: () => void
  /** Button text */
  text?: string
  /** Loading text */
  loadingText?: string
  className?: string
}

export function LoadMoreButton({
  isLoading = false,
  hasMore = true,
  onLoadMore,
  text = '더 보기',
  loadingText = '불러오는 중...',
  className,
}: LoadMoreButtonProps) {
  if (!hasMore) return null

  return (
    <div className={cn('flex justify-center py-4', className)}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        isLoading={isLoading}
      >
        {isLoading ? loadingText : text}
      </Button>
    </div>
  )
}
