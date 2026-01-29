import { useState, useEffect, useRef, type ImgHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageOff, User } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

// ============================================
// Optimized Image Component
// ============================================

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  /** Image source URL */
  src: string
  /** Alt text (required for accessibility) */
  alt: string
  /** Placeholder type */
  placeholder?: 'blur' | 'skeleton' | 'none'
  /** Low-quality image placeholder URL for blur effect */
  blurDataURL?: string
  /** Fallback image URL on error */
  fallbackSrc?: string
  /** Aspect ratio for the container */
  aspectRatio?: number | '1:1' | '4:3' | '16:9' | '21:9'
  /** Object fit */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
  /** Object position */
  objectPosition?: string
  /** Lazy load the image */
  lazy?: boolean
  /** Show loading animation */
  showLoading?: boolean
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /** Root margin for intersection observer */
  rootMargin?: string
  /** Called when image loads */
  onLoad?: () => void
  /** Called when image fails to load */
  onError?: () => void
  className?: string
  containerClassName?: string
}

export function OptimizedImage({
  src,
  alt,
  placeholder = 'skeleton',
  blurDataURL,
  fallbackSrc,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  lazy = true,
  showLoading = true,
  rounded = 'lg',
  rootMargin = '200px',
  onLoad,
  onError,
  className,
  containerClassName,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isInView, setIsInView] = useState(!lazy)
  const [currentSrc, setCurrentSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate aspect ratio value
  const ratioValue = aspectRatio
    ? typeof aspectRatio === 'number'
      ? aspectRatio
      : {
          '1:1': 1,
          '4:3': 4 / 3,
          '16:9': 16 / 9,
          '21:9': 21 / 9,
        }[aspectRatio]
    : undefined

  // Border radius classes
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, rootMargin])

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false)
    setIsError(false)
    setCurrentSrc(src)
  }, [src])

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Handle image error
  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    } else {
      setIsError(true)
    }
    onError?.()
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-stone-100 dark:bg-stone-800',
        roundedClasses[rounded],
        containerClassName
      )}
      style={ratioValue ? { paddingBottom: `${(1 / ratioValue) * 100}%` } : undefined}
    >
      {/* Blur Placeholder */}
      {placeholder === 'blur' && blurDataURL && !isLoaded && !isError && (
        <img
          src={blurDataURL}
          alt=""
          aria-hidden="true"
          className={cn(
            'absolute inset-0 h-full w-full object-cover blur-lg scale-110',
            roundedClasses[rounded]
          )}
        />
      )}

      {/* Skeleton Placeholder */}
      {placeholder === 'skeleton' && !isLoaded && !isError && showLoading && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Actual Image */}
      <AnimatePresence>
        {isInView && !isError && (
          <motion.img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            loading={lazy ? 'lazy' : undefined}
            onLoad={handleLoad}
            onError={handleError}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              ratioValue ? 'absolute inset-0' : '',
              'h-full w-full',
              roundedClasses[rounded],
              className
            )}
            style={{
              objectFit,
              objectPosition,
            }}
            {...props}
          />
        )}
      </AnimatePresence>

      {/* Error State */}
      {isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center',
            'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500'
          )}
        >
          <ImageOff className="h-8 w-8 mb-2" />
          <span className="text-xs">이미지를 불러올 수 없습니다</span>
        </motion.div>
      )}
    </div>
  )
}

// ============================================
// Avatar Image Component
// ============================================

interface AvatarImageProps {
  src?: string | null
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Fallback initials (first character) */
  fallbackInitial?: string
  /** Show online indicator */
  showOnline?: boolean
  /** Is user online */
  isOnline?: boolean
  className?: string
}

export function AvatarImage({
  src,
  alt,
  size = 'md',
  fallbackInitial,
  showOnline,
  isOnline,
  className,
}: AvatarImageProps) {
  const [isError, setIsError] = useState(false)

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
  }

  const onlineIndicatorSize = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
    '2xl': 'h-4 w-4',
  }

  const initial = fallbackInitial || alt.charAt(0).toUpperCase()

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700',
          'flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        {src && !isError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setIsError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-medium text-stone-500 dark:text-stone-400">
            {initial || <User className="h-1/2 w-1/2" />}
          </span>
        )}
      </div>

      {/* Online Indicator */}
      {showOnline && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-stone-900',
            onlineIndicatorSize[size],
            isOnline ? 'bg-green-500' : 'bg-stone-400'
          )}
        />
      )}
    </div>
  )
}

// ============================================
// Thumbnail Gallery
// ============================================

interface ThumbnailGalleryProps {
  images: { src: string; alt: string }[]
  /** Max images to show before "+N" */
  maxVisible?: number
  /** Size of thumbnails */
  size?: 'sm' | 'md' | 'lg'
  /** Gap between thumbnails */
  gap?: 'sm' | 'md'
  /** On click handler */
  onClick?: (index: number) => void
  className?: string
}

export function ThumbnailGallery({
  images,
  maxVisible = 4,
  size = 'md',
  gap = 'sm',
  onClick,
  className,
}: ThumbnailGalleryProps) {
  const visibleImages = images.slice(0, maxVisible)
  const remainingCount = images.length - maxVisible

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  }

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-2',
  }

  return (
    <div className={cn('flex', gapClasses[gap], className)}>
      {visibleImages.map((image, index) => (
        <button
          key={index}
          onClick={() => onClick?.(index)}
          className={cn(
            'relative overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            sizeClasses[size]
          )}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover"
          />
          {/* Show remaining count on last visible image */}
          {index === maxVisible - 1 && remainingCount > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-medium">
              +{remainingCount}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// ============================================
// Background Image Container
// ============================================

interface BackgroundImageProps {
  src: string
  alt?: string
  children?: React.ReactNode
  /** Overlay color/gradient */
  overlay?: 'none' | 'light' | 'dark' | 'gradient'
  /** Object fit */
  objectFit?: 'cover' | 'contain'
  /** Fixed background (parallax effect) */
  fixed?: boolean
  className?: string
}

export function BackgroundImage({
  src,
  alt = '',
  children,
  overlay = 'none',
  objectFit = 'cover',
  fixed,
  className,
}: BackgroundImageProps) {
  const overlayClasses = {
    none: '',
    light: 'bg-white/50',
    dark: 'bg-black/50',
    gradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background Image */}
      <img
        src={src}
        alt={alt}
        aria-hidden={!alt}
        className={cn(
          'absolute inset-0 h-full w-full',
          fixed ? 'fixed' : '',
          objectFit === 'cover' ? 'object-cover' : 'object-contain'
        )}
      />

      {/* Overlay */}
      {overlay !== 'none' && (
        <div className={cn('absolute inset-0', overlayClasses[overlay])} />
      )}

      {/* Content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}
