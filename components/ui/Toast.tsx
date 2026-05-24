'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info } from 'lucide-react'
import { useToast } from '@/app/contexts/ToastContext'
import { cn } from '@/lib/utils/cn'

export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-toast left-1/2 -translate-x-1/2 z-[100] flex flex-col-reverse gap-2 w-full max-w-sm px-4">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 shadow-warm-md text-sm font-sans',
              {
                'bg-green-50 text-green-700 border border-green-200': toast.type === 'success',
                'bg-red-50 text-red-700 border border-red-200': toast.type === 'error',
                'bg-amber-faint text-amber-dark border border-amber-warm/30': toast.type === 'info',
              }
            )}
          >
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <XCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
