import { TrendingUp, TrendingDown } from 'lucide-react'
import { ProgressBar } from '@/shared/components/ui/ProgressBar'

interface MissionProgressProps {
  currentAmount: number
  targetAmount: number
  progress: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function MissionProgress({
  currentAmount,
  targetAmount,
  progress,
  showDetails = true,
  size = 'md',
}: MissionProgressProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const remaining = targetAmount - currentAmount
  const isOverTarget = currentAmount >= targetAmount

  return (
    <div>
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-stone-900">
              {formatAmount(currentAmount)}원
            </span>
            {isOverTarget ? (
              <TrendingUp className="h-4 w-4 text-primary-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-stone-400" />
            )}
          </div>
          <span className="text-sm text-stone-500">
            / {formatAmount(targetAmount)}원
          </span>
        </div>
      )}

      <ProgressBar
        value={progress}
        size={size}
        variant={isOverTarget ? 'success' : 'primary'}
      />

      {showDetails && (
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={`font-medium ${isOverTarget ? 'text-primary-600' : 'text-stone-600'}`}>
            {progress}% 달성
          </span>
          {!isOverTarget && (
            <span className="text-stone-500">
              {formatAmount(remaining)}원 남음
            </span>
          )}
        </div>
      )}
    </div>
  )
}
