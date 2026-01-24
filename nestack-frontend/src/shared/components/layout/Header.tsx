import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X, MoreVertical } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { ReactNode } from 'react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showClose?: boolean
  onBack?: () => void
  onClose?: () => void
  rightElement?: ReactNode
  transparent?: boolean
  className?: string
}

export function Header({
  title,
  showBack = false,
  showClose = false,
  onBack,
  onClose,
  rightElement,
  transparent = false,
  className,
}: HeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 px-4 py-4',
        transparent ? 'bg-transparent' : 'bg-white shadow-sm',
        className
      )}
    >
      <div className="mx-auto flex max-w-full items-center justify-between sm:max-w-xl md:max-w-3xl lg:max-w-4xl">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={handleBack}
              className="rounded-lg p-1 text-stone-600 transition-colors hover:bg-stone-100"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}
          {showClose && (
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-stone-600 transition-colors hover:bg-stone-100"
            >
              <X className="h-6 w-6" />
            </button>
          )}
          {title && (
            <h1 className="text-xl font-bold text-stone-900">{title}</h1>
          )}
        </div>

        {/* Right Side */}
        {rightElement && <div>{rightElement}</div>}
      </div>
    </header>
  )
}

// Page Header with title and optional subtitle
interface PageHeaderProps {
  title: string
  subtitle?: string
  rightElement?: ReactNode
}

export function PageHeader({ title, subtitle, rightElement }: PageHeaderProps) {
  return (
    <header className="bg-white px-4 py-4 shadow-sm">
      <div className="mx-auto flex max-w-full items-center justify-between sm:max-w-xl md:max-w-3xl lg:max-w-4xl">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>
          )}
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </header>
  )
}

// Detail Header for detail pages with back button
interface DetailHeaderProps {
  title: string
  showMenu?: boolean
  onMenuClick?: () => void
}

export function DetailHeader({ title, showMenu, onMenuClick }: DetailHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="bg-white px-4 py-4 shadow-sm">
      <div className="mx-auto flex max-w-full items-center justify-between sm:max-w-xl md:max-w-3xl lg:max-w-4xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1 text-stone-600 transition-colors hover:bg-stone-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-stone-900">{title}</h1>
        </div>
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="rounded-lg p-1 text-stone-600 transition-colors hover:bg-stone-100"
          >
            <MoreVertical className="h-6 w-6" />
          </button>
        )}
      </div>
    </header>
  )
}
