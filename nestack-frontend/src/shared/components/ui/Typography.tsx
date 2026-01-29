import { cn } from '@/shared/utils/cn'
import type { ReactNode, ElementType } from 'react'

// 타이포그래피 variant 정의
type TypographyVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'label'
  | 'overline'

// 색상 variant 정의
type ColorVariant =
  | 'default'
  | 'primary'
  | 'accent'
  | 'muted'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'inherit'

// Variant별 기본 HTML 태그 매핑
const defaultTags: Record<TypographyVariant, ElementType> = {
  display: 'h1',
  headline: 'h2',
  title: 'h3',
  subtitle: 'h4',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  label: 'label',
  overline: 'span',
}

// Variant별 스타일 클래스
const variantStyles: Record<TypographyVariant, string> = {
  display: 'text-4xl font-bold tracking-tight',
  headline: 'text-2xl font-bold',
  title: 'text-xl font-bold',
  subtitle: 'text-lg font-semibold',
  body: 'text-base',
  'body-sm': 'text-sm',
  caption: 'text-xs',
  label: 'text-sm font-medium',
  overline: 'text-xs font-semibold uppercase tracking-wider',
}

// 색상 스타일 클래스
const colorStyles: Record<ColorVariant, string> = {
  default: 'text-stone-900',
  primary: 'text-primary-600',
  accent: 'text-accent-500',
  muted: 'text-stone-500',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  info: 'text-blue-600',
  inherit: 'text-inherit',
}

interface TypographyProps {
  variant?: TypographyVariant
  color?: ColorVariant
  as?: ElementType
  className?: string
  children: ReactNode
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right'
  truncate?: boolean
  lines?: number
}

export function Typography({
  variant = 'body',
  color = 'default',
  as,
  className,
  children,
  weight,
  align,
  truncate,
  lines,
}: TypographyProps) {
  const Component = as || defaultTags[variant]

  // weight override
  const weightClass = weight ? {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }[weight] : ''

  // alignment
  const alignClass = align ? {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align] : ''

  // truncation
  const truncateClass = truncate ? 'truncate' : ''
  const lineClampClass = lines ? `line-clamp-${lines}` : ''

  return (
    <Component
      className={cn(
        variantStyles[variant],
        colorStyles[color],
        weightClass,
        alignClass,
        truncateClass,
        lineClampClass,
        className
      )}
    >
      {children}
    </Component>
  )
}

// Convenience components for common use cases
export function Display({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="display" {...props}>{children}</Typography>
}

export function Headline({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="headline" {...props}>{children}</Typography>
}

export function Title({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="title" {...props}>{children}</Typography>
}

export function Subtitle({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="subtitle" {...props}>{children}</Typography>
}

export function Body({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body" {...props}>{children}</Typography>
}

export function BodySmall({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body-sm" {...props}>{children}</Typography>
}

export function Caption({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="caption" {...props}>{children}</Typography>
}

export function Label({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="label" {...props}>{children}</Typography>
}

export function Overline({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="overline" {...props}>{children}</Typography>
}
