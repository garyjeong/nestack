import { cn } from '@/shared/utils/cn'
import { Inbox, SearchX, AlertCircle, type LucideIcon } from 'lucide-react'
import { Button } from '../ui/Button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
        <Icon className="h-8 w-8 text-stone-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-stone-900">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-stone-500">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

// Pre-built empty states
export function NoDataEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Inbox}
      title="데이터가 없습니다"
      description="아직 등록된 데이터가 없어요."
      actionLabel={onAction ? '추가하기' : undefined}
      onAction={onAction}
    />
  )
}

export function NoSearchResultsEmpty() {
  return (
    <EmptyState
      icon={SearchX}
      title="검색 결과가 없습니다"
      description="다른 검색어로 다시 시도해 보세요."
    />
  )
}

export function ErrorEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="오류가 발생했습니다"
      description="잠시 후 다시 시도해 주세요."
      actionLabel={onRetry ? '다시 시도' : undefined}
      onAction={onRetry}
    />
  )
}
