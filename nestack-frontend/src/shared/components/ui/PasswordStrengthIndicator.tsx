import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
  showRequirements?: boolean
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  { label: '8자 이상', test: (p) => p.length >= 8 },
  { label: '대문자 포함', test: (p) => /[A-Z]/.test(p) },
  { label: '소문자 포함', test: (p) => /[a-z]/.test(p) },
  { label: '숫자 포함', test: (p) => /[0-9]/.test(p) },
  { label: '특수문자 포함', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export function PasswordStrengthIndicator({
  password,
  className,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const { strength, metRequirements: _metRequirements } = useMemo(() => {
    const met = requirements.filter((req) => req.test(password))
    return {
      strength: Math.round((met.length / requirements.length) * 100),
      metRequirements: met.length,
    }
  }, [password])

  const strengthLevel = useMemo(() => {
    if (strength === 0) return { label: '', color: 'bg-stone-200 dark:bg-stone-700' }
    if (strength <= 20) return { label: '매우 약함', color: 'bg-red-500' }
    if (strength <= 40) return { label: '약함', color: 'bg-orange-500' }
    if (strength <= 60) return { label: '보통', color: 'bg-amber-500' }
    if (strength <= 80) return { label: '강함', color: 'bg-green-500' }
    return { label: '매우 강함', color: 'bg-emerald-500' }
  }, [strength])

  if (!password) return null

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500 dark:text-stone-400">비밀번호 강도</span>
          <span
            className={cn(
              'font-medium',
              strength <= 40 && 'text-red-500',
              strength > 40 && strength <= 60 && 'text-amber-500',
              strength > 60 && 'text-green-500'
            )}
          >
            {strengthLevel.label}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
          <motion.div
            className={cn('h-full rounded-full', strengthLevel.color)}
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="grid grid-cols-2 gap-2">
          {requirements.map((req) => {
            const isMet = req.test(password)
            return (
              <motion.div
                key={req.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'flex items-center gap-2 text-xs transition-colors',
                  isMet
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-stone-400 dark:text-stone-500'
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isMet ? [1, 1.2, 1] : 1,
                    backgroundColor: isMet ? '#22c55e' : 'transparent',
                  }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border transition-colors',
                    isMet
                      ? 'border-green-500 bg-green-500'
                      : 'border-stone-300 dark:border-stone-600'
                  )}
                >
                  {isMet ? (
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  ) : (
                    <X className="h-2.5 w-2.5 text-stone-400" strokeWidth={3} />
                  )}
                </motion.div>
                <span>{req.label}</span>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Hook for password validation
export function usePasswordStrength(password: string) {
  return useMemo(() => {
    const metRequirements = requirements.filter((req) => req.test(password))
    const strength = Math.round((metRequirements.length / requirements.length) * 100)

    return {
      strength,
      metCount: metRequirements.length,
      totalCount: requirements.length,
      isValid: metRequirements.length === requirements.length,
      requirements: requirements.map((req) => ({
        ...req,
        isMet: req.test(password),
      })),
    }
  }, [password])
}
