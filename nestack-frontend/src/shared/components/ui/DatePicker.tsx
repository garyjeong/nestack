import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

// ============================================
// Date Picker Component
// ============================================

interface DatePickerProps {
  /** Selected date */
  value?: Date | null
  /** Callback when date changes */
  onChange?: (date: Date | null) => void
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Placeholder text */
  placeholder?: string
  /** Label */
  label?: string
  /** Error message */
  error?: string
  /** Disabled state */
  disabled?: boolean
  /** Allow clearing selection */
  clearable?: boolean
  /** Date format for display */
  format?: 'short' | 'medium' | 'long'
  className?: string
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = '날짜 선택',
  label,
  error,
  disabled,
  clearable,
  format = 'medium',
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value || new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Format date for display
  const formatDate = (date: Date): string => {
    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
      short: { year: '2-digit', month: 'numeric', day: 'numeric' },
      medium: { year: 'numeric', month: 'long', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    }
    const options = formatOptions[format]

    return date.toLocaleDateString('ko-KR', options)
  }

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before the first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  // Check if date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  // Check if date is selected
  const isDateSelected = (date: Date): boolean => {
    if (!value) return false
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    )
  }

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  // Handle date selection
  const handleSelectDate = (date: Date) => {
    if (isDateDisabled(date)) return
    onChange?.(date)
    setIsOpen(false)
  }

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  const days = getDaysInMonth(viewDate)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
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
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-xl border px-4 transition-colors',
          'bg-white dark:bg-stone-900 text-left',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          error
            ? 'border-red-500'
            : isOpen
              ? 'border-primary-500 ring-1 ring-primary-500'
              : 'border-stone-300 dark:border-stone-600',
          disabled && 'cursor-not-allowed opacity-50 bg-stone-50 dark:bg-stone-800'
        )}
      >
        <span className={cn(
          value ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'
        )}>
          {value ? formatDate(value) : placeholder}
        </span>

        <div className="flex items-center gap-1">
          {clearable && value && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-1 hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              <X className="h-4 w-4 text-stone-400" />
            </button>
          )}
          <Calendar className="h-5 w-5 text-stone-400" />
        </div>
      </button>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-1 w-full overflow-hidden rounded-xl border p-4',
              'bg-white dark:bg-stone-800 shadow-lg dark:shadow-stone-900/50',
              'border-stone-200 dark:border-stone-700'
            )}
          >
            {/* Month Navigation */}
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              </button>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {viewDate.getFullYear()}년 {MONTHS[viewDate.getMonth()]}
              </span>
              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day, i) => (
                <div
                  key={day}
                  className={cn(
                    'text-center text-xs font-medium py-2',
                    i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-stone-500 dark:text-stone-400'
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <div key={index} className="aspect-square">
                  {date ? (
                    <button
                      type="button"
                      onClick={() => handleSelectDate(date)}
                      disabled={isDateDisabled(date)}
                      className={cn(
                        'flex h-full w-full items-center justify-center rounded-lg text-sm transition-colors',
                        isDateSelected(date)
                          ? 'bg-primary-500 text-white font-semibold'
                          : isToday(date)
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-semibold'
                            : 'hover:bg-stone-100 dark:hover:bg-stone-700',
                        isDateDisabled(date)
                          ? 'cursor-not-allowed opacity-30'
                          : 'cursor-pointer',
                        date.getDay() === 0 && !isDateSelected(date) && 'text-red-500',
                        date.getDay() === 6 && !isDateSelected(date) && 'text-blue-500'
                      )}
                    >
                      {date.getDate()}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex justify-center gap-2 border-t border-stone-100 dark:border-stone-700 pt-4">
              <button
                type="button"
                onClick={() => {
                  onChange?.(new Date())
                  setIsOpen(false)
                }}
                className="rounded-lg px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
              >
                오늘
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// Date Range Picker Component
// ============================================

interface DateRange {
  start: Date | null
  end: Date | null
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function DateRangePicker({
  value = { start: null, end: null },
  onChange,
  minDate: _minDate,
  maxDate: _maxDate,
  placeholder = '기간 선택',
  label,
  error,
  disabled,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value.start || new Date())
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const displayValue = value.start && value.end
    ? `${formatDate(value.start)} ~ ${formatDate(value.end)}`
    : value.start
      ? `${formatDate(value.start)} ~`
      : placeholder

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))

    return days
  }

  const isInRange = (date: Date): boolean => {
    if (!value.start || !value.end) return false
    return date >= value.start && date <= value.end
  }

  const isRangeStart = (date: Date): boolean => {
    if (!value.start) return false
    return date.getTime() === value.start.getTime()
  }

  const isRangeEnd = (date: Date): boolean => {
    if (!value.end) return false
    return date.getTime() === value.end.getTime()
  }

  const handleSelectDate = (date: Date) => {
    if (selecting === 'start') {
      onChange?.({ start: date, end: null })
      setSelecting('end')
    } else {
      if (value.start && date < value.start) {
        onChange?.({ start: date, end: value.start })
      } else {
        onChange?.({ ...value, end: date })
      }
      setSelecting('start')
      setIsOpen(false)
    }
  }

  const days = getDaysInMonth(viewDate)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-xl border px-4',
          'bg-white dark:bg-stone-900 text-left',
          error ? 'border-red-500' : 'border-stone-300 dark:border-stone-600',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span className={cn(
          value.start ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'
        )}>
          {displayValue}
        </span>
        <Calendar className="h-5 w-5 text-stone-400" />
      </button>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute z-50 mt-1 w-full overflow-hidden rounded-xl border p-4',
              'bg-white dark:bg-stone-800 shadow-lg',
              'border-stone-200 dark:border-stone-700'
            )}
          >
            {/* Selection indicator */}
            <div className="mb-3 text-center text-sm text-stone-500 dark:text-stone-400">
              {selecting === 'start' ? '시작일 선택' : '종료일 선택'}
            </div>

            {/* Month Navigation */}
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {viewDate.getFullYear()}년 {MONTHS[viewDate.getMonth()]}
              </span>
              <button
                type="button"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-stone-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <div key={index} className="aspect-square">
                  {date && (
                    <button
                      type="button"
                      onClick={() => handleSelectDate(date)}
                      className={cn(
                        'flex h-full w-full items-center justify-center text-sm transition-colors',
                        isRangeStart(date) && 'rounded-l-lg bg-primary-500 text-white',
                        isRangeEnd(date) && 'rounded-r-lg bg-primary-500 text-white',
                        isInRange(date) && !isRangeStart(date) && !isRangeEnd(date) && 'bg-primary-100 dark:bg-primary-900',
                        !isInRange(date) && !isRangeStart(date) && !isRangeEnd(date) && 'hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg'
                      )}
                    >
                      {date.getDate()}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
