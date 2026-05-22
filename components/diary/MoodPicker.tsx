'use client'
import { STICKERS } from '@/types/stickers'
import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'

// Feeling stickers to show as the mood picker
const FEELING_STICKERS = STICKERS.filter(s => s.category === 'feeling')

interface MoodPickerProps {
  /** Selected sticker IDs */
  value: string[]
  onChange: (ids: string[]) => void
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="flex gap-2 flex-wrap justify-between">
      {FEELING_STICKERS.map(sticker => {
        const selected = value.includes(sticker.id)
        return (
          <motion.button
            key={sticker.id}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => toggle(sticker.id)}
            className={cn(
              'flex flex-col items-center gap-1 flex-1 min-w-[52px] py-2.5 rounded-xl transition-all',
              selected ? 'bg-amber-faint ring-2 ring-amber-warm' : 'bg-paper-300 hover:bg-paper-400'
            )}
          >
            <span className="text-2xl">{sticker.emoji}</span>
            <span className={cn('text-xs font-sans capitalize', selected ? 'text-amber-dark font-semibold' : 'text-ink-300')}>
              {sticker.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
