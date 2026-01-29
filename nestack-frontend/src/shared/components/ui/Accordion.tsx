import { useState, createContext, useContext, useId, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Minus } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

// ============================================
// Accordion Context
// ============================================

interface AccordionContextValue {
  expandedItems: string[]
  toggleItem: (value: string) => void
  variant: 'default' | 'bordered' | 'separated' | 'ghost'
  iconPosition: 'left' | 'right'
  iconType: 'chevron' | 'plus'
  baseId: string
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

function useAccordionContext() {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion provider')
  }
  return context
}

// ============================================
// Accordion Root Component
// ============================================

interface AccordionProps {
  /** Allow multiple items to be expanded */
  type?: 'single' | 'multiple'
  /** Default expanded items */
  defaultValue?: string | string[]
  /** Controlled expanded items */
  value?: string | string[]
  /** Callback when expanded items change */
  onChange?: (value: string | string[]) => void
  /** Collapsible (for single type) - can close all */
  collapsible?: boolean
  /** Visual variant */
  variant?: 'default' | 'bordered' | 'separated' | 'ghost'
  /** Icon position */
  iconPosition?: 'left' | 'right'
  /** Icon type */
  iconType?: 'chevron' | 'plus'
  /** Children */
  children: ReactNode
  className?: string
}

