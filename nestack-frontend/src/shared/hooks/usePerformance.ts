import { useRef, useEffect, useState, useCallback, useMemo } from 'react'

// ============================================
// Types
// ============================================

interface RenderInfo {
  count: number
  lastRenderTime: number
  averageRenderTime: number
  totalRenderTime: number
}

// ============================================
// Render Counter Hook
// ============================================

/**
 * Tracks component render count and timing
 * Useful for debugging unnecessary re-renders
 */
export function useRenderCount(componentName?: string): RenderInfo {
  const renderCountRef = useRef(0)
  const renderTimesRef = useRef<number[]>([])
  const lastRenderStartRef = useRef(performance.now())

  // Count render
  renderCountRef.current += 1

  // Track render time
  useEffect(() => {
    const renderTime = performance.now() - lastRenderStartRef.current
    renderTimesRef.current.push(renderTime)

    // Keep only last 100 renders
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current.shift()
    }

    lastRenderStartRef.current = performance.now()

    if (import.meta.env.DEV && componentName) {
      console.log(
        `[${componentName}] Render #${renderCountRef.current}, Time: ${renderTime.toFixed(2)}ms`
      )
    }
  })

  const times = renderTimesRef.current
  const totalTime = times.reduce((sum, t) => sum + t, 0)

  return {
    count: renderCountRef.current,
    lastRenderTime: times[times.length - 1] || 0,
    averageRenderTime: times.length > 0 ? totalTime / times.length : 0,
    totalRenderTime: totalTime,
  }
}

// ============================================
// Why Did You Render Hook
// ============================================

interface PropsChange {
  prop: string
  from: unknown
  to: unknown
}

/**
 * Tracks which props changed between renders
 * Helps identify unnecessary re-renders
 */
export function useWhyDidYouRender<T extends Record<string, unknown>>(
  props: T,
  componentName?: string
): PropsChange[] {
  const prevPropsRef = useRef<T | undefined>(undefined)
  const changesRef = useRef<PropsChange[]>([])

  useEffect(() => {
    if (prevPropsRef.current) {
      const changes: PropsChange[] = []

      // Check for changed props
      Object.keys(props).forEach((key) => {
        if (prevPropsRef.current![key] !== props[key]) {
          changes.push({
            prop: key,
            from: prevPropsRef.current![key],
            to: props[key],
          })
        }
      })

      // Check for new props
      Object.keys(props).forEach((key) => {
        if (!(key in prevPropsRef.current!)) {
          changes.push({
            prop: key,
            from: undefined,
            to: props[key],
          })
        }
      })

      changesRef.current = changes

      if (import.meta.env.DEV && changes.length > 0 && componentName) {
        console.log(`[${componentName}] Props changed:`, changes)
      }
    }

    prevPropsRef.current = { ...props }
  })

  return changesRef.current
}

// ============================================
// FPS Monitor Hook
// ============================================

/**
 * Monitors frame rate
 */
export function useFPS(): number {
  const [fps, setFPS] = useState(60)
  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef(performance.now())
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const measureFPS = () => {
      const now = performance.now()
      const delta = now - lastFrameTimeRef.current
      lastFrameTimeRef.current = now

      frameTimesRef.current.push(delta)

      // Keep last 60 frames
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift()
      }

      // Calculate FPS every 10 frames
      if (frameTimesRef.current.length % 10 === 0) {
        const avgFrameTime =
          frameTimesRef.current.reduce((a, b) => a + b, 0) /
          frameTimesRef.current.length
        setFPS(Math.round(1000 / avgFrameTime))
      }

      rafRef.current = requestAnimationFrame(measureFPS)
    }

    rafRef.current = requestAnimationFrame(measureFPS)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return fps
}

// ============================================
// Performance Observer Hook
// ============================================

type PerformanceEntryType =
  | 'navigation'
  | 'resource'
  | 'paint'
  | 'longtask'
  | 'largest-contentful-paint'
  | 'first-input'
  | 'layout-shift'

