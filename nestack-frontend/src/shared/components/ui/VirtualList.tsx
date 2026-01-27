import { useRef, type ReactNode } from 'react'
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'

interface VirtualListProps<T> {
  /** 렌더링할 아이템 배열 */
  items: T[]
  /** 각 아이템의 예상 높이 (px) */
  estimateSize: number | ((index: number) => number)
  /** 컨테이너 높이 */
  height?: string | number
  /** 아이템 렌더 함수 */
  renderItem: (item: T, virtualItem: VirtualItem) => ReactNode
  /** 오버스캔 (기본: 5) */
  overscan?: number
  /** 아이템 간 간격 (px) */
  gap?: number
  /** 컨테이너 클래스 */
  className?: string
  /** 빈 상태 렌더 */
  emptyContent?: ReactNode
  /** 로딩 상태 렌더 */
  loadingContent?: ReactNode
  /** 로딩 중 여부 */
  isLoading?: boolean
  /** 키 추출 함수 */
  getItemKey?: (item: T, index: number) => string | number
}

export function VirtualList<T>({
  items,
  estimateSize,
  height = '100%',
  renderItem,
  overscan = 5,
  gap = 0,
  className = '',
  emptyContent,
  loadingContent,
  isLoading = false,
  getItemKey,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof estimateSize === 'function' ? estimateSize : () => estimateSize,
    overscan,
    gap,
  })

  if (isLoading && loadingContent) {
    return <>{loadingContent}</>
  }

  if (items.length === 0 && emptyContent) {
    return <>{emptyContent}</>
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index]
          const key = getItemKey
            ? getItemKey(item, virtualItem.index)
            : virtualItem.key

          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
