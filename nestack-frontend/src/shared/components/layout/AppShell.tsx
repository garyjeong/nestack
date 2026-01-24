import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import { cn } from '@/shared/utils/cn'
import { useSSE } from '@/features/realtime/hooks'

// SSE Connection Manager - renders nothing, just manages connection
function SSEManager() {
  useSSE({ enabled: true })
  return null
}

interface AppShellProps {
  children: ReactNode
  showBottomNav?: boolean
  showSideNav?: boolean
  className?: string
}

export function AppShell({
  children,
  showBottomNav = true,
  showSideNav = true,
  className,
}: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-stone-50', className)}>
      {/* SSE Connection Manager */}
      <SSEManager />

      {/* SideNav - Desktop only */}
      {showSideNav && <SideNav />}

      {/* Main content area */}
      <div className={cn(showSideNav && 'lg:pl-64')}>
        <main className={cn(showBottomNav && 'pb-20 lg:pb-0')}>{children}</main>
      </div>

      {/* BottomNav - Mobile/Tablet only */}
      {showBottomNav && <BottomNav />}
    </div>
  )
}

// Container for max-width content - Responsive
interface ContainerProps {
  children: ReactNode
  className?: string
  /** Use narrow width (for mobile-like pages) */
  narrow?: boolean
}

export function Container({ children, className, narrow = false }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6',
        narrow
          ? 'max-w-lg' // 512px - for narrow content
          : 'max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl', // Responsive widths
        className
      )}
    >
      {children}
    </div>
  )
}

// Page wrapper with padding - Responsive
interface PageProps {
  children: ReactNode
  className?: string
  /** Use narrow width (for mobile-like pages) */
  narrow?: boolean
}

export function Page({ children, className, narrow = false }: PageProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 py-6 sm:px-6 lg:px-8',
        narrow
          ? 'max-w-lg' // 512px - for narrow content
          : 'max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl', // Responsive widths
        className
      )}
    >
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
