// Media Query Hooks
export {
  useMediaQuery,
  useBreakpoint,
  useOrientation,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  useIsTouchDevice,
  useWindowSize,
} from './useMediaQuery'

// Memoization Hooks
export {
  useDeepMemo,
  useDeepCallback,
  usePrevious,
  useStableCallback,
  useMemoCompare,
  useMemoizedSelector,
  useLazyInit,
  useComputed,
  deepEqual,
  memoize,
  shallowEqual,
} from './useMemoization'

// Debounce & Throttle Hooks
export {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useDebouncedState,
  useSearch,
  useScroll,
  useResize,
  useRAFCallback,
  useIdleCallback,
} from './useDebounceThrottle'

// Performance Monitoring Hooks
export {
  useRenderCount,
  useWhyDidYouRender,
  useFPS,
  usePerformanceObserver,
  useWebVitals,
  useMemoryMonitor,
  useLongTaskMonitor,
  useProfilerCallback,
  usePerformanceDashboard,
  usePerformanceMarker,
} from './usePerformance'
