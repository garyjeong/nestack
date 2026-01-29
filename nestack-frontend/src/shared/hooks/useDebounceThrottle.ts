import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================
// Debounce Hook - Value
// ============================================

/**
 * Returns a debounced version of the value
 * @param value - Value to debounce
 * @param delay - Debounce delay in ms
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ============================================
// Debounce Hook - Callback
// ============================================

interface DebounceOptions {
  /** Debounce delay in ms */
  delay: number
  /** Execute immediately on leading edge */
  leading?: boolean
  /** Execute on trailing edge (default: true) */
  trailing?: boolean
  /** Max wait time before forced execution */
  maxWait?: number
}

interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
  pending: () => boolean
}

/**
 * Returns a debounced callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: number | DebounceOptions
): DebouncedFunction<T> {
  const {
    delay,
    leading = false,
    trailing = true,
    maxWait,
  } = typeof options === 'number' ? { delay: options } : options

  const callbackRef = useRef(callback)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCallRef = useRef<{ args: Parameters<T> } | null>(null)
  const lastInvokeTimeRef = useRef(0)
  const pendingRef = useRef(false)

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const invoke = useCallback((args: Parameters<T>) => {
    lastInvokeTimeRef.current = Date.now()
    pendingRef.current = false
    callbackRef.current(...args)
  }, [])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current)
      maxTimerRef.current = null
    }
    lastCallRef.current = null
    pendingRef.current = false
  }, [])

  const flush = useCallback(() => {
    if (timerRef.current && lastCallRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
      if (maxTimerRef.current) {
        clearTimeout(maxTimerRef.current)
        maxTimerRef.current = null
      }
      invoke(lastCallRef.current.args)
      lastCallRef.current = null
    }
  }, [invoke])

  const pending = useCallback(() => pendingRef.current, [])

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const isInvoking = leading && !timerRef.current
      lastCallRef.current = { args }
      pendingRef.current = true

      // Cancel previous timer
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // Leading edge execution
      if (isInvoking) {
        invoke(args)
        if (!trailing) {
          pendingRef.current = false
          return
        }
      }

      // Set up trailing edge timer
      if (trailing) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null
          if (maxTimerRef.current) {
            clearTimeout(maxTimerRef.current)
            maxTimerRef.current = null
          }
          if (lastCallRef.current && (!leading || lastCallRef.current.args !== args)) {
            invoke(lastCallRef.current.args)
          }
          lastCallRef.current = null
        }, delay)
      }

      // Max wait timer
      if (maxWait && !maxTimerRef.current) {
        const timeSinceLastInvoke = now - lastInvokeTimeRef.current
        const remainingWait = maxWait - timeSinceLastInvoke

        if (remainingWait > 0) {
          maxTimerRef.current = setTimeout(() => {
            maxTimerRef.current = null
            if (timerRef.current) {
              clearTimeout(timerRef.current)
              timerRef.current = null
            }
            if (lastCallRef.current) {
              invoke(lastCallRef.current.args)
              lastCallRef.current = null
            }
          }, remainingWait)
        }
      }
    },
    [delay, leading, trailing, maxWait, invoke]
  ) as DebouncedFunction<T>

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  // Attach methods
  debouncedFn.cancel = cancel
  debouncedFn.flush = flush
  debouncedFn.pending = pending

  return debouncedFn
}

// ============================================
// Throttle Hook - Value
// ============================================

/**
 * Returns a throttled version of the value
 * @param value - Value to throttle
 * @param interval - Throttle interval in ms
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdated = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()

    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - (now - lastUpdated.current))

      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}

// ============================================
// Throttle Hook - Callback
// ============================================

interface ThrottleOptions {
  /** Throttle interval in ms */
  interval: number
  /** Execute immediately on leading edge (default: true) */
  leading?: boolean
  /** Execute on trailing edge (default: true) */
  trailing?: boolean
}

interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void
  cancel: () => void
}

