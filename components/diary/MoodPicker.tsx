'use client'
import { MOOD_CONFIG, type MoodLevel } from '@/types'
import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'

interface MoodPickerProps {
  value: MoodLevel
  onChange: (mood: MoodLevel) => void
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex gap-3 justify-between">
      {(Object.entries(MOOD_CONFIG) as [string, typeof MOOD_CONFIG[MoodLevel]][]).map(([level, config]) => {
        const lvl = Number(level) as MoodLevel
        const selected = value === lvl
        return (
          <motion.button
            key={level}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(lvl)}
            className={cn(
              'flex flex-col items-center gap-1 flex-1 py-2.5 rounded-xl transition-all',
              selected ? 'bg-amber-faint ring-2 ring-amber-warm' : 'bg-paper-300 hover:bg-paper-400'
            )}
          >
            <span className="text-2xl">{config.emoji}</span>
            <span className={cn('text-xs font-sans capitalize', selected ? 'text-amber-dark font-semibold' : 'text-ink-300')}>
              {config.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
