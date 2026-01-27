import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { cn } from '@/shared/utils/cn'
import { useSSE } from '@/features/realtime/hooks'

// SSE Connection Manager - renders nothing, just manages connection
function SSEManager() {
  useSSE({ enabled: true })
  return null
}

/** 앱 최대 너비 (모바일 앱 스타일) */
const APP_MAX_WIDTH = 'max-w-[480px]'

interface AppShellProps {
  children: ReactNode
  showBottomNav?: boolean
  className?: string
}

export function AppShell({
  children,
  showBottomNav = true,
  className,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-100">
      {/* SSE Connection Manager */}
      <SSEManager />

      {/* App Container - 모바일 앱 스타일 중앙 정렬 */}
      <div className={cn(
        'relative mx-auto min-h-screen bg-stone-50 shadow-xl pt-safe',
        APP_MAX_WIDTH,
        className
      )}>
        {/* Main content area */}
        <main className={cn(showBottomNav && 'pb-20')}>
          {children}
        </main>

        {/* BottomNav - 앱 컨테이너 내부에 고정 */}
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  )
}

// Container for content with padding
interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('px-4', className)}>
      {children}
    </div>
  )
}

// Page wrapper with padding
interface PageProps {
  children: ReactNode
  className?: string
}

export function Page({ children, className }: PageProps) {
  return (
    <div className={cn('px-4 py-6', className)}>
      {children}
    </div>
  )
}

// Full-width section within a page (for backgrounds that span full width)
interface SectionProps {
  children: ReactNode
  className?: string
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn('w-full', className)}>
      <Container>{children}</Container>
    </section>
  )
}

// Grid layout helper for responsive card grids
interface GridProps {
  children: ReactNode
  className?: string
  /** Number of columns on different breakpoints */
  cols?: {
    default?: 1 | 2 | 3 | 4
    sm?: 1 | 2 | 3 | 4
    md?: 1 | 2 | 3 | 4
    lg?: 1 | 2 | 3 | 4
  }
}

export function Grid({ children, className, cols = {} }: GridProps) {
  const {
    default: defaultCols = 1,
    sm = defaultCols,
    md = 2,
    lg = 3,
  } = cols

  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-6',
        colsClass[defaultCols],
        `sm:${colsClass[sm]}`,
        `md:${colsClass[md]}`,
        `lg:${colsClass[lg]}`,
        className
      )}
    >
      {children}
    </div>
  )
}
