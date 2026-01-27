import { useState, useRef, useCallback, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  className?: string
  /** 새로고침 트리거 거리 (기본: 80px) */
  threshold?: number
  /** 최대 당김 거리 (기본: 120px) */
  maxPull?: number
  /** 비활성화 */
  disabled?: boolean
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
  threshold = 80,
  maxPull = 120,
  disabled = false,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  const isPulling = useRef(false)

  const y = useMotionValue(0)
  const progress = useTransform(y, [0, threshold], [0, 1])
  const rotation = useTransform(y, [0, threshold], [0, 180])
  const opacity = useTransform(y, [0, threshold * 0.5, threshold], [0, 0.5, 1])
  const scale = useTransform(y, [0, threshold], [0.8, 1])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return

    const container = containerRef.current
    if (!container) return

    // 스크롤이 맨 위에 있을 때만 pull-to-refresh 활성화
    if (container.scrollTop > 0) return

    startY.current = e.touches[0].clientY
    isPulling.current = true
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || disabled || isRefreshing) return

    const container = containerRef.current
    if (!container || container.scrollTop > 0) {
      isPulling.current = false
      return
    }

    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current

    if (diff > 0) {
      // 저항감 있는 당김 효과 (rubber band effect)
      const resistance = 0.5
      const pullDistance = Math.min(diff * resistance, maxPull)
      y.set(pullDistance)

      // 스크롤 방지
      if (pullDistance > 10) {
        e.preventDefault()
      }
    }
  }, [disabled, isRefreshing, maxPull, y])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return
    isPulling.current = false

    const pullDistance = y.get()

    if (pullDistance >= threshold && !isRefreshing) {
      // 새로고침 트리거
      setIsRefreshing(true)

      // 새로고침 위치로 애니메이션
      await animate(y, threshold * 0.6, { duration: 0.2 })

      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        animate(y, 0, { duration: 0.3, ease: [0.32, 0.72, 0, 1] })
      }
    } else {
      // 원래 위치로 복귀
      animate(y, 0, { duration: 0.3, ease: [0.32, 0.72, 0, 1] })
    }
  }, [y, threshold, isRefreshing, onRefresh])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* 새로고침 인디케이터 */}
      <motion.div
        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-10"
        style={{
          top: 0,
          height: threshold,
          y: useTransform(y, (v) => v - threshold),
        }}
      >
        <motion.div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md',
            isRefreshing && 'animate-spin'
          )}
          style={{
            opacity,
            scale,
            rotate: isRefreshing ? undefined : rotation,
          }}
        >
          <RefreshCw className="h-5 w-5 text-primary-500" />
        </motion.div>
      </motion.div>

      {/* 당김 상태 텍스트 */}
      <motion.div
        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-10 text-sm text-stone-500"
        style={{
          top: threshold - 20,
          opacity: useTransform(y, [threshold * 0.7, threshold], [0, 1]),
          y: useTransform(y, (v) => v - threshold),
        }}
      >
        {isRefreshing ? '새로고침 중...' : '놓으면 새로고침'}
      </motion.div>

      {/* 콘텐츠 영역 */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-auto"
        style={{ y }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </motion.div>
    </div>
  )
}
