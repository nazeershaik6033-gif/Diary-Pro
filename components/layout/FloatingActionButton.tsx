'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { QuickCaptureModal } from '@/components/shared/QuickCaptureModal'
import { usePathname } from 'next/navigation'

export function FloatingActionButton() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Article reader has its own add flow in the header — hide global FAB there
  if (pathname.startsWith('/articles')) return null

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed right-4 z-20 w-14 h-14 rounded-full bg-amber-warm text-white shadow-warm-lg flex items-center justify-center"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        aria-label="Quick capture"
      >
        <Plus size={24} />
      </motion.button>
      <QuickCaptureModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
