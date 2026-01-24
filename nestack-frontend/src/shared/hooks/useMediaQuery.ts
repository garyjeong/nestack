import { useState, useEffect } from 'react'

/**
 * Custom hook for media query detection
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Set initial value
    setMatches(media.matches)

    // Add listener
    media.addEventListener('change', listener)

    return () => {
      media.removeEventListener('change', listener)
    }
  }, [query])

  return matches
}

/**
 * Convenience hook for common breakpoints
 * Uses Tailwind CSS default breakpoints
 */
export function useBreakpoint() {
  const isSm = useMediaQuery('(min-width: 640px)')
  const isMd = useMediaQuery('(min-width: 768px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  const isXl = useMediaQuery('(min-width: 1280px)')

  return {
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
    isSm,
    isMd,
    isLg,
    isXl,
  }
}
