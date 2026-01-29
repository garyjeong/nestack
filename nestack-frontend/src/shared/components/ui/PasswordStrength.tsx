import { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'

interface PasswordRule {
  id: string
  label: string
  test: (password: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: '8자 이상 30자 이하',
    test: (pw) => pw.length >= 8 && pw.length <= 30,
  },
  {
    id: 'letter',
    label: '영문 포함',
    test: (pw) => /[a-zA-Z]/.test(pw),
  },
  {
    id: 'number',
    label: '숫자 포함',
    test: (pw) => /\d/.test(pw),
  },
  {
    id: 'special',
    label: '특수문자 포함 (@$!%*?&)',
    test: (pw) => /[@$!%*?&]/.test(pw),
  },
]

interface PasswordStrengthProps {
  password: string
  className?: string
  showWhenEmpty?: boolean
}

export function PasswordStrength({
  password,
  className,
  showWhenEmpty = false,
}: PasswordStrengthProps) {
  const results = useMemo(() => {
    return PASSWORD_RULES.map((rule) => ({
      ...rule,
      passed: rule.test(password),
    }))
  }, [password])

  const passedCount = results.filter((r) => r.passed).length
  const totalCount = results.length
  const strengthPercent = (passedCount / totalCount) * 100

  // 비밀번호가 비어있고 showWhenEmpty가 false면 표시하지 않음
  if (!password && !showWhenEmpty) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('space-y-3', className)}
    >
      {/* 강도 바 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">비밀번호 강도</span>
          <span
            className={cn(
              'font-medium',
              passedCount === 0 && 'text-stone-400',
              passedCount === 1 && 'text-red-500',
              passedCount === 2 && 'text-orange-500',
              passedCount === 3 && 'text-amber-500',
              passedCount === 4 && 'text-primary-500'
            )}
          >
            {passedCount === 0 && '입력 대기'}
            {passedCount === 1 && '매우 약함'}
            {passedCount === 2 && '약함'}
            {passedCount === 3 && '보통'}
            {passedCount === 4 && '강함'}
          </span>
        </div>
        <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full transition-colors duration-300',
              passedCount === 0 && 'bg-stone-300',
              passedCount === 1 && 'bg-red-500',
              passedCount === 2 && 'bg-orange-500',
              passedCount === 3 && 'bg-amber-500',
              passedCount === 4 && 'bg-primary-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${strengthPercent}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 규칙 체크리스트 */}
      <ul className="space-y-1">
        {results.map((rule, index) => (
          <motion.li
            key={rule.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={cn(
              'flex items-center gap-2 text-xs transition-colors duration-200',
              rule.passed ? 'text-primary-600' : 'text-stone-400'
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center w-4 h-4 rounded-full transition-all duration-200',
                rule.passed
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-stone-100 text-stone-400'
              )}
            >
              {rule.passed ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
            </span>
            <span>{rule.label}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

interface PasswordMatchProps {
  password: string
  confirmPassword: string
  className?: string
}

export function PasswordMatch({
  password,
  confirmPassword,
  className,
}: PasswordMatchProps) {
  // 확인 비밀번호가 비어있으면 표시하지 않음
  if (!confirmPassword) {
    return null
  }

  const isMatch = password === confirmPassword

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center gap-2 text-xs',
          isMatch ? 'text-primary-600' : 'text-red-500',
          className
        )}
      >
        <span
          className={cn(
            'flex items-center justify-center w-4 h-4 rounded-full',
            isMatch ? 'bg-primary-100 text-primary-600' : 'bg-red-100 text-red-500'
          )}
        >
          {isMatch ? (
            <Check className="w-3 h-3" />
          ) : (
            <X className="w-3 h-3" />
          )}
        </span>
        <span>{isMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}</span>
      </motion.div>
    </AnimatePresence>
  )
}