/**
 * Returns a throttled callback function
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: number | ThrottleOptions
): ThrottledFunction<T> {
  const {
    interval,
    leading = true,
    trailing = true,
  } = typeof options === 'number' ? { interval: options } : options

  const callbackRef = useRef(callback)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCallRef = useRef<{ args: Parameters<T> } | null>(null)
  const lastInvokeTimeRef = useRef(0)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const invoke = useCallback((args: Parameters<T>) => {
    lastInvokeTimeRef.current = Date.now()
    callbackRef.current(...args)
  }, [])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    lastCallRef.current = null
  }, [])

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastInvoke = now - lastInvokeTimeRef.current
      const shouldInvoke = timeSinceLastInvoke >= interval

      lastCallRef.current = { args }

      if (shouldInvoke) {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }

        if (leading || lastInvokeTimeRef.current !== 0) {
          invoke(args)
        }
      } else if (trailing && !timerRef.current) {
        const remainingTime = interval - timeSinceLastInvoke

        timerRef.current = setTimeout(() => {
          timerRef.current = null
          if (lastCallRef.current) {
            invoke(lastCallRef.current.args)
            lastCallRef.current = null
          }
        }, remainingTime)
      }
    },
    [interval, leading, trailing, invoke]
  ) as ThrottledFunction<T>

  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  throttledFn.cancel = cancel

  return throttledFn
}

// ============================================
// Debounced State Hook
// ============================================

/**
 * useState with debounced value
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, (value: T) => void] {
  const [value, setValue] = useState(initialValue)
  const debouncedValue = useDebounce(value, delay)

  return [value, debouncedValue, setValue]
}

// ============================================
// Search Input Hook
// ============================================

interface UseSearchOptions {
  /** Debounce delay */
  delay?: number
  /** Minimum search length */
  minLength?: number
  /** Callback when debounced value changes */
  onSearch?: (value: string) => void
}

/**
 * Hook optimized for search inputs
 */
export function useSearch(options: UseSearchOptions = {}) {
  const { delay = 300, minLength = 0, onSearch } = options
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    if (debouncedValue.length >= minLength) {
      onSearch?.(debouncedValue)
    }
  }, [debouncedValue, minLength, onSearch])

  const clear = useCallback(() => setValue(''), [])

  return {
    value,
    debouncedValue,
    setValue,
    clear,
    isEmpty: value.length === 0,
    isSearching: value !== debouncedValue,
  }
}

// ============================================
// Scroll Handler Hook
// ============================================

interface ScrollPosition {
  x: number
  y: number
  direction: 'up' | 'down' | 'left' | 'right' | null
}

interface UseScrollOptions {
  /** Throttle interval */
  throttleInterval?: number
  /** Element to track (default: window) */
  element?: React.RefObject<HTMLElement>
}

/**
 * Hook for optimized scroll handling
 */
export function useScroll(options: UseScrollOptions = {}): ScrollPosition {
  const { throttleInterval = 100, element } = options
  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: null,
  })
  const prevPositionRef = useRef({ x: 0, y: 0 })

  const handleScroll = useThrottledCallback(() => {
    const target = element?.current || window
    const x = 'scrollX' in target ? target.scrollX : target.scrollLeft
    const y = 'scrollY' in target ? target.scrollY : target.scrollTop

    let direction: ScrollPosition['direction'] = null
    if (y > prevPositionRef.current.y) direction = 'down'
    else if (y < prevPositionRef.current.y) direction = 'up'
    else if (x > prevPositionRef.current.x) direction = 'right'
    else if (x < prevPositionRef.current.x) direction = 'left'

    prevPositionRef.current = { x, y }
    setPosition({ x, y, direction })
  }, throttleInterval)

  useEffect(() => {
    const target = element?.current || window
    target.addEventListener('scroll', handleScroll, { passive: true })
    return () => target.removeEventListener('scroll', handleScroll)
  }, [element, handleScroll])

  return position
}

// ============================================
// Resize Handler Hook
// ============================================

interface Dimensions {
  width: number
  height: number
}

/**
 * Hook for optimized resize handling
 */
export function useResize(throttleInterval = 100): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  const handleResize = useThrottledCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, throttleInterval)

  useEffect(() => {
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  return dimensions
}

// ============================================
// RAF (Request Animation Frame) Throttle
// ============================================

/**
 * Throttle callback to animation frame
 */
export function useRAFCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const requestRef = useRef<number | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const rafCallback = useCallback((...args: Parameters<T>) => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current)
    }

    requestRef.current = requestAnimationFrame(() => {
      callbackRef.current(...args)
      requestRef.current = null
    })
  }, []) as T

  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  return rafCallback
}

// ============================================
// Idle Callback Hook
// ============================================

/**
 * Execute callback when browser is idle
 */
export function useIdleCallback(
  callback: () => void,
  options: { timeout?: number } = {}
): void {
  const { timeout = 1000 } = options
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(
        () => callbackRef.current(),
        { timeout }
      )
      return () => window.cancelIdleCallback(id)
    } else {
      // Fallback for browsers without requestIdleCallback
      const id = setTimeout(() => callbackRef.current(), timeout)
      return () => clearTimeout(id)
    }
  }, [timeout])
}

// Add type definitions for requestIdleCallback
declare global {
  interface Window {
    requestIdleCallback(
      callback: (deadline: IdleDeadline) => void,
      options?: { timeout?: number }
    ): number
    cancelIdleCallback(handle: number): void
  }

  interface IdleDeadline {
    readonly didTimeout: boolean
    timeRemaining(): number
  }
}