interface UsePerformanceObserverOptions {
  entryTypes: PerformanceEntryType[]
  buffered?: boolean
  onEntry?: (entry: PerformanceEntry) => void
}

/**
 * Observes performance entries
 */
export function usePerformanceObserver(
  options: UsePerformanceObserverOptions
): PerformanceEntry[] {
  const [entries, setEntries] = useState<PerformanceEntry[]>([])
  const { entryTypes, buffered = true, onEntry } = options

  useEffect(() => {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const newEntries = list.getEntries()
        setEntries((prev) => [...prev, ...newEntries])
        newEntries.forEach((entry) => onEntry?.(entry))
      })

      observer.observe({ entryTypes, buffered })

      return () => observer.disconnect()
    } catch (e) {
      console.warn('PerformanceObserver not supported for:', entryTypes)
    }
  }, [entryTypes, buffered, onEntry])

  return entries
}

// ============================================
// Core Web Vitals Hook
// ============================================

interface WebVitals {
  /** Largest Contentful Paint */
  lcp: number | null
  /** First Input Delay */
  fid: number | null
  /** Cumulative Layout Shift */
  cls: number | null
  /** First Contentful Paint */
  fcp: number | null
  /** Time to First Byte */
  ttfb: number | null
}

/**
 * Measures Core Web Vitals
 */
export function useWebVitals(): WebVitals {
  const [vitals, setVitals] = useState<WebVitals>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
  })

  // LCP
  usePerformanceObserver({
    entryTypes: ['largest-contentful-paint'],
    onEntry: (entry) => {
      setVitals((prev) => ({ ...prev, lcp: entry.startTime }))
    },
  })

  // FID
  usePerformanceObserver({
    entryTypes: ['first-input'],
    onEntry: (entry) => {
      const fidEntry = entry as PerformanceEventTiming
      setVitals((prev) => ({
        ...prev,
        fid: fidEntry.processingStart - fidEntry.startTime,
      }))
    },
  })

  // CLS
  const clsRef = useRef(0)
  usePerformanceObserver({
    entryTypes: ['layout-shift'],
    onEntry: (entry) => {
      const lsEntry = entry as LayoutShift
      if (!lsEntry.hadRecentInput) {
        clsRef.current += lsEntry.value
        setVitals((prev) => ({ ...prev, cls: clsRef.current }))
      }
    },
  })

  // FCP & TTFB
  useEffect(() => {
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint')
    if (fcpEntry) {
      setVitals((prev) => ({ ...prev, fcp: fcpEntry.startTime }))
    }

    const navEntries = performance.getEntriesByType('navigation')
    if (navEntries.length > 0) {
      const navEntry = navEntries[0] as PerformanceNavigationTiming
      setVitals((prev) => ({ ...prev, ttfb: navEntry.responseStart }))
    }
  }, [])

  return vitals
}

// ============================================
// Memory Monitor Hook
// ============================================

interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  usagePercentage: number
}

/**
 * Monitors memory usage (Chrome only)
 */
