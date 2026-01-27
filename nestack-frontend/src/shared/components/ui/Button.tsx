import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base styles - Toss style
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Primary - Gradient 옵션
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm hover:shadow-md',
        // Gradient - 토스 메인 버튼 스타일
        gradient: 'gradient-primary text-white shadow-md hover:shadow-lg focus-visible:ring-primary-500',
        // Secondary
        secondary: 'bg-stone-100 text-stone-700 hover:bg-stone-200 focus-visible:ring-stone-400',
        // Outline
        outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500',
        // Ghost
        ghost: 'text-stone-600 hover:bg-stone-100 focus-visible:ring-stone-400',
        // Danger
        danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-sm',
        // Soft - 배경이 연한 버튼
        soft: 'bg-primary-50 text-primary-600 hover:bg-primary-100 focus-visible:ring-primary-500',
        // Link
        link: 'text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500 p-0 h-auto',
        // Dark
        dark: 'bg-stone-900 text-white hover:bg-stone-800 focus-visible:ring-stone-500 shadow-sm',
      },
      size: {
        xs: 'h-9 min-h-[44px] px-3 text-xs rounded-lg',  // 최소 44px 터치 영역
        sm: 'h-11 px-4 text-sm rounded-xl',               // 44px
        md: 'h-12 px-5 text-base rounded-xl',             // 48px
        lg: 'h-14 px-6 text-lg rounded-2xl',              // 56px
        xl: 'h-16 px-8 text-lg rounded-2xl',              // 64px
        icon: 'h-11 w-11 rounded-xl',                     // 44px
        'icon-lg': 'h-12 w-12 rounded-xl',                // 48px
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, disabled, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, fullWidth, className })}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>로딩중...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
