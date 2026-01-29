import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'

// ============================================
// VisuallyHidden - For screen reader only content
// ============================================

interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  /** If true, shows content when focused (useful for skip links) */
  focusable?: boolean
}

export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ children, focusable, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0',
          '[clip:rect(0,0,0,0)]',
          focusable && 'focus:static focus:h-auto focus:w-auto focus:clip-auto focus:whitespace-normal',
          className
        )}
        style={{ margin: '-1px' }}
        {...props}
      >
        {children}
      </span>
    )
  }
)
VisuallyHidden.displayName = 'VisuallyHidden'

// ============================================
// SkipLink - For keyboard users to skip navigation
// ============================================

interface SkipLinkProps {
  /** Target element ID to skip to */
  targetId: string
  /** Link text */
  children?: ReactNode
  className?: string
}

export function SkipLink({ targetId, children = '본문으로 바로가기', className }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:left-4 focus:top-4 focus:z-[100]',
        'focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2',
        'focus:text-sm focus:font-medium focus:text-white focus:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  )
}

// ============================================
// LiveRegion - For dynamic content announcements
// ============================================

interface LiveRegionProps {
  /** Content to announce */
  message: string
  /** How assertive the announcement should be */
  politeness?: 'polite' | 'assertive'
  /** Delay before announcing (ms) */
  delay?: number
}

export function LiveRegion({ message, politeness = 'polite', delay = 100 }: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (message) {
      // Clear first, then set after delay (helps with repeated messages)
      setAnnouncement('')
      const timer = setTimeout(() => setAnnouncement(message), delay)
      return () => clearTimeout(timer)
    }
  }, [message, delay])

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}

// ============================================
// FocusTrap - Trap focus within a container
// ============================================

interface FocusTrapProps {
  children: ReactNode
  /** Whether the trap is active */
  active?: boolean
  /** Return focus to this element when trap is deactivated */
  returnFocusRef?: React.RefObject<HTMLElement | null>
  className?: string
}

export function FocusTrap({ children, active = true, returnFocusRef, className }: FocusTrapProps) {
  useEffect(() => {
    if (!active) return

    const previousActiveElement = document.activeElement as HTMLElement

    return () => {
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus()
      } else if (previousActiveElement) {
        previousActiveElement.focus()
      }
    }
  }, [active, returnFocusRef])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!active || e.key !== 'Tab') return

    const container = e.currentTarget as HTMLElement
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  return (
    <div onKeyDown={handleKeyDown} className={className}>
      {children}
    </div>
  )
}

// ============================================
// ReducedMotion hook - Respect user's motion preferences
// ============================================

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// ============================================
// Accessible Icon Button
// ============================================

interface IconButtonProps extends HTMLAttributes<HTMLButtonElement> {
  /** Icon element */
  icon: ReactNode
  /** Accessible label for screen readers */
  label: string
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Visual variant */
  variant?: 'default' | 'ghost' | 'outline'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, disabled, size = 'md', variant = 'default', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    }

    const variantClasses = {
      default: 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300',
      ghost: 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400',
      outline: 'border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300',
    }

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-stone-900',
          sizeClasses[size],
          variantClasses[variant],
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      >
        {icon}
        <VisuallyHidden>{label}</VisuallyHidden>
      </button>
    )
  }
)
IconButton.displayName = 'IconButton'

// ============================================
// Accessible Progress Bar
// ============================================

interface AccessibleProgressProps {
  /** Current value (0-100) */
  value: number
  /** Maximum value */
  max?: number
  /** Accessible label */
  label: string
  /** Show percentage text */
  showText?: boolean
  className?: string
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  showText,
  className,
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-stone-600 dark:text-stone-400">{label}</span>
        {showText && (
          <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
            {percentage}%
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${percentage}%`}
        className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
      >
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// KeyboardShortcut indicator
// ============================================

interface KeyboardShortcutProps {
  keys: string[]
  className?: string
}

export function KeyboardShortcut({ keys, className }: KeyboardShortcutProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((key, i) => (
        <span key={i}>
          {i > 0 && <span className="text-stone-400 mx-0.5">+</span>}
          <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-stone-300 bg-stone-100 px-1.5 text-xs font-medium text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  )
}
