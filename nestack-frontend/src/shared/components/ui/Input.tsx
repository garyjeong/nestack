import { forwardRef, type InputHTMLAttributes, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { Eye, EyeOff } from 'lucide-react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const errorId = error ? `${inputId}-error` : undefined
    const hintId = hint && !error ? `${inputId}-hint` : undefined
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

    const isPasswordType = type === 'password'
    const inputType = isPasswordType && showPassword ? 'text' : type

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={inputType}
            id={inputId}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className={cn(
              'block w-full rounded-lg border px-4 py-3 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 transition-colors placeholder:text-stone-400 dark:placeholder:text-stone-500',
              'focus:outline-none focus:ring-1 focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-stone-900',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-stone-300 dark:border-stone-600 focus:border-primary-500 focus:ring-primary-500',
              isPasswordType && 'pr-12',
              props.disabled && 'cursor-not-allowed bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400',
              className
            )}
            ref={ref}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
