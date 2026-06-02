'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'
import type { PersonalRecord } from '@/types'

interface PRBadgeProps {
  pr: PersonalRecord | null
  onDismiss: () => void
}

export function PRBadge({ pr, onDismiss }: PRBadgeProps) {
  return (
    <AnimatePresence>
      {pr && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', damping: 15, stiffness: 400 }}
          onClick={onDismiss}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-amber-warm text-white rounded-3xl px-6 py-4 shadow-warm-lg text-center max-w-xs w-full mx-4"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="text-3xl mb-1">🏆</div>
          <p className="font-serif font-bold text-lg">New Personal Record!</p>
          <p className="text-sm mt-1 opacity-90">{pr.exerciseName}</p>
          <p className="text-base font-semibold mt-1">{pr.weight}kg × {pr.reps} reps</p>
          <p className="text-xs opacity-80 mt-1">Est. 1RM: {pr.estimated1RM}kg</p>
          <p className="text-xs opacity-70 mt-2">Tap to dismiss</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
