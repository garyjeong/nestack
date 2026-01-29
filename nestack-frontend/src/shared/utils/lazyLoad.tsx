import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react'
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react'
import { ErrorBoundary } from '@/shared/components/error'

// ============================================
// Types
// ============================================

type ComponentModule<T> = { default: T }
type NamedComponentModule<T> = { [key: string]: T }

// ============================================
// Enhanced Lazy Load with Retry
// ============================================

/**
 * Enhanced lazy load with retry mechanism
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  importFn: () => Promise<ComponentModule<T>>,
  options: { maxRetries?: number; retryDelay?: number } = {}
): LazyExoticComponent<T> {
  const { maxRetries = 3, retryDelay = 1000 } = options

  return lazy(async () => {
    let lastError: Error | undefined

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await importFn()
      } catch (error) {
        lastError = error as Error

        // Check if it's a network error (chunk load failure)
        if (error instanceof Error && error.message.includes('Loading chunk')) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
          continue
        }

        // If it's not a chunk loading error, throw immediately
        throw error
      }
    }

    throw lastError
  })
}

// ============================================
// Lazy Load with Named Export
// ============================================

/**
 * Lazy load a named export from a module
 */
export function lazyNamed<T extends ComponentType<unknown>>(
  importFn: () => Promise<NamedComponentModule<T>>,
  exportName: string
): LazyExoticComponent<T> {
  return lazy(async () => {
    const module = await importFn()
    return { default: module[exportName] }
  })
}

// ============================================
// Lazy Load with Minimum Delay
// ============================================

/**
 * Lazy load with minimum delay to prevent loading flash
 */
export function lazyWithDelay<T extends ComponentType<unknown>>(
  importFn: () => Promise<ComponentModule<T>>,
  minDelay: number = 300
): LazyExoticComponent<T> {
  return lazy(async () => {
    const [module] = await Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, minDelay)),
    ])
    return module
  })
}

// ============================================
// Preloadable Lazy Component
// ============================================

interface PreloadableComponent<T extends ComponentType<unknown>> {
  Component: LazyExoticComponent<T>
  preload: () => Promise<void>
}

/**
 * Create a lazy component that can be preloaded
 */
export function lazyPreload<T extends ComponentType<unknown>>(
  importFn: () => Promise<ComponentModule<T>>
): PreloadableComponent<T> {
  let modulePromise: Promise<ComponentModule<T>> | null = null

  const preload = () => {
    if (!modulePromise) {
      modulePromise = importFn()
    }
    return modulePromise.then(() => undefined)
  }

  const Component = lazy(() => {
    if (!modulePromise) {
      modulePromise = importFn()
    }
    return modulePromise
  })

  return { Component, preload }
}

// ============================================
// Lazy Wrapper Component
// ============================================

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
}

/**
 * Wrapper component with Suspense and ErrorBoundary
 */
export function LazyWrapper({
  children,
  fallback = <DefaultLoadingFallback />,
  errorFallback,
}: LazyWrapperProps) {
  return (
    <ErrorBoundary
      fallback={errorFallback || <DefaultErrorFallback />}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// ============================================
// Default Fallback Components
// ============================================

function DefaultLoadingFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        <span className="text-sm text-stone-500 dark:text-stone-400">
          로딩 중...
        </span>
      </div>
    </div>
  )
}

function DefaultErrorFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="text-center">
        <p className="text-stone-600 dark:text-stone-400">
          컴포넌트를 불러오는데 실패했습니다.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600"
        >
          새로고침
        </button>
      </div>
    </div>
  )
}

// ============================================
// Skeleton Loading Fallback
// ============================================

interface SkeletonFallbackProps {
  type?: 'page' | 'card' | 'list' | 'form'
}

