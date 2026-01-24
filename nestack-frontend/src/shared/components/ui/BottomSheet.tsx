import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  showHandle?: boolean
  showCloseButton?: boolean
  className?: string
  contentClassName?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  showHandle = true,
  showCloseButton = true,
  className,
  contentClassName,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // 터치/드래그로 닫기
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`
    }
  }

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current
    if (sheetRef.current) {
      if (diff > 100) {
        onClose()
      } else {
        sheetRef.current.style.transform = 'translateY(0)'
      }
    }
    startY.current = 0
    currentY.current = 0
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-slide-up-sheet',
          'max-h-[90vh] flex flex-col',
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-stone-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-900">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-xl hover:bg-stone-100 transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn('flex-1 overflow-y-auto p-5', contentClassName)}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
