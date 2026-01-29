import { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import type { DependencyList } from 'react'

// ============================================
// Deep Compare Memo Hook
// ============================================

/**
 * Custom comparison function type
 */
type CompareFunction<T> = (prev: T, next: T) => boolean

/**
 * Deep equality check for objects/arrays
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== typeof b) return false

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>
    const bObj = b as Record<string, unknown>

    const keysA = Object.keys(aObj)
    const keysB = Object.keys(bObj)

    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      if (!deepEqual(aObj[key], bObj[key])) return false
    }

    return true
  }

  return false
}

/**
 * useMemo with deep comparison of dependencies
 * Use when deps contain objects/arrays that change reference but not value
 */
export function useDeepMemo<T>(factory: () => T, deps: DependencyList): T {
  const ref = useRef<{ deps: DependencyList; value: T } | undefined>(undefined)

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() }
  }

  return ref.current.value
}

/**
 * useCallback with deep comparison of dependencies
 */
export function useDeepCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: DependencyList
): T {
  const ref = useRef<{ deps: DependencyList; callback: T } | undefined>(undefined)

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, callback }
  }

  return ref.current.callback
}

// ============================================
// Previous Value Hook
// ============================================

/**
 * Returns the previous value of a variable
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// ============================================
// Stable Callback Hook
// ============================================

/**
 * Returns a stable callback that always calls the latest version
 * Useful for callbacks passed to memoized children
 */
export function useStableCallback<T extends (...args: never[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  )
}

// ============================================
// Memoized Value with Custom Compare
// ============================================

/**
 * useMemo with custom comparison function
 */
export function useMemoCompare<T>(
  factory: () => T,
  deps: DependencyList,
  compare: CompareFunction<T>
): T {
  const ref = useRef<T | undefined>(undefined)
  const depsRef = useRef<DependencyList>(deps)

  const depsChanged = deps.some((dep, i) => dep !== depsRef.current[i])

  if (depsChanged || ref.current === undefined) {
    const newValue = factory()

    if (ref.current === undefined || !compare(ref.current, newValue)) {
      ref.current = newValue
    }

    depsRef.current = deps
  }

  return ref.current
}

// ============================================
// Cached Async Hook
// ============================================

interface CacheEntry<T> {
  value: T
  timestamp: number
}

const asyncCache = new Map<string, CacheEntry<unknown>>()

interface UseCachedAsyncOptions {
  /** Cache key */
  key: string
  /** Cache duration in ms (default: 5 minutes) */
  cacheDuration?: number
  /** Whether to use cache */
  enabled?: boolean
}

/**
 * Hook for caching async function results
 */
export function useCachedAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseCachedAsyncOptions
): {
  data: T | undefined
  isLoading: boolean
  error: Error | undefined
  refetch: () => Promise<void>
  clearCache: () => void
} {
  const { key, cacheDuration = 5 * 60 * 1000, enabled = true } = options

  const mountedRef = useRef(true)
  const [state, setState] = useState<{
    data: T | undefined
    isLoading: boolean
    error: Error | undefined
  }>({
    data: undefined,
    isLoading: false,
    error: undefined,
  })

  const fetchData = useCallback(async (skipCache = false) => {
    if (!enabled) return

    // Check cache
    if (!skipCache) {
      const cached = asyncCache.get(key) as CacheEntry<T> | undefined
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setState({ data: cached.value, isLoading: false, error: undefined })
        return
      }
    }

    setState((prev) => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const result = await asyncFn()

      if (mountedRef.current) {
        asyncCache.set(key, { value: result, timestamp: Date.now() })
        setState({ data: result, isLoading: false, error: undefined })
      }
    } catch (err) {
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err as Error
        }))
      }
    }
  }, [key, cacheDuration, enabled, asyncFn])

  const clearCache = useCallback(() => {
    asyncCache.delete(key)
  }, [key])

  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
    clearCache,
  }
}

// ============================================
// Memoized Selector Hook
// ============================================

/**
 * Memoized selector that only recomputes when selected data changes
 * Similar to Redux's useSelector behavior
 */
export function useMemoizedSelector<TState, TSelected>(
  state: TState,
  selector: (state: TState) => TSelected,
  equalityFn: (a: TSelected, b: TSelected) => boolean = Object.is
): TSelected {
  const selectedRef = useRef<TSelected | undefined>(undefined)
  const selectorRef = useRef(selector)

  // Update selector ref
  selectorRef.current = selector

  return useMemo(() => {
    const newSelected = selectorRef.current(state)

    if (selectedRef.current !== undefined && equalityFn(selectedRef.current, newSelected)) {
      return selectedRef.current
    }

    selectedRef.current = newSelected
    return newSelected
  }, [state, equalityFn])
}

// ============================================
// Lazy Initialization Hook
// ============================================

/**
 * Lazy initialization that only runs once
 */
export function useLazyInit<T>(initializer: () => T): T {
  const ref = useRef<{ value: T; initialized: boolean }>({
    value: undefined as unknown as T,
    initialized: false,
  })

  if (!ref.current.initialized) {
    ref.current.value = initializer()
    ref.current.initialized = true
  }

  return ref.current.value
}

// ============================================
// Computed Value Hook
// ============================================

/**
 * Creates a computed value that updates only when dependencies change
 * More explicit than useMemo
 */
export function useComputed<T, D extends readonly unknown[]>(
  compute: (...deps: D) => T,
  deps: D
): T {
  return useMemo(() => compute(...deps), deps)
}

// ============================================
// Export Utility Functions
// ============================================

export { deepEqual }

/**
 * Memoize a function with cache
 */
export function memoize<Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
  options: {
    maxSize?: number
    keyFn?: (...args: Args) => string
  } = {}
): (...args: Args) => Result {
  const { maxSize = 100, keyFn = (...args) => JSON.stringify(args) } = options
  const cache = new Map<string, Result>()
  const keys: string[] = []

  return (...args: Args): Result => {
    const key = keyFn(...args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    keys.push(key)

    // Evict old entries if cache is full
    if (keys.length > maxSize) {
      const oldKey = keys.shift()!
      cache.delete(oldKey)
    }

    return result
  }
}

/**
 * Create a shallow equality checker
 */
export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  if (a === b) return true
  if (!a || !b) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (a[key] !== b[key]) return false
  }

  return true
}
