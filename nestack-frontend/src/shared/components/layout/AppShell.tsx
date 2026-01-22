import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { cn } from '@/shared/utils/cn'

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
    <div className={cn('min-h-screen bg-stone-50', className)}>
      <main className={cn(showBottomNav && 'pb-20')}>{children}</main>
      {showBottomNav && <BottomNav />}
    </div>
  )
}

// Container for max-width content
interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto max-w-lg px-4', className)}>{children}</div>
  )
}

// Page wrapper with padding
interface PageProps {
  children: ReactNode
  className?: string
}

export function Page({ children, className }: PageProps) {
  return (
    <div className={cn('mx-auto max-w-lg px-4 py-6', className)}>
      {children}
    </div>
  )
}