export function Accordion({
  type = 'single',
  defaultValue,
  value,
  onChange,
  collapsible = true,
  variant = 'default',
  iconPosition = 'right',
  iconType = 'chevron',
  children,
  className,
}: AccordionProps) {
  const [internalValue, setInternalValue] = useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
    }
    return []
  })

  const baseId = useId()

  const expandedItems = value !== undefined
    ? (Array.isArray(value) ? value : [value])
    : internalValue

  const toggleItem = (itemValue: string) => {
    let newValue: string[]

    if (type === 'single') {
      if (expandedItems.includes(itemValue)) {
        newValue = collapsible ? [] : expandedItems
      } else {
        newValue = [itemValue]
      }
    } else {
      if (expandedItems.includes(itemValue)) {
        newValue = expandedItems.filter((v) => v !== itemValue)
      } else {
        newValue = [...expandedItems, itemValue]
      }
    }

    setInternalValue(newValue)
    onChange?.(type === 'single' ? (newValue[0] || '') : newValue)
  }

  const variantClasses = {
    default: 'divide-y divide-stone-200 dark:divide-stone-700',
    bordered: 'border border-stone-200 dark:border-stone-700 rounded-xl divide-y divide-stone-200 dark:divide-stone-700',
    separated: 'space-y-2',
    ghost: '',
  }

  return (
    <AccordionContext.Provider
      value={{ expandedItems, toggleItem, variant, iconPosition, iconType, baseId }}
    >
      <div className={cn(variantClasses[variant], className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

// ============================================
// Accordion Item Component
// ============================================

interface AccordionItemContextValue {
  value: string
  isExpanded: boolean
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null)

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext)
  if (!context) {
    throw new Error('AccordionItem components must be used within an AccordionItem provider')
  }
  return context
}

interface AccordionItemProps {
  /** Unique value for this item */
  value: string
  /** Disabled state */
  disabled?: boolean
  /** Children */
  children: ReactNode
  className?: string
}

export function AccordionItem({
  value,
  disabled,
  children,
  className,
}: AccordionItemProps) {
  const { expandedItems, variant } = useAccordionContext()
  const isExpanded = expandedItems.includes(value)

  const variantClasses = {
    default: '',
    bordered: 'first:rounded-t-xl last:rounded-b-xl',
    separated: 'border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden',
    ghost: '',
  }

  return (
    <AccordionItemContext.Provider value={{ value, isExpanded }}>
      <div
        data-state={isExpanded ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
        className={cn(
          variantClasses[variant],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

// ============================================
// Accordion Trigger Component
// ============================================

interface AccordionTriggerProps {
  /** Trigger content */
  children: ReactNode
  /** Custom icon */
  icon?: ReactNode
  /** Subtitle/description */
  subtitle?: string
  className?: string
}

export function AccordionTrigger({
  children,
  icon,
  subtitle,
  className,
}: AccordionTriggerProps) {
  const { toggleItem, iconPosition, iconType, baseId } = useAccordionContext()
  const { value, isExpanded } = useAccordionItemContext()

  const handleClick = () => {
    toggleItem(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const renderIcon = () => {
    if (icon) return icon

    if (iconType === 'plus') {
      return isExpanded ? (
        <Minus className="h-5 w-5 text-stone-500 dark:text-stone-400" />
      ) : (
        <Plus className="h-5 w-5 text-stone-500 dark:text-stone-400" />
      )
    }

    return (
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="h-5 w-5 text-stone-500 dark:text-stone-400" />
      </motion.div>
    )
  }

  return (
    <button
      type="button"
      id={`${baseId}-trigger-${value}`}
      aria-expanded={isExpanded}
      aria-controls={`${baseId}-content-${value}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex w-full items-center gap-3 py-4 px-4 text-left transition-colors',
        'hover:bg-stone-50 dark:hover:bg-stone-800/50',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
        iconPosition === 'left' && 'flex-row-reverse justify-end',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-stone-900 dark:text-stone-100">
          {children}
        </div>
        {subtitle && (
          <div className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            {subtitle}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        {renderIcon()}
      </div>
    </button>
  )
}

// ============================================
// Accordion Content Component
// ============================================

interface AccordionContentProps {
  /** Content */
  children: ReactNode
  /** Force render even when collapsed */
  forceMount?: boolean
  className?: string
}

export function AccordionContent({
  children,
  forceMount,
  className,
}: AccordionContentProps) {
  const { baseId } = useAccordionContext()
  const { value, isExpanded } = useAccordionItemContext()

  if (!forceMount && !isExpanded) {
    return null
  }

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          id={`${baseId}-content-${value}`}
          role="region"
          aria-labelledby={`${baseId}-trigger-${value}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={cn('px-4 pb-4 text-stone-600 dark:text-stone-400', className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// Simple Accordion (All-in-one)
// ============================================

interface AccordionItemData {
  value: string
  title: string
  subtitle?: string
  content: ReactNode
  disabled?: boolean
  icon?: ReactNode
}

interface SimpleAccordionProps {
  /** Accordion items */
  items: AccordionItemData[]
  /** Single or multiple expansion */
  type?: 'single' | 'multiple'
  /** Default expanded items */
  defaultValue?: string | string[]
  /** Controlled value */
  value?: string | string[]
  /** On change callback */
  onChange?: (value: string | string[]) => void
  /** Collapsible */
  collapsible?: boolean
  /** Variant */
  variant?: 'default' | 'bordered' | 'separated' | 'ghost'
  /** Icon position */
  iconPosition?: 'left' | 'right'
  /** Icon type */
  iconType?: 'chevron' | 'plus'
  className?: string
}

export function SimpleAccordion({
  items,
  type = 'single',
  defaultValue,
  value,
  onChange,
  collapsible = true,
  variant = 'default',
  iconPosition = 'right',
  iconType = 'chevron',
  className,
}: SimpleAccordionProps) {
  return (
    <Accordion
      type={type}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      collapsible={collapsible}
      variant={variant}
      iconPosition={iconPosition}
      iconType={iconType}
      className={className}
    >
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value} disabled={item.disabled}>
          <AccordionTrigger subtitle={item.subtitle} icon={item.icon}>
            {item.title}
          </AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// ============================================
// FAQ Accordion (Styled for FAQ sections)
// ============================================

interface FAQItem {
  question: string
  answer: ReactNode
}

interface FAQAccordionProps {
  /** FAQ items */
  items: FAQItem[]
  /** Title */
  title?: string
  /** Allow multiple open */
  allowMultiple?: boolean
  className?: string
}

export function FAQAccordion({
  items,
  title,
  allowMultiple = false,
  className,
}: FAQAccordionProps) {
  const accordionItems: AccordionItemData[] = items.map((item, index) => ({
    value: `faq-${index}`,
    title: item.question,
    content: item.answer,
  }))

  return (
    <div className={className}>
      {title && (
        <h2 className="mb-6 text-2xl font-bold text-stone-900 dark:text-stone-100">
          {title}
        </h2>
      )}
      <SimpleAccordion
        items={accordionItems}
        type={allowMultiple ? 'multiple' : 'single'}
        variant="separated"
        iconType="plus"
      />
    </div>
  )
}

// ============================================
// Expandable Card (Single accordion item styled as card)
// ============================================

interface ExpandableCardProps {
  /** Card title */
  title: string
  /** Subtitle */
  subtitle?: string
  /** Preview content (shown when collapsed) */
  preview?: ReactNode
  /** Full content (shown when expanded) */
  children: ReactNode
  /** Default expanded */
  defaultExpanded?: boolean
  /** Header actions */
  actions?: ReactNode
  className?: string
}

export function ExpandableCard({
  title,
  subtitle,
  preview,
  children,
  defaultExpanded = false,
  actions,
  className,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div
      className={cn(
        'rounded-xl border border-stone-200 dark:border-stone-700',
        'bg-white dark:bg-stone-900 overflow-hidden',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-start gap-4 p-4 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              {title}
            </h3>
            {actions && (
              <div onClick={(e) => e.stopPropagation()}>
                {actions}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {subtitle}
            </p>
          )}
          {!isExpanded && preview && (
            <div className="mt-2 text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
              {preview}
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown className="h-5 w-5 text-stone-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-stone-100 dark:border-stone-800">
              <div className="pt-4 text-stone-600 dark:text-stone-400">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
