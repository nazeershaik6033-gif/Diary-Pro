'use client'
import { useState } from 'react'
import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'

interface PINPadProps {
  onComplete: (pin: string) => void
  length?: number
  error?: boolean
  variant?: 'lock' | 'setup'
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'] as const

const KEY_LETTERS: Record<string, string> = {
  '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL',
  '6': 'MNO', '7': 'PQRS', '8': 'TUV', '9': 'WXYZ',
}

export function PINPad({ onComplete, length = 4, error = false, variant = 'setup' }: PINPadProps) {
  const [digits, setDigits] = useState<string[]>([])
  const isLock = variant === 'lock'

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
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Dot indicators */}
      <motion.div
        className="flex gap-5"
        animate={error ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.35 }}
      >
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full border-2 transition-all duration-150',
              isLock
                ? cn('w-5 h-5 border-white/60', i < digits.length ? 'bg-white border-white scale-110' : 'bg-transparent')
                : cn('w-4 h-4 border-amber-warm', i < digits.length ? 'bg-amber-warm' : 'bg-transparent'),
            )}
          />
        ))}
      </motion.div>

      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-y-4 gap-x-6 w-full max-w-[300px]">
        {KEYS.map((key, i) => {
          if (key === '') return <div key={i} />

          if (key === 'del') {
            return (
              <button
                key={i}
                onClick={() => handleKey(key)}
                className={cn(
                  'flex items-center justify-center transition-all active:scale-90',
                  isLock
                    ? 'w-[76px] h-[76px] mx-auto rounded-full active:bg-white/15 text-white'
                    : 'h-16 rounded-2xl bg-transparent hover:bg-paper-300 text-ink',
                )}
              >
                <Delete size={isLock ? 22 : 20} />
              </button>
            )
          }

          return (
            <button
              key={i}
              onClick={() => handleKey(key)}
              className={cn(
                'flex flex-col items-center justify-center transition-all active:scale-90',
                isLock
                  ? 'w-[76px] h-[76px] mx-auto rounded-full bg-white/20 border border-white/10 active:bg-white/10'
                  : 'h-16 rounded-2xl bg-paper-300 hover:bg-paper-400',
              )}
            >
              <span className={cn(
                'font-light leading-none',
                isLock ? 'text-white text-[28px]' : 'text-xl font-medium text-ink',
              )}>
                {key}
              </span>
              {isLock && KEY_LETTERS[key] && (
                <span className="text-white/80 text-[9px] font-medium tracking-[0.18em] mt-0.5">
                  {KEY_LETTERS[key]}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