export function SkeletonFallback({ type = 'page' }: SkeletonFallbackProps) {
  const skeletons = {
    page: (
      <div className="animate-pulse space-y-4 p-4">
        <div className="h-8 w-1/3 rounded bg-stone-200 dark:bg-stone-700" />
        <div className="space-y-3">
          <div className="h-4 rounded bg-stone-200 dark:bg-stone-700" />
          <div className="h-4 w-5/6 rounded bg-stone-200 dark:bg-stone-700" />
          <div className="h-4 w-4/6 rounded bg-stone-200 dark:bg-stone-700" />
        </div>
        <div className="h-40 rounded-xl bg-stone-200 dark:bg-stone-700" />
      </div>
    ),
    card: (
      <div className="animate-pulse rounded-xl border border-stone-200 dark:border-stone-700 p-4">
        <div className="h-6 w-1/2 rounded bg-stone-200 dark:bg-stone-700" />
        <div className="mt-3 space-y-2">
          <div className="h-4 rounded bg-stone-200 dark:bg-stone-700" />
          <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-700" />
        </div>
      </div>
    ),
    list: (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="h-10 w-10 rounded-full bg-stone-200 dark:bg-stone-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-stone-200 dark:bg-stone-700" />
              <div className="h-3 w-1/2 rounded bg-stone-200 dark:bg-stone-700" />
            </div>
          </div>
        ))}
      </div>
    ),
    form: (
      <div className="animate-pulse space-y-4 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="mb-2 h-4 w-20 rounded bg-stone-200 dark:bg-stone-700" />
            <div className="h-12 rounded-xl bg-stone-200 dark:bg-stone-700" />
          </div>
        ))}
        <div className="h-12 rounded-xl bg-stone-300 dark:bg-stone-600" />
      </div>
    ),
  }

  return skeletons[type]
}

// ============================================
// Preload on Hover/Focus Hook
// ============================================

/**
 * Hook to preload component on hover or focus
 */
export function usePreloadOnInteraction(preloadFn: () => Promise<void>) {
  const [hasPreloaded, setHasPreloaded] = useState(false)

  const handleInteraction = () => {
    if (!hasPreloaded) {
      preloadFn()
      setHasPreloaded(true)
    }
  }

  return {
    onMouseEnter: handleInteraction,
    onFocus: handleInteraction,
    onTouchStart: handleInteraction,
  }
}

// ============================================
// Intersection Observer Preload Hook
// ============================================

/**
 * Hook to preload component when element is near viewport
 */
export function usePreloadOnVisible(
  preloadFn: () => Promise<void>,
  options: IntersectionObserverInit = { rootMargin: '200px' }
) {
  const [ref, setRef] = useState<Element | null>(null)
  const [hasPreloaded, setHasPreloaded] = useState(false)

  useEffect(() => {
    if (!ref || hasPreloaded) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        preloadFn()
        setHasPreloaded(true)
        observer.disconnect()
      }
    }, options)

    observer.observe(ref)

    return () => observer.disconnect()
  }, [ref, hasPreloaded, preloadFn, options])

  return setRef
}

// ============================================
// Route Preloader Component
// ============================================

interface RoutePreloaderProps {
  /** Routes to preload */
  routes: Array<{
    path: string
    preload: () => Promise<void>
  }>
  /** Delay before starting preload */
  delay?: number
}

/**
 * Component that preloads routes after initial render
 */
export function RoutePreloader({ routes, delay = 2000 }: RoutePreloaderProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Preload routes one by one to not overwhelm the network
      routes.reduce(
        (promise, route) => promise.then(() => route.preload()),
        Promise.resolve()
      )
    }, delay)

    return () => clearTimeout(timer)
  }, [routes, delay])

  return null
}

// ============================================
// Create Lazy Page Helper
// ============================================

interface LazyPageConfig {
  loader: () => Promise<ComponentModule<ComponentType<unknown>>>
  fallbackType?: 'page' | 'card' | 'list' | 'form'
}

/**
 * Create a lazy page component with all optimizations
 */
export function createLazyPage(config: LazyPageConfig) {
  const { loader, fallbackType = 'page' } = config
  const { Component, preload } = lazyPreload(loader)

  function LazyPage(props: Record<string, unknown>) {
    return (
      <LazyWrapper fallback={<SkeletonFallback type={fallbackType} />}>
        <Component {...props} />
      </LazyWrapper>
    )
  }

  LazyPage.preload = preload

  return LazyPage
}
