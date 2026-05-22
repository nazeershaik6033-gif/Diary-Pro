'use client'
import { useState } from 'react'
import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'

interface PINPadProps {
  onComplete: (pin: string) => void
  length?: number
  error?: boolean
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'] as const

export function PINPad({ onComplete, length = 4, error = false }: PINPadProps) {
  const [digits, setDigits] = useState<string[]>([])

  const handleKey = (key: typeof KEYS[number]) => {
    if (key === '') return
    if (key === 'del') {
      setDigits(prev => prev.slice(0, -1))
      return
    }
    const next = [...digits, key]
    setDigits(next)
    if (next.length === length) {
      onComplete(next.join(''))
      setDigits([])
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4">
        {Array.from({ length }).map((_, i) => (
          <motion.div
            key={i}
            animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}}
            transition={{ duration: 0.3 }}
            className={cn(
              'w-4 h-4 rounded-full border-2 border-amber-warm transition-colors',
              i < digits.length ? 'bg-amber-warm' : 'bg-transparent'
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {KEYS.map((key, i) => (
          <button
            key={i}
            onClick={() => handleKey(key)}
            disabled={key === ''}
            className={cn(
              'h-16 rounded-2xl text-xl font-sans font-medium text-ink transition-all active:scale-95',
              key === '' ? 'invisible' : 'bg-paper-300 hover:bg-paper-400',
              key === 'del' && 'bg-transparent hover:bg-paper-300'
            )}
          >
            {key === 'del' ? <Delete size={20} className="mx-auto" /> : key}
          </button>
        ))}
      </div>
    </div>
  )
}
