import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

// ============================================
// Select Option Type
// ============================================

export interface SelectOption<T = string> {
  value: T
  label: string
  description?: string
  icon?: ReactNode
  disabled?: boolean
}

// ============================================
// Select Component
// ============================================

interface SelectProps<T = string> {
  /** Available options */
  options: SelectOption<T>[]
  /** Selected value */
  value?: T
  /** Callback when selection changes */
  onChange?: (value: T) => void
  /** Placeholder text */
  placeholder?: string
  /** Label */
  label?: string
  /** Error message */
  error?: string
  /** Disabled state */
  disabled?: boolean
  /** Enable search/filter */
  searchable?: boolean
  /** Search placeholder */
  searchPlaceholder?: string
  /** Allow clearing selection */
  clearable?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Full width */
  fullWidth?: boolean
  className?: string
}

export function Select<T = string>({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  label,
  error,
  disabled,
  searchable,
  searchPlaceholder = '검색...',
  clearable,
  size = 'md',
  fullWidth,
  className,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(search.toLowerCase()) ||
          opt.description?.toLowerCase().includes(search.toLowerCase())
      )
    : options

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, searchable])

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return
    onChange?.(option.value)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined as unknown as T)
  }

  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg',
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative', fullWidth && 'w-full', className)}
    >
      {/* Label */}
      {label && (
        <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border px-4 transition-colors',
          'bg-white dark:bg-stone-900 text-left',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          sizeClasses[size],
          error
            ? 'border-red-500'
            : isOpen
              ? 'border-primary-500 ring-1 ring-primary-500'
              : 'border-stone-300 dark:border-stone-600',
          disabled && 'cursor-not-allowed opacity-50 bg-stone-50 dark:bg-stone-800'
        )}
      >
        <span className={cn(
          'truncate',
          selectedOption
            ? 'text-stone-900 dark:text-stone-100'
            : 'text-stone-400 dark:text-stone-500'
        )}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>

        <div className="flex items-center gap-1">
          {clearable && selectedOption && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-1 hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              <X className="h-4 w-4 text-stone-400" />
            </button>
          )}
          <ChevronDown
            className={cn(
              'h-5 w-5 text-stone-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-1 w-full overflow-hidden rounded-xl border',
              'bg-white dark:bg-stone-800 shadow-lg dark:shadow-stone-900/50',
              'border-stone-200 dark:border-stone-700'
            )}
            role="listbox"
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-stone-100 dark:border-stone-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={cn(
                      'w-full rounded-lg border border-stone-200 dark:border-stone-600 py-2 pl-9 pr-3',
                      'bg-stone-50 dark:bg-stone-900 text-sm',
                      'focus:outline-none focus:border-primary-500'
                    )}
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-center text-sm text-stone-500">
                  검색 결과가 없습니다
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                    role="option"
                    aria-selected={option.value === value}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      option.value === value
                        ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-700',
                      option.disabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {option.icon && (
                      <span className="flex-shrink-0">{option.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {option.value === value && (
                      <Check className="h-4 w-4 flex-shrink-0 text-primary-500" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// Multi Select Component
// ============================================

interface MultiSelectProps<T = string> {
  options: SelectOption<T>[]
  value?: T[]
  onChange?: (value: T[]) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
  maxSelected?: number
  className?: string
}

export function MultiSelect<T = string>({
  options,
  value = [],
  onChange,
  placeholder = '선택하세요',
  label,
  error,
  disabled,
  searchable,
  maxSelected,
  className,
}: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOptions = options.filter((opt) => value.includes(opt.value))

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (option: SelectOption<T>) => {
    if (option.disabled) return

    const isSelected = value.includes(option.value)
    let newValue: T[]

    if (isSelected) {
      newValue = value.filter((v) => v !== option.value)
    } else {
      if (maxSelected && value.length >= maxSelected) return
      newValue = [...value, option.value]
    }

    onChange?.(newValue)
  }

  const handleRemove = (optionValue: T, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(value.filter((v) => v !== optionValue))
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex w-full min-h-[48px] items-center flex-wrap gap-1.5 rounded-xl border px-3 py-2',
          'bg-white dark:bg-stone-900 text-left',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          error ? 'border-red-500' : 'border-stone-300 dark:border-stone-600',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((opt) => (
            <span
              key={String(opt.value)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-100 dark:bg-primary-900 px-2 py-1 text-sm text-primary-700 dark:text-primary-300"
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => handleRemove(opt.value, e)}
                className="hover:text-primary-900 dark:hover:text-primary-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-stone-400">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            'ml-auto h-5 w-5 text-stone-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute z-50 mt-1 w-full overflow-hidden rounded-xl border',
              'bg-white dark:bg-stone-800 shadow-lg',
              'border-stone-200 dark:border-stone-700'
            )}
          >
            {searchable && (
              <div className="p-2 border-b border-stone-100 dark:border-stone-700">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="검색..."
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-600 py-2 px-3 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            )}

            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.map((option) => {
                const isSelected = value.includes(option.value)
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => handleToggle(option)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-700'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded border',
                        isSelected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-stone-300 dark:border-stone-600'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm text-stone-900 dark:text-stone-100">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
