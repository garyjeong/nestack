import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label */
  label?: string
  /** Error message */
  error?: string
  /** Success message (shown when valid) */
  success?: string
  /** Hint text shown below the input */
  hint?: string
  /** Helper text shown in a tooltip */
  helperText?: string
  /** Show validation status icon */
  showStatusIcon?: boolean
  /** Field state */
  state?: 'default' | 'error' | 'success' | 'warning'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Left addon (icon or text) */
  leftAddon?: ReactNode
  /** Right addon (icon or text) */
  rightAddon?: ReactNode
  /** Whether the field is required */
  required?: boolean
  /** Character count (for showing remaining characters) */
  maxLength?: number
  /** Current character count */
  charCount?: number
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      className,
      label,
      error,
      success,
      hint,
      helperText,
      showStatusIcon = true,
      state: propState,
      size = 'md',
      leftAddon,
      rightAddon,
      required,
      maxLength,
      charCount,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    // Determine state from props or error/success
    const state = propState || (error ? 'error' : success ? 'success' : 'default')

    const sizeClasses = {
      sm: 'h-10 text-sm px-3',
      md: 'h-12 text-base px-4',
      lg: 'h-14 text-lg px-5',
    }

    const stateClasses = {
      default: 'border-stone-300 dark:border-stone-600 focus:border-primary-500 focus:ring-primary-500',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      warning: 'border-amber-500 focus:border-amber-500 focus:ring-amber-500',
    }

    const StateIcon = {
      default: null,
      error: AlertCircle,
      success: Check,
      warning: Info,
    }[state]

    const stateIconColor = {
      default: '',
      error: 'text-red-500',
      success: 'text-green-500',
      warning: 'text-amber-500',
    }

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 flex items-center gap-1 text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {label}
            {required && <span className="text-red-500">*</span>}
            {helperText && (
              <span className="group relative ml-1 cursor-help">
                <Info className="h-4 w-4 text-stone-400" />
                <span className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-stone-900 p-2 text-xs text-white shadow-lg group-hover:block dark:bg-stone-700">
                  {helperText}
                </span>
              </span>
            )}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left addon */}
          {leftAddon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
              {leftAddon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'block w-full rounded-xl border bg-white text-stone-900 transition-colors dark:bg-stone-900 dark:text-stone-100',
              'placeholder:text-stone-400 dark:placeholder:text-stone-500',
              'focus:outline-none focus:ring-1',
              sizeClasses[size],
              stateClasses[state],
              leftAddon && 'pl-10',
              (rightAddon || (showStatusIcon && StateIcon)) && 'pr-10',
              disabled && 'cursor-not-allowed bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-400',
              className
            )}
            {...props}
          />

          {/* Right addon or status icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {rightAddon}
            {showStatusIcon && StateIcon && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={stateIconColor[state]}
              >
                <StateIcon className="h-5 w-5" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="mt-1.5 flex items-start justify-between gap-2">
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-sm text-red-500 dark:text-red-400"
              >
                {error}
              </motion.p>
            )}
            {success && !error && (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-sm text-green-600 dark:text-green-400"
              >
                {success}
              </motion.p>
            )}
            {hint && !error && !success && (
              <motion.p
                key="hint"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-sm text-stone-500 dark:text-stone-400"
              >
                {hint}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Character count */}
          {maxLength && charCount !== undefined && (
            <span
              className={cn(
                'text-xs tabular-nums',
                charCount > maxLength
                  ? 'text-red-500'
                  : charCount > maxLength * 0.9
                    ? 'text-amber-500'
                    : 'text-stone-400'
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export { FormField }

// Validation helpers
export const validators = {
  required: (value: string) => (value.trim() ? null : '필수 입력 항목입니다.'),
  email: (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : '올바른 이메일 형식이 아닙니다.',
  minLength: (min: number) => (value: string) =>
    value.length >= min ? null : `최소 ${min}자 이상 입력해주세요.`,
  maxLength: (max: number) => (value: string) =>
    value.length <= max ? null : `최대 ${max}자까지 입력 가능합니다.`,
  pattern: (regex: RegExp, message: string) => (value: string) =>
    regex.test(value) ? null : message,
  password: (value: string) => {
    if (value.length < 8) return '최소 8자 이상 입력해주세요.'
    if (!/[A-Z]/.test(value)) return '대문자를 포함해주세요.'
    if (!/[a-z]/.test(value)) return '소문자를 포함해주세요.'
    if (!/[0-9]/.test(value)) return '숫자를 포함해주세요.'
    if (!/[!@#$%^&*]/.test(value)) return '특수문자(!@#$%^&*)를 포함해주세요.'
    return null
  },
  phone: (value: string) =>
    /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(value.replace(/-/g, ''))
      ? null
      : '올바른 전화번호 형식이 아닙니다.',
  match: (otherValue: string, fieldName: string) => (value: string) =>
    value === otherValue ? null : `${fieldName}과(와) 일치하지 않습니다.`,
}

// Compose multiple validators
export function composeValidators(
  ...validators: ((value: string) => string | null)[]
) {
  return (value: string): string | null => {
    for (const validator of validators) {
      const error = validator(value)
      if (error) return error
    }
    return null
  }
}
