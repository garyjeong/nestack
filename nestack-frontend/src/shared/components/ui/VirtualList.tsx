import { useRef, useEffect, type ReactNode } from 'react'
import { useVirtualizer, type VirtualItem, type Virtualizer } from '@tanstack/react-virtual'
import { cn } from '@/shared/utils/cn'

// ============================================
// Basic Virtual List
// ============================================

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
  /** 스크롤 끝 도달 콜백 */
  onEndReached?: () => void
  /** 끝 도달 임계값 (px) */
  endReachedThreshold?: number
  /** Virtualizer 인스턴스 접근 ref */
  virtualizerRef?: React.MutableRefObject<Virtualizer<HTMLDivElement, Element> | null>
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
  onEndReached,
  endReachedThreshold = 200,
  virtualizerRef,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof estimateSize === 'function' ? estimateSize : () => estimateSize,
    overscan,
    gap,
  })

  // Expose virtualizer instance
  useEffect(() => {
    if (virtualizerRef) {
      virtualizerRef.current = rowVirtualizer
    }
  }, [rowVirtualizer, virtualizerRef])

  // Handle end reached
  useEffect(() => {
    if (!onEndReached || !parentRef.current) return

    const handleScroll = () => {
      const element = parentRef.current
      if (!element) return

      const { scrollTop, scrollHeight, clientHeight } = element
      if (scrollHeight - scrollTop - clientHeight < endReachedThreshold) {
        onEndReached()
      }
    }

    const element = parentRef.current
    element.addEventListener('scroll', handleScroll, { passive: true })
    return () => element.removeEventListener('scroll', handleScroll)
  }, [onEndReached, endReachedThreshold])

  if (isLoading && loadingContent) {
    return <>{loadingContent}</>
  }

  if (items.length === 0 && emptyContent) {
    return <>{emptyContent}</>
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
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

// ============================================
// Virtual Grid
// ============================================

interface VirtualGridProps<T> {
  /** 렌더링할 아이템 배열 */
  items: T[]
  /** 열 개수 */
  columns: number
  /** 행 높이 */
  rowHeight: number
  /** 컨테이너 높이 */
  height?: string | number
  /** 아이템 렌더 함수 */
  renderItem: (item: T, index: number) => ReactNode
  /** 오버스캔 (기본: 3) */
  overscan?: number
  /** 행/열 간격 (px) */
  gap?: number
  /** 컨테이너 클래스 */
  className?: string
  /** 빈 상태 렌더 */
  emptyContent?: ReactNode
  /** 키 추출 함수 */
  getItemKey?: (item: T, index: number) => string | number
}

export function VirtualGrid<T>({
  items,
  columns,
  rowHeight,
  height = '100%',
  renderItem,
  overscan = 3,
  gap = 0,
  className = '',
  emptyContent,
  getItemKey,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const rowCount = Math.ceil(items.length / columns)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + gap,
    overscan,
  })

  if (items.length === 0 && emptyContent) {
    return <>{emptyContent}</>
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns
          const rowItems = items.slice(startIndex, startIndex + columns)

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${rowHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
              }}
            >
              {rowItems.map((item, colIndex) => {
                const index = startIndex + colIndex
                const key = getItemKey ? getItemKey(item, index) : index

                return (
                  <div key={key}>
                    {renderItem(item, index)}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Dynamic Height Virtual List
// ============================================

interface DynamicVirtualListProps<T> {
  /** 렌더링할 아이템 배열 */
  items: T[]
  /** 기본 예상 높이 */
  estimateSize?: number
  /** 컨테이너 높이 */
  height?: string | number
  /** 아이템 렌더 함수 (measureRef 포함) */
  renderItem: (
    item: T,
    index: number,
    measureRef: (node: HTMLElement | null) => void
  ) => ReactNode
  /** 오버스캔 */
  overscan?: number
  /** 컨테이너 클래스 */
  className?: string
  /** 빈 상태 렌더 */
  emptyContent?: ReactNode
  /** 키 추출 함수 */
  getItemKey?: (item: T, index: number) => string | number
}

export function DynamicVirtualList<T>({
  items,
  estimateSize = 50,
  height = '100%',
  renderItem,
  overscan = 5,
  className = '',
  emptyContent,
  getItemKey,
}: DynamicVirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })

  if (items.length === 0 && emptyContent) {
    return <>{emptyContent}</>
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
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
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(
                item,
                virtualItem.index,
                rowVirtualizer.measureElement
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Horizontal Virtual List
// ============================================

interface HorizontalVirtualListProps<T> {
  /** 렌더링할 아이템 배열 */
  items: T[]
  /** 각 아이템의 예상 너비 (px) */
  estimateSize: number | ((index: number) => number)
  /** 컨테이너 너비 */
  width?: string | number
  /** 컨테이너 높이 */
  height?: string | number
  /** 아이템 렌더 함수 */
  renderItem: (item: T, virtualItem: VirtualItem) => ReactNode
  /** 오버스캔 */
  overscan?: number
  /** 아이템 간 간격 (px) */
  gap?: number
  /** 컨테이너 클래스 */
  className?: string
  /** 키 추출 함수 */
  getItemKey?: (item: T, index: number) => string | number
}

export function HorizontalVirtualList<T>({
  items,
  estimateSize,
  width = '100%',
  height = 'auto',
  renderItem,
  overscan = 5,
  gap = 0,
  className = '',
  getItemKey,
}: HorizontalVirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof estimateSize === 'function' ? estimateSize : () => estimateSize,
    overscan,
    gap,
  })

  return (
    <div
      ref={parentRef}
      className={cn('overflow-x-auto overflow-y-hidden', className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <div
        style={{
          width: `${columnVirtualizer.getTotalSize()}px`,
          height: '100%',
          position: 'relative',
        }}
      >
        {columnVirtualizer.getVirtualItems().map((virtualItem) => {
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
                height: '100%',
                width: `${virtualItem.size}px`,
                transform: `translateX(${virtualItem.start}px)`,
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

// ============================================
// Virtual Table
// ============================================

interface Column<T> {
  key: string
  header: ReactNode
  width?: number
  minWidth?: number
  render: (item: T, index: number) => ReactNode
}

interface VirtualTableProps<T> {
  /** 데이터 배열 */
  data: T[]
  /** 컬럼 정의 */
  columns: Column<T>[]
  /** 행 높이 */
  rowHeight?: number
  /** 컨테이너 높이 */
  height?: string | number
  /** 오버스캔 */
  overscan?: number
  /** 컨테이너 클래스 */
  className?: string
  /** 키 추출 함수 */
  getRowKey?: (item: T, index: number) => string | number
  /** 행 클릭 핸들러 */
  onRowClick?: (item: T, index: number) => void
  /** 선택된 행 인덱스 */
  selectedIndex?: number
}

export function VirtualTable<T>({
  data,
  columns,
  rowHeight = 48,
  height = 400,
  overscan = 10,
  className = '',
  getRowKey,
  onRowClick,
  selectedIndex,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  })

  return (
    <div className={cn('rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
        {columns.map((column) => (
          <div
            key={column.key}
            className="px-4 py-3 text-sm font-semibold text-stone-700 dark:text-stone-300"
            style={{
              width: column.width,
              minWidth: column.minWidth || 100,
              flex: column.width ? 'none' : 1,
            }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = data[virtualRow.index]
            const key = getRowKey ? getRowKey(item, virtualRow.index) : virtualRow.key
            const isSelected = selectedIndex === virtualRow.index

            return (
              <div
                key={key}
                className={cn(
                  'flex items-center border-b border-stone-100 dark:border-stone-800',
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50',
                  isSelected && 'bg-primary-50 dark:bg-primary-950'
                )}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${rowHeight}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(item, virtualRow.index)}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="px-4 py-2 text-sm text-stone-700 dark:text-stone-300 truncate"
                    style={{
                      width: column.width,
                      minWidth: column.minWidth || 100,
                      flex: column.width ? 'none' : 1,
                    }}
                  >
                    {column.render(item, virtualRow.index)}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
