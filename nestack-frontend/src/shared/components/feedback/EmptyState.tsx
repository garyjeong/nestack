import { motion, type Variants } from 'framer-motion'
import { cn } from '@/shared/utils/cn'
import {
  Inbox,
  SearchX,
  AlertCircle,
  Target,
  Wallet,
  Users,
  Bell,
  type LucideIcon
} from 'lucide-react'
import { Button } from '../ui/Button'

// 애니메이션 variants
const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const iconVariants: Variants = {
  initial: { scale: 0, rotate: -10 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
}

const textVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

const buttonVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      delay: 0.3,
    },
  },
}

// 컨텍스트별 스타일 variants
type EmptyStateVariant = 'default' | 'mission' | 'finance' | 'family' | 'search' | 'error' | 'notification'

const variantStyles: Record<EmptyStateVariant, {
  bgGradient: string
  iconBg: string
  iconColor: string
  accentColor: string
}> = {
  default: {
    bgGradient: 'from-stone-50 to-stone-100/50',
    iconBg: 'bg-gradient-to-br from-stone-100 to-stone-200',
    iconColor: 'text-stone-400',
    accentColor: 'bg-stone-200',
  },
  mission: {
    bgGradient: 'from-primary-50/50 to-accent-50/30',
    iconBg: 'bg-gradient-to-br from-primary-100 to-accent-100',
    iconColor: 'text-primary-500',
    accentColor: 'bg-primary-200',
  },
  finance: {
    bgGradient: 'from-emerald-50/50 to-teal-50/30',
    iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    iconColor: 'text-emerald-500',
    accentColor: 'bg-emerald-200',
  },
  family: {
    bgGradient: 'from-violet-50/50 to-purple-50/30',
    iconBg: 'bg-gradient-to-br from-violet-100 to-purple-100',
    iconColor: 'text-violet-500',
    accentColor: 'bg-violet-200',
  },
  search: {
    bgGradient: 'from-amber-50/50 to-orange-50/30',
    iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
    iconColor: 'text-amber-500',
    accentColor: 'bg-amber-200',
  },
  error: {
    bgGradient: 'from-red-50/50 to-rose-50/30',
    iconBg: 'bg-gradient-to-br from-red-100 to-rose-100',
    iconColor: 'text-red-500',
    accentColor: 'bg-red-200',
  },
  notification: {
    bgGradient: 'from-blue-50/50 to-indigo-50/30',
    iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    iconColor: 'text-blue-500',
    accentColor: 'bg-blue-200',
  },
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
  variant?: EmptyStateVariant
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  variant = 'default',
  size = 'md',
  animated = true,
}: EmptyStateProps) {
  const styles = variantStyles[variant]

  const sizeStyles = {
    sm: {
      padding: 'py-8',
      iconWrapper: 'h-14 w-14',
      icon: 'h-6 w-6',
      title: 'text-base',
      description: 'text-xs',
      decorSize: { outer: 'w-20 h-20', inner: 'w-12 h-12' },
    },
    md: {
      padding: 'py-12',
      iconWrapper: 'h-20 w-20',
      icon: 'h-9 w-9',
      title: 'text-lg',
      description: 'text-sm',
      decorSize: { outer: 'w-28 h-28', inner: 'w-16 h-16' },
    },
    lg: {
      padding: 'py-16',
      iconWrapper: 'h-24 w-24',
      icon: 'h-11 w-11',
      title: 'text-xl',
      description: 'text-base',
      decorSize: { outer: 'w-36 h-36', inner: 'w-20 h-20' },
    },
  }

  const currentSize = sizeStyles[size]

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center text-center relative overflow-hidden rounded-2xl',
        `bg-gradient-to-br ${styles.bgGradient}`,
        currentSize.padding,
        className
      )}
      variants={containerVariants}
      initial={animated ? 'initial' : false}
      animate={animated ? 'animate' : false}
    >
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={cn(
          'absolute -top-6 -right-6 rounded-full opacity-30',
          styles.accentColor,
          currentSize.decorSize.outer
        )} />
        <div className={cn(
          'absolute -bottom-4 -left-4 rounded-full opacity-20',
          styles.accentColor,
          currentSize.decorSize.inner
        )} />
      </div>

      {/* 아이콘 영역 */}
      <motion.div
        className="relative z-10"
        variants={iconVariants}
      >
        <motion.div
          className={cn(
            'flex items-center justify-center rounded-3xl shadow-sm',
            styles.iconBg,
            currentSize.iconWrapper
          )}
          animate={animated ? {
            y: [0, -8, 0],
          } : undefined}
          transition={animated ? {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          } : undefined}
        >
          <Icon className={cn(currentSize.icon, styles.iconColor)} />
        </motion.div>
      </motion.div>

      {/* 텍스트 영역 */}
      <motion.div
        className="relative z-10 mt-5"
        variants={textVariants}
      >
        <h3 className={cn(
          'font-bold text-stone-900 mb-1.5',
          currentSize.title
        )}>
          {title}
        </h3>
        {description && (
          <p className={cn(
            'text-stone-500 max-w-xs mx-auto leading-relaxed',
            currentSize.description
          )}>
            {description}
          </p>
        )}
      </motion.div>

      {/* 액션 버튼 영역 */}
      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          className="relative z-10 mt-6 flex flex-col sm:flex-row gap-2"
          variants={buttonVariants}
        >
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              variant="primary"
              size={size === 'sm' ? 'sm' : 'md'}
              className="min-w-[120px]"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// Pre-built empty states with enhanced design

export function NoMissionsEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Target}
      title="아직 미션이 없어요"
      description="새로운 미션을 만들어 목표를 향해 나아가세요. 함께라면 더 쉽게 달성할 수 있어요!"
      actionLabel={onAction ? '새 미션 만들기' : undefined}
      onAction={onAction}
      variant="mission"
    />
  )
}

export function NoTransactionsEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Wallet}
      title="거래 내역이 없어요"
      description="계좌를 연결하면 거래 내역을 자동으로 불러올 수 있어요."
      actionLabel={onAction ? '계좌 연결하기' : undefined}
      onAction={onAction}
      variant="finance"
    />
  )
}

export function NoFamilyEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="아직 가족이 없어요"
      description="가족을 초대하거나 초대 코드로 참여해보세요. 함께하면 목표 달성이 더 즐거워요!"
      actionLabel={onAction ? '가족 초대하기' : undefined}
      onAction={onAction}
      variant="family"
    />
  )
}

export function NoSearchResultsEmpty({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={SearchX}
      title="검색 결과가 없어요"
      description="다른 검색어로 다시 시도해 보세요. 오타가 있는지도 확인해 주세요."
      actionLabel={onClear ? '검색 초기화' : undefined}
      onAction={onClear}
      variant="search"
    />
  )
}

export function ErrorEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="문제가 발생했어요"
      description="일시적인 오류예요. 잠시 후 다시 시도해 주세요."
      actionLabel={onRetry ? '다시 시도' : undefined}
      onAction={onRetry}
      variant="error"
    />
  )
}

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon={Bell}
      title="알림이 없어요"
      description="새로운 소식이 생기면 여기서 확인할 수 있어요."
      variant="notification"
    />
  )
}

// Legacy compatibility
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
