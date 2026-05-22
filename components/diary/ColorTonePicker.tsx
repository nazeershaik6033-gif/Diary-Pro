'use client'

import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'

interface ColorTonePickerProps {
  value?: string
  onChange: (tone: string | undefined) => void
}

const TONES = [
  { id: 'warm',     bg: 'bg-amber-400',   label: 'Warm' },
  { id: 'ocean',    bg: 'bg-sky-400',      label: 'Ocean' },
  { id: 'forest',   bg: 'bg-emerald-400',  label: 'Forest' },
  { id: 'dark',     bg: 'bg-slate-500',    label: 'Dark' },
  { id: 'midnight', bg: 'bg-violet-400',   label: 'Midnight' },
]

export function ColorTonePicker({ value, onChange }: ColorTonePickerProps) {
  const handleSelect = (id: string) => {
    onChange(value === id ? undefined : id)
  }

  return (
    <div className="flex items-center gap-3">
      {/* None option */}
      <button
        type="button"
        aria-label="No color tone"
        onClick={() => onChange(undefined)}
        className={cn(
          'w-8 h-8 rounded-full border-2 border-dashed border-paper-400 flex items-center justify-center transition-all active:scale-[0.99]',
          !value && 'border-amber-warm ring-2 ring-amber-warm ring-offset-1'
        )}
      >
        {!value && <Check size={12} className="text-amber-warm" />}
      </button>

      {TONES.map(tone => (
        <button
          key={tone.id}
          type="button"
          aria-label={tone.label}
          onClick={() => handleSelect(tone.id)}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-[0.99]',
            tone.bg,
            value === tone.id && 'ring-2 ring-offset-1 ring-amber-warm'
          )}
        >
          {value === tone.id && <Check size={14} className="text-white" />}
        </button>
      ))}
    </div>
  )
}
