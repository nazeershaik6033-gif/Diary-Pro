'use client'
import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Sheet({ open, onClose, title, children, className }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-warm-lg z-50',
              'pb-safe',
              className
            )}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-paper-400" />
            </div>
            {title && (
              <div className="flex items-center justify-between px-6 pb-4">
                <h2 className="text-lg font-serif font-semibold text-ink">{title}</h2>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-paper-300 transition-colors">
                  <X size={18} className="text-ink-300" />
                </button>
              </div>
            )}
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