export function useMemoryMonitor(pollInterval = 1000): MemoryInfo | null {
  const [memory, setMemory] = useState<MemoryInfo | null>(null)

  useEffect(() => {
    const checkMemory = () => {
      const perf = performance as Performance & {
        memory?: {
          usedJSHeapSize: number
          totalJSHeapSize: number
          jsHeapSizeLimit: number
        }
      }

      if (perf.memory) {
        setMemory({
          usedJSHeapSize: perf.memory.usedJSHeapSize,
          totalJSHeapSize: perf.memory.totalJSHeapSize,
          jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
          usagePercentage:
            (perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100,
        })
      }
    }

    checkMemory()
    const interval = setInterval(checkMemory, pollInterval)

    return () => clearInterval(interval)
  }, [pollInterval])

  return memory
}

// ============================================
// Long Task Monitor Hook
// ============================================

interface LongTask {
  duration: number
  startTime: number
  name: string
}

/**
 * Monitors long tasks (tasks > 50ms that block main thread)
 */
export function useLongTaskMonitor(): LongTask[] {
  const [longTasks, setLongTasks] = useState<LongTask[]>([])

  usePerformanceObserver({
    entryTypes: ['longtask'],
    onEntry: (entry) => {
      setLongTasks((prev) => [
        ...prev.slice(-19), // Keep last 20
        {
          duration: entry.duration,
          startTime: entry.startTime,
          name: entry.name,
        },
      ])
    },
  })

  return longTasks
}

// ============================================
// Component Performance Profiler
// ============================================

interface ProfilerData {
  id: string
  phase: 'mount' | 'update'
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
}

/**
 * Creates a profiler callback for React.Profiler
 */
export function useProfilerCallback(
  onRender?: (data: ProfilerData) => void
): (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => void {
  return useCallback(
    (
      id: string,
      phase: 'mount' | 'update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) => {
      const data: ProfilerData = {
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
      }

      if (import.meta.env.DEV) {
        console.log(`[Profiler:${id}]`, phase, `${actualDuration.toFixed(2)}ms`)
      }

      onRender?.(data)
    },
    [onRender]
  )
}

// ============================================
// Performance Dashboard Data Hook
// ============================================

interface PerformanceDashboard {
  fps: number
  memory: MemoryInfo | null
  vitals: WebVitals
  longTasks: LongTask[]
}

/**
 * Aggregates all performance metrics
 */
export function usePerformanceDashboard(): PerformanceDashboard {
  const fps = useFPS()
  const memory = useMemoryMonitor()
  const vitals = useWebVitals()
  const longTasks = useLongTaskMonitor()

  return useMemo(
    () => ({
      fps,
      memory,
      vitals,
      longTasks,
    }),
    [fps, memory, vitals, longTasks]
  )
}

// ============================================
// Performance Marker Hook
// ============================================

interface PerformanceMarker {
  mark: (name: string) => void
  measure: (name: string, startMark: string, endMark?: string) => number
  clearMarks: () => void
  getMarks: () => PerformanceEntry[]
  getMeasures: () => PerformanceEntry[]
}

/**
 * Utility for performance marks and measures
 */
export function usePerformanceMarker(prefix = ''): PerformanceMarker {
  const getMarkName = useCallback(
    (name: string) => (prefix ? `${prefix}:${name}` : name),
    [prefix]
  )

  const mark = useCallback(
    (name: string) => {
      performance.mark(getMarkName(name))
    },
    [getMarkName]
  )

  const measure = useCallback(
    (name: string, startMark: string, endMark?: string) => {
      const measureName = getMarkName(name)
      const start = getMarkName(startMark)
      const end = endMark ? getMarkName(endMark) : undefined

      try {
        if (end) {
          performance.measure(measureName, start, end)
        } else {
          performance.measure(measureName, start)
        }

        const entries = performance.getEntriesByName(measureName, 'measure')
        return entries.length > 0 ? entries[entries.length - 1].duration : 0
      } catch {
        return 0
      }
    },
    [getMarkName]
  )

  const clearMarks = useCallback(() => {
    if (prefix) {
      performance.getEntriesByType('mark').forEach((entry) => {
        if (entry.name.startsWith(prefix)) {
          performance.clearMarks(entry.name)
        }
      })
    } else {
      performance.clearMarks()
    }
  }, [prefix])

  const getMarks = useCallback(() => {
    const marks = performance.getEntriesByType('mark')
    return prefix ? marks.filter((m) => m.name.startsWith(prefix)) : marks
  }, [prefix])

  const getMeasures = useCallback(() => {
    const measures = performance.getEntriesByType('measure')
    return prefix ? measures.filter((m) => m.name.startsWith(prefix)) : measures
  }, [prefix])

  return { mark, measure, clearMarks, getMarks, getMeasures }
}

// ============================================
// Type Definitions
// ============================================

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number
  processingEnd: number
  cancelable: boolean
}

interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}
