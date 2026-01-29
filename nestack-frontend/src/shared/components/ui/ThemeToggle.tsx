import { Moon, Sun, Monitor } from 'lucide-react'
import { useAppStore, type Theme } from '@/app/store'
import { cn } from '@/shared/utils/cn'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: '라이트', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: '다크', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: '시스템', icon: <Monitor className="h-4 w-4" /> },
]

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useAppStore()

  return (
    <div className={cn('flex items-center gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800', className)}>
      {themeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            theme === option.value
              ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100'
              : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
          )}
          title={option.label}
        >
          {option.icon}
          {showLabel && <span>{option.label}</span>}
        </button>
      ))}
    </div>
  )
}

// Simple toggle button (cycles through themes)
export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useAppStore()

  const currentIcon = themeOptions.find((o) => o.value === theme)?.icon
  const currentLabel = themeOptions.find((o) => o.value === theme)?.label

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center gap-2 rounded-xl p-3 text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800',
        className
      )}
      title={`현재: ${currentLabel}`}
    >
      {currentIcon}
    </button>
  )
}
