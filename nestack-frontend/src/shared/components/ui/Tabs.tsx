import { useState, createContext, useContext, useId, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/utils/cn'

// ============================================
// Tabs Context
// ============================================

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
  variant: 'line' | 'pills' | 'enclosed' | 'soft'
  orientation: 'horizontal' | 'vertical'
  size: 'sm' | 'md' | 'lg'
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

// ============================================
// Tabs Root Component
// ============================================

interface TabsProps {
  /** Default active tab value */
  defaultValue?: string
  /** Controlled active tab value */
  value?: string
  /** Callback when tab changes */
  onChange?: (value: string) => void
  /** Visual variant */
  variant?: 'line' | 'pills' | 'enclosed' | 'soft'
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Size */
  size?: 'sm' | 'md' | 'lg'
  /** Children */
  children: ReactNode
  className?: string
}

export function Tabs({
  defaultValue = '',
  value,
  onChange,
  variant = 'line',
  orientation = 'horizontal',
  size = 'md',
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const baseId = useId()

  const activeTab = value !== undefined ? value : internalValue

  const setActiveTab = (newValue: string) => {
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab, variant, orientation, size, baseId }}
    >
      <div
        className={cn(
          orientation === 'vertical' && 'flex gap-4',
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// ============================================
// Tab List Component
// ============================================

interface TabListProps {
  children: ReactNode
  className?: string
  /** Full width tabs (horizontal only) */
  fullWidth?: boolean
}

export function TabList({ children, className, fullWidth }: TabListProps) {
  const { variant, orientation, size } = useTabsContext()

  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-2',
    lg: 'text-lg gap-3',
  }

  const variantClasses = {
    line: cn(
      orientation === 'horizontal'
        ? 'border-b border-stone-200 dark:border-stone-700'
        : 'border-r border-stone-200 dark:border-stone-700 pr-4'
    ),
    pills: 'bg-stone-100 dark:bg-stone-800 rounded-xl p-1',
    enclosed: cn(
      orientation === 'horizontal'
        ? 'border-b border-stone-200 dark:border-stone-700'
        : 'border-r border-stone-200 dark:border-stone-700'
    ),
    soft: 'gap-2',
  }

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        fullWidth && orientation === 'horizontal' && 'w-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================
// Tab Trigger Component
// ============================================

interface TabTriggerProps {
  /** Unique value for this tab */
  value: string
  /** Tab label */
  children: ReactNode
  /** Disabled state */
  disabled?: boolean
  /** Icon */
  icon?: ReactNode
  /** Badge/count */
  badge?: ReactNode
  className?: string
}

export function TabTrigger({
  value,
  children,
  disabled,
  icon,
  badge,
  className,
}: TabTriggerProps) {
  const { activeTab, setActiveTab, variant, orientation, size, baseId } = useTabsContext()
  const isActive = activeTab === value

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'line':
        return cn(
          'relative transition-colors font-medium',
          orientation === 'horizontal' ? '-mb-px' : '-mr-px',
          isActive
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )
      case 'pills':
        return cn(
          'relative rounded-lg font-medium transition-colors',
          isActive
            ? 'text-stone-900 dark:text-stone-100'
            : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )
      case 'enclosed':
        return cn(
          'relative font-medium transition-colors border',
          orientation === 'horizontal'
            ? 'rounded-t-lg -mb-px'
            : 'rounded-l-lg -mr-px',
          isActive
            ? cn(
                'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100',
                orientation === 'horizontal'
                  ? 'border-stone-200 dark:border-stone-700 border-b-white dark:border-b-stone-900'
                  : 'border-stone-200 dark:border-stone-700 border-r-white dark:border-r-stone-900'
              )
            : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )
      case 'soft':
        return cn(
          'rounded-lg font-medium transition-colors',
          isActive
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
            : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )
      default:
        return ''
    }
  }

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      aria-disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-2 whitespace-nowrap',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        sizeClasses[size],
        getVariantClasses(),
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {badge && <span className="flex-shrink-0">{badge}</span>}

      {/* Line indicator */}
      {variant === 'line' && isActive && (
        <motion.div
          layoutId={`${baseId}-line-indicator`}
          className={cn(
            'absolute bg-primary-500',
            orientation === 'horizontal'
              ? 'bottom-0 left-0 right-0 h-0.5'
              : 'top-0 bottom-0 right-0 w-0.5'
          )}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      {/* Pills indicator */}
      {variant === 'pills' && isActive && (
        <motion.div
          layoutId={`${baseId}-pills-indicator`}
          className="absolute inset-0 bg-white dark:bg-stone-700 rounded-lg shadow-sm -z-10"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  )
}

// ============================================
// Tab Content Component
// ============================================

interface TabContentProps {
  /** Value matching TabTrigger */
  value: string
  /** Content */
  children: ReactNode
  /** Force render even when not active */
  forceMount?: boolean
  className?: string
}

export function TabContent({
  value,
  children,
  forceMount,
  className,
}: TabContentProps) {
  const { activeTab, baseId } = useTabsContext()
  const isActive = activeTab === value

  if (!forceMount && !isActive) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={value}
          role="tabpanel"
          id={`${baseId}-panel-${value}`}
          aria-labelledby={`${baseId}-tab-${value}`}
          tabIndex={0}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn('focus:outline-none', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// Simple Tabs Component (All-in-one)
// ============================================

interface TabItem {
  value: string
  label: string
  icon?: ReactNode
  badge?: ReactNode
  disabled?: boolean
  content: ReactNode
}

interface SimpleTabsProps {
  /** Tab items */
  items: TabItem[]
  /** Default active tab */
  defaultValue?: string
  /** Controlled value */
  value?: string
  /** On change callback */
  onChange?: (value: string) => void
  /** Variant */
  variant?: 'line' | 'pills' | 'enclosed' | 'soft'
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Size */
  size?: 'sm' | 'md' | 'lg'
  /** Full width tabs */
  fullWidth?: boolean
  /** Tab list class */
  tabListClassName?: string
  /** Content class */
  contentClassName?: string
  className?: string
}

export function SimpleTabs({
  items,
  defaultValue,
  value,
  onChange,
  variant = 'line',
  orientation = 'horizontal',
  size = 'md',
  fullWidth,
  tabListClassName,
  contentClassName,
  className,
}: SimpleTabsProps) {
  const initialValue = defaultValue || items[0]?.value || ''

  return (
    <Tabs
      defaultValue={initialValue}
      value={value}
      onChange={onChange}
      variant={variant}
      orientation={orientation}
      size={size}
      className={className}
    >
      <TabList fullWidth={fullWidth} className={tabListClassName}>
        {items.map((item) => (
          <TabTrigger
            key={item.value}
            value={item.value}
            icon={item.icon}
            badge={item.badge}
            disabled={item.disabled}
          >
            {item.label}
          </TabTrigger>
        ))}
      </TabList>

      <div className={cn('mt-4', contentClassName)}>
        {items.map((item) => (
          <TabContent key={item.value} value={item.value}>
            {item.content}
          </TabContent>
        ))}
      </div>
    </Tabs>
  )
}

// ============================================
// Scrollable Tabs (for many tabs)
// ============================================

interface ScrollableTabsProps {
  items: TabItem[]
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  variant?: 'line' | 'pills' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ScrollableTabs({
  items,
  defaultValue,
  value,
  onChange,
  variant = 'line',
  size = 'md',
  className,
}: ScrollableTabsProps) {
  const initialValue = defaultValue || items[0]?.value || ''

  return (
    <Tabs
      defaultValue={initialValue}
      value={value}
      onChange={onChange}
      variant={variant}
      size={size}
      className={className}
    >
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide">
          <TabList className="min-w-max">
            {items.map((item) => (
              <TabTrigger
                key={item.value}
                value={item.value}
                icon={item.icon}
                badge={item.badge}
                disabled={item.disabled}
              >
                {item.label}
              </TabTrigger>
            ))}
          </TabList>
        </div>
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-stone-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-stone-900 to-transparent pointer-events-none" />
      </div>

      <div className="mt-4">
        {items.map((item) => (
          <TabContent key={item.value} value={item.value}>
            {item.content}
          </TabContent>
        ))}
      </div>
    </Tabs>
  )
}
