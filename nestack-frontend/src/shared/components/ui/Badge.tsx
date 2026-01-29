import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-stone-100 text-stone-800',
        primary: 'bg-primary-100 text-primary-700',
        secondary: 'bg-stone-100 text-stone-600',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        accent: 'bg-accent-100 text-accent-700',
        info: 'bg-blue-100 text-blue-700',
        // Solid variants
        'primary-solid': 'bg-primary-500 text-white',
        'accent-solid': 'bg-accent-500 text-white',
        'success-solid': 'bg-emerald-500 text-white',
        'warning-solid': 'bg-amber-500 text-white',
        'danger-solid': 'bg-red-500 text-white',
        // Outline variants
        'primary-outline': 'border border-primary-300 text-primary-700 bg-transparent',
        'accent-outline': 'border border-accent-300 text-accent-700 bg-transparent',
        'default-outline': 'border border-stone-300 text-stone-700 bg-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
