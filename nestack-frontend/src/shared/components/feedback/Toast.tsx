import { Toaster as SonnerToaster, toast } from 'sonner'

// Toast provider component - add this to your app root
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        className: 'font-sans',
        style: {
          padding: '16px',
          borderRadius: '12px',
        },
      }}
      richColors
      closeButton
    />
  )
}

// Toast utility functions
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description })
  },
  error: (message: string, description?: string) => {
    toast.error(message, { description })
  },
  info: (message: string, description?: string) => {
    toast.info(message, { description })
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, { description })
  },
  loading: (message: string) => {
    return toast.loading(message)
  },
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  },
}

export { toast }
