import { type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { useBreakpoint } from '@/shared/hooks/useMediaQuery'

// ============================================
// Responsive Container - Adapts max-width to screen size
// ============================================

interface ResponsiveContainerProps {
  children: ReactNode
  /** Max width on different breakpoints */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'mobile'
  /** Center the container */
  centered?: boolean
  /** Add padding */
  padding?: boolean
  className?: string
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
  mobile: 'max-w-[480px]', // Mobile app style
}

export function ResponsiveContainer({
  children,
  maxWidth = 'mobile',
  centered = true,
  padding = true,
  className,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        centered && 'mx-auto',
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================
// Responsive Grid - Adapts columns to screen size
// ============================================

interface ResponsiveGridProps {
  children: ReactNode
  /** Minimum item width for auto-fit */
  minItemWidth?: number
  /** Gap between items */
  gap?: 'sm' | 'md' | 'lg'
  /** Fixed columns on different breakpoints */
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  className?: string
}

export function ResponsiveGrid({
  children,
  minItemWidth = 280,
  gap = 'md',
  cols,
  className,
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  }

  // If cols is specified, use fixed grid
  if (cols) {
    const colClasses = []
    if (cols.default) colClasses.push(`grid-cols-${cols.default}`)
    if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`)
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`)
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`)
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`)

    return (
      <div className={cn('grid', gapClasses[gap], colClasses.join(' '), className)}>
        {children}
      </div>
    )
  }

  // Auto-fit grid
  return (
    <div
      className={cn('grid', gapClasses[gap], className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`,
      }}
    >
      {children}
    </div>
  )
}

// ============================================
// Show/Hide based on breakpoint
// ============================================

interface ShowOnProps {
  children: ReactNode
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'sm' | 'md' | 'lg' | 'xl'
  /** Show above or below the breakpoint */
  mode?: 'above' | 'below' | 'only'
}

export function ShowOn({ children, breakpoint, mode = 'above' }: ShowOnProps) {
  const { isMobile, isTablet, isDesktop, isSm, isMd, isLg, isXl } = useBreakpoint()

  const shouldShow = (() => {
    switch (breakpoint) {
      case 'mobile':
        return mode === 'only' ? isMobile : mode === 'above' ? true : isMobile
      case 'tablet':
        return mode === 'only' ? isTablet : mode === 'above' ? isSm : !isLg
      case 'desktop':
        return mode === 'only' ? isDesktop : mode === 'above' ? isLg : true
      case 'sm':
        return mode === 'above' ? isSm : !isSm
      case 'md':
        return mode === 'above' ? isMd : !isMd
      case 'lg':
        return mode === 'above' ? isLg : !isLg
      case 'xl':
        return mode === 'above' ? isXl : !isXl
      default:
        return true
    }
  })()

  if (!shouldShow) return null
  return <>{children}</>
}

/** Show only on mobile */
export function MobileOnly({ children }: { children: ReactNode }) {
  return <ShowOn breakpoint="mobile" mode="only">{children}</ShowOn>
}

/** Show only on tablet */
export function TabletOnly({ children }: { children: ReactNode }) {
  return <ShowOn breakpoint="tablet" mode="only">{children}</ShowOn>
}

/** Show only on desktop */
export function DesktopOnly({ children }: { children: ReactNode }) {
  return <ShowOn breakpoint="desktop" mode="only">{children}</ShowOn>
}

/** Hide on mobile */
export function HideOnMobile({ children }: { children: ReactNode }) {
  return <ShowOn breakpoint="sm" mode="above">{children}</ShowOn>
}

/** Hide on desktop */
export function HideOnDesktop({ children }: { children: ReactNode }) {
  return <ShowOn breakpoint="lg" mode="below">{children}</ShowOn>
}

// ============================================
// Responsive Stack - Switches between row/column
// ============================================

interface ResponsiveStackProps {
  children: ReactNode
  /** Breakpoint at which to switch from column to row */
  breakpoint?: 'sm' | 'md' | 'lg'
  /** Gap between items */
  gap?: 'sm' | 'md' | 'lg'
  /** Alignment */
  align?: 'start' | 'center' | 'end' | 'stretch'
  /** Justify */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  /** Reverse on mobile */
  reverseOnMobile?: boolean
  className?: string
}

export function ResponsiveStack({
  children,
  breakpoint = 'md',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  reverseOnMobile,
  className,
}: ResponsiveStackProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  }

  const breakpointClasses = {
    sm: 'sm:flex-row',
    md: 'md:flex-row',
    lg: 'lg:flex-row',
  }

  return (
    <div
      className={cn(
        'flex flex-col',
        breakpointClasses[breakpoint],
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        reverseOnMobile && 'flex-col-reverse',
        reverseOnMobile && breakpoint === 'sm' && 'sm:flex-row',
        reverseOnMobile && breakpoint === 'md' && 'md:flex-row',
        reverseOnMobile && breakpoint === 'lg' && 'lg:flex-row',
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================
// Sidebar Layout - Responsive sidebar
// ============================================

interface SidebarLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  /** Sidebar position */
  sidebarPosition?: 'left' | 'right'
  /** Sidebar width */
  sidebarWidth?: string
  /** Breakpoint at which sidebar becomes top/bottom */
  collapseBelow?: 'sm' | 'md' | 'lg'
  /** Gap between sidebar and content */
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SidebarLayout({
  children,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = '280px',
  collapseBelow = 'lg',
  gap = 'md',
  className,
}: SidebarLayoutProps) {
  const { isLg, isMd, isSm } = useBreakpoint()

  const isCollapsed = (() => {
    switch (collapseBelow) {
      case 'sm': return !isSm
      case 'md': return !isMd
      case 'lg': return !isLg
      default: return !isLg
    }
  })()

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  }

  if (isCollapsed) {
    return (
      <div className={cn('flex flex-col', gapClasses[gap], className)}>
        {sidebar}
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn('flex', gapClasses[gap], className)}
      style={{
        flexDirection: sidebarPosition === 'right' ? 'row-reverse' : 'row',
      }}
    >
      <aside style={{ width: sidebarWidth, flexShrink: 0 }}>{sidebar}</aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}

// ============================================
// Aspect Ratio Box
// ============================================

interface AspectRatioProps {
  children: ReactNode
  ratio?: number | '1:1' | '4:3' | '16:9' | '21:9'
  className?: string
}

export function AspectRatio({ children, ratio = '16:9', className }: AspectRatioProps) {
  const ratioValue = typeof ratio === 'number'
    ? ratio
    : {
        '1:1': 1,
        '4:3': 4 / 3,
        '16:9': 16 / 9,
        '21:9': 21 / 9,
      }[ratio]

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{ paddingBottom: `${(1 / ratioValue) * 100}%` }}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}
