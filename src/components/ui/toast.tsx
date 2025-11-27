import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }
  const Icon = icons[toast.type]

  const colors = {
    success: 'bg-[var(--color-success-muted)] border-[var(--color-success)] text-[var(--color-success)]',
    error: 'bg-[var(--color-error-muted)] border-[var(--color-error)] text-[var(--color-error)]',
    warning: 'bg-[var(--color-warning-muted)] border-[var(--color-warning)] text-[var(--color-warning)]',
    info: 'bg-[var(--color-info-muted)] border-[var(--color-info)] text-[var(--color-info)]',
  }

  useEffect(() => {
    const duration = toast.duration || 5000
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [toast.duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-[400px]",
        "bg-[var(--bg-overlay)]",
        colors[toast.type]
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[var(--text-primary)]">{toast.title}</div>
        {toast.description && (
          <div className="text-sm text-[var(--text-secondary)] mt-1">{toast.description}</div>
        )}
      </div>
      <button onClick={onClose} className="p-1 hover:bg-[var(--bg-hover)] rounded">
        <X className="w-4 h-4 text-[var(--text-tertiary)]" />
      </button>
    </motion.div>
  )
}

export { ToastContext }

