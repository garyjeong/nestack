import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const chipVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-200 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
        primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
        outline: 'border border-stone-200 text-stone-600 hover:bg-stone-50',
        selected: 'bg-primary-500 text-white shadow-sm',
        selectedSoft: 'bg-primary-100 text-primary-700 ring-1 ring-primary-200',
        ghost: 'text-stone-600 hover:bg-stone-100',
      },
      size: {
        sm: 'h-9 min-h-[36px] px-3 text-xs rounded-lg',   // 36px (밀집 레이아웃용)
        md: 'h-10 min-h-[40px] px-3.5 text-sm rounded-xl', // 40px
        lg: 'h-11 min-h-[44px] px-4 text-sm rounded-xl',   // 44px (권장)
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ChipProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  icon?: React.ReactNode
  onRemove?: () => void
  selected?: boolean
}

const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, size, icon, onRemove, selected, children, ...props }, ref) => {
    // 자동 variant 결정 (selected prop 기반)
    const actualVariant = selected ? 'selected' : variant

    return (
      <button
        ref={ref}
        className={cn(chipVariants({ variant: actualVariant, size }), className)}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
        {onRemove && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                onRemove()
              }
            }}
            className="flex-shrink-0 -mr-1 ml-0.5 rounded-full p-0.5 hover:bg-black/10"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>
    )
  }
)
Chip.displayName = 'Chip'

// Chip 그룹 (수평 스크롤 지원)
interface ChipGroupProps {
  children: React.ReactNode
  scrollable?: boolean
  className?: string
}

function ChipGroup({ children, scrollable = true, className }: ChipGroupProps) {
  return (
    <div
      className={cn(
        'flex gap-2',
        scrollable && 'overflow-x-auto scrollbar-hide -mx-4 px-4',
        className
      )}
    >
      {children}
    </div>
  )
}

// 선택형 Chip 그룹
interface SelectableChipGroupProps<T extends string | number> {
  options: Array<{
    value: T
    label: string
    icon?: React.ReactNode
  }>
  value: T | T[]
  onChange: (value: T | T[]) => void
  multiple?: boolean
  scrollable?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function SelectableChipGroup<T extends string | number>({
  options,
  value,
  onChange,
  multiple = false,
  scrollable = true,
  size = 'md',
  className,
}: SelectableChipGroupProps<T>) {
  const isSelected = (optionValue: T) => {
    if (Array.isArray(value)) {
      return value.includes(optionValue)
    }
    return value === optionValue
  }

  const handleSelect = (optionValue: T) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [value]
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue) as T[])
      } else {
        onChange([...currentValues, optionValue] as T[])
      }
    } else {
      onChange(optionValue)
    }
  }

  return (
    <ChipGroup scrollable={scrollable} className={className}>
      {options.map((option) => (
        <Chip
          key={option.value}
          icon={option.icon}
          size={size}
          selected={isSelected(option.value)}
          onClick={() => handleSelect(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </ChipGroup>
  )
}

export { Chip, ChipGroup, SelectableChipGroup, chipVariants }
