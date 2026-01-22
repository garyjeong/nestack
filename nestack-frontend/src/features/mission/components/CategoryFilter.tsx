import { useLifeCycleCategories } from '../hooks'
import { Skeleton } from '@/shared/components/feedback'

interface CategoryFilterProps {
  selectedId?: string
  onSelect: (id: string | undefined) => void
}

// Category icon mapping
const categoryIcons: Record<string, string> = {
  housing: '🏠',
  wedding: '💒',
  travel: '✈️',
  education: '📚',
  retirement: '🏖️',
  emergency: '🚨',
  investment: '📈',
  other: '📋',
}

export function CategoryFilter({ selectedId, onSelect }: CategoryFilterProps) {
  const { categories, isLoading } = useLifeCycleCategories()

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full shrink-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(undefined)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
          !selectedId
            ? 'bg-primary-500 text-white'
            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
        }`}
      >
        전체
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
            selectedId === category.id
              ? 'bg-primary-500 text-white'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span>{categoryIcons[category.icon] || '📋'}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  )
}
