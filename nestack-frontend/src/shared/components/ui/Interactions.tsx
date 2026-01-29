import { forwardRef, type ReactNode, type ButtonHTMLAttributes, useState } from 'react'
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

// ============================================
// Pressable - Adds tap/press animation to any element
// ============================================

interface PressableProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  /** Scale amount when pressed (0-1) */
  pressScale?: number
  /** Duration of the press animation */
  pressDuration?: number
  /** Whether to disable the press effect */
  disabled?: boolean
}

export const Pressable = forwardRef<HTMLDivElement, PressableProps>(
  ({ children, pressScale = 0.97, pressDuration = 0.1, disabled, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn('cursor-pointer select-none', disabled && 'cursor-not-allowed', className)}
        whileTap={disabled ? undefined : { scale: pressScale }}
        transition={{ duration: pressDuration }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Pressable.displayName = 'Pressable'

// ============================================
// Ripple - Material-style ripple effect
// ============================================

interface RippleProps {
  children: ReactNode
  className?: string
  /** Ripple color */
  color?: string
  /** Duration of the ripple animation */
  duration?: number
}

interface RippleItem {
  id: number
  x: number
  y: number
  size: number
}

export function Ripple({ children, className, color = 'rgba(0, 0, 0, 0.1)', duration = 0.6 }: RippleProps) {
  const [ripples, setRipples] = useState<RippleItem[]>([])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const size = Math.max(rect.width, rect.height) * 2

    const newRipple: RippleItem = {
      id: Date.now(),
      x,
      y,
      size,
    }

    setRipples((prev) => [...prev, newRipple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, duration * 1000)
  }

  return (
    <div className={cn('relative overflow-hidden', className)} onClick={handleClick}>
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: color,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// Toggle Switch with smooth animation
// ============================================

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Label for accessibility */
  label?: string
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  size = 'md',
  className,
  label,
}: ToggleSwitchProps) {
  const sizes = {
    sm: { track: 'w-9 h-5', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'h-5 w-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'h-6 w-6', translate: 'translate-x-7' },
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        sizes[size].track,
        checked ? 'bg-primary-500' : 'bg-stone-300 dark:bg-stone-600',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <motion.span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0',
          sizes[size].thumb
        )}
        initial={false}
        animate={{
          x: checked ? (size === 'sm' ? 16 : size === 'md' ? 20 : 28) : 2,
          y: 2,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

// ============================================
// Success Checkmark Animation
// ============================================

interface SuccessCheckProps {
  show: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onComplete?: () => void
}

export function SuccessCheck({ show, size = 'md', className, onComplete }: SuccessCheckProps) {
  const sizes = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  }

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onAnimationComplete={onComplete}
          className={cn(
            'flex items-center justify-center rounded-full bg-green-500',
            sizes[size],
            className
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Check className={cn('text-white', iconSizes[size])} strokeWidth={3} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// Bounce Animation Wrapper
// ============================================

interface BounceProps {
  children: ReactNode
  /** Trigger bounce animation */
  animate?: boolean
  className?: string
}

export function Bounce({ children, animate, className }: BounceProps) {
  return (
    <motion.div
      className={className}
      animate={animate ? { y: [0, -10, 0] } : undefined}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// Shake Animation Wrapper (for errors)
// ============================================

interface ShakeProps {
  children: ReactNode
  /** Trigger shake animation */
  animate?: boolean
  className?: string
}

export function Shake({ children, animate, className }: ShakeProps) {
  return (
    <motion.div
      className={className}
      animate={animate ? { x: [0, -10, 10, -10, 10, 0] } : undefined}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// Pulse Animation (for notifications/badges)
// ============================================

interface PulseProps {
  children: ReactNode
  /** Enable pulse animation */
  pulse?: boolean
  /** Pulse color */
  color?: string
  className?: string
}

export function Pulse({ children, pulse = true, color = 'rgba(34, 197, 94, 0.4)', className }: PulseProps) {
  return (
    <div className={cn('relative', className)}>
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      {children}
    </div>
  )
}

// ============================================
// Swipeable Item for lists
// ============================================

interface SwipeableProps {
  children: ReactNode
  /** Content to show when swiping right */
  leftAction?: ReactNode
  /** Content to show when swiping left */
  rightAction?: ReactNode
  /** Callback when swiped left */
  onSwipeLeft?: () => void
  /** Callback when swiped right */
  onSwipeRight?: () => void
  /** Threshold for triggering action (px) */
  threshold?: number
  className?: string
}

export function Swipeable({
  children,
  leftAction,
  rightAction,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  className,
}: SwipeableProps) {
  const [dragX, setDragX] = useState(0)

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight()
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft()
    }
    setDragX(0)
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left action background */}
      {leftAction && (
        <div className="absolute inset-y-0 left-0 flex items-center bg-green-500 px-4">
          {leftAction}
        </div>
      )}
      {/* Right action background */}
      {rightAction && (
        <div className="absolute inset-y-0 right-0 flex items-center bg-red-500 px-4">
          {rightAction}
        </div>
      )}
      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: rightAction ? -150 : 0, right: leftAction ? 150 : 0 }}
        dragElastic={0.1}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={{ x: dragX === 0 ? 0 : undefined }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative z-10 bg-white dark:bg-stone-800"
      >
        {children}
      </motion.div>
    </div>
  )
}

// ============================================
// Number Counter Animation
// ============================================

interface CounterProps {
  value: number
  /** Duration of the animation in seconds */
  duration?: number
  /** Format the number */
  format?: (value: number) => string
  className?: string
}

export function Counter({ value, duration: _duration = 1, format = (v) => v.toString(), className }: CounterProps) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {format(value)}
    </motion.span>
  )
}

// ============================================
// Floating Action Button with animation
// ============================================

interface FloatingButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  icon: ReactNode
  /** Extended label (shows on hover/focus) */
  label?: string
  /** Position */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  className?: string
}

export const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  ({ icon, label, position = 'bottom-right', className, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false)

    const positionClasses = {
      'bottom-right': 'right-4',
      'bottom-left': 'left-4',
      'bottom-center': 'left-1/2 -translate-x-1/2',
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'fixed bottom-24 z-30 flex items-center justify-center rounded-full bg-primary-500 text-white shadow-lg',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          positionClasses[position],
          className
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        {...props}
      >
        <motion.div
          className="flex items-center gap-2 px-4 py-3"
          animate={{ width: isHovered && label ? 'auto' : 48 }}
        >
          {icon}
          <AnimatePresence>
            {isHovered && label && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap text-sm font-medium"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>
    )
  }
)
FloatingButton.displayName = 'FloatingButton'

// ============================================
// Confetti burst animation
// ============================================

interface ConfettiProps {
  show: boolean
  particleCount?: number
  duration?: number
  onComplete?: () => void
}

export function Confetti({ show, particleCount = 30, duration = 2, onComplete }: ConfettiProps) {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {Array.from({ length: particleCount }).map((_, i) => {
            const randomX = Math.random() * 100
            const randomDelay = Math.random() * 0.5
            const randomRotation = Math.random() * 720 - 360
            const randomSize = Math.random() * 8 + 4

            return (
              <motion.div
                key={i}
                initial={{
                  x: `${randomX}vw`,
                  y: -20,
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  y: '110vh',
                  rotate: randomRotation,
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: duration,
                  delay: randomDelay,
                  ease: 'easeIn',
                }}
                onAnimationComplete={i === 0 ? onComplete : undefined}
                style={{
                  position: 'absolute',
                  width: randomSize,
                  height: randomSize,
                  backgroundColor: colors[i % colors.length],
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
              />
            )
          })}
        </div>
      )}
    </AnimatePresence>
  )
}
