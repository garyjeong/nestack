import { Fragment, type ReactNode, useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'
import { FocusTrap } from '@/shared/components/a11y'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  showCloseButton?: boolean
  /** ID for accessibility - auto-generated if not provided */
  id?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-[calc(100%-2rem)]',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  id,
}: ModalProps) {
  const generatedId = useId()
  const modalId = id || generatedId
  const titleId = `${modalId}-title`
  const descriptionId = `${modalId}-description`
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Store currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''

      // Return focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, onClose])

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
          >
            <FocusTrap active={isOpen} returnFocusRef={previousFocusRef}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative w-full rounded-2xl bg-white dark:bg-stone-800 shadow-xl',
                  sizeClasses[size]
                )}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-start justify-between border-b border-stone-100 dark:border-stone-700 p-6">
                    <div>
                      {title && (
                        <h2
                          id={titleId}
                          className="text-lg font-semibold text-stone-900 dark:text-stone-100"
                        >
                          {title}
                        </h2>
                      )}
                      {description && (
                        <p
                          id={descriptionId}
                          className="mt-1 text-sm text-stone-500 dark:text-stone-400"
                        >
                          {description}
                        </p>
                      )}
                    </div>
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        aria-label="모달 닫기"
                        className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      >
                        <X className="h-5 w-5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>
              </motion.div>
            </FocusTrap>
          </div>
        </Fragment>
      )}
    </AnimatePresence>,
    document.body
  )
}

// Confirm Modal
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'primary',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" description={message}>
      <p className="mb-6 text-stone-600 dark:text-stone-400">{message}</p>
      <div className="flex gap-3" role="group" aria-label="모달 액션">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-stone-300 dark:border-stone-600 py-3 font-medium text-stone-600 dark:text-stone-300 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          aria-busy={isLoading}
          className={cn(
            'flex-1 rounded-lg py-3 font-medium text-white transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            variant === 'danger'
              ? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-500'
              : 'bg-primary-500 hover:bg-primary-600 focus-visible:ring-primary-500'
          )}
        >
          {isLoading ? (
            <span aria-live="polite">처리중...</span>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  )
}
