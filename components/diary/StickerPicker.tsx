'use client'

import { useState } from 'react'
import { STICKERS, STICKER_CATEGORIES, STICKER_MAP } from '@/types/stickers'
import type { StickerCategory } from '@/types/stickers'
import { cn } from '@/lib/utils/cn'

interface StickerPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  maxStickers?: number
}

export function StickerPicker({ selectedIds, onChange, maxStickers = 5 }: StickerPickerProps) {
  const [activeCategory, setActiveCategory] = useState<StickerCategory>('feeling')

  const visible = STICKERS.filter(s => s.category === activeCategory)

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(s => s !== id))
    } else if (selectedIds.length < maxStickers) {
      onChange([...selectedIds, id])
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STICKER_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-sans font-medium transition-colors',
              activeCategory === cat.id
                ? 'bg-amber-warm text-white'
                : 'bg-paper-300 text-ink-300 hover:bg-paper-400'
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Sticker grid — 5 columns */}
      <div className="grid grid-cols-5 gap-2">
        {visible.map(sticker => {
          const isSelected = selectedIds.includes(sticker.id)
          const isDisabled = !isSelected && selectedIds.length >= maxStickers
          return (
            <button
              key={sticker.id}
              type="button"
              aria-label={sticker.label}
              onClick={() => toggle(sticker.id)}
              disabled={isDisabled}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl transition-all active:scale-[0.99]',
                isSelected
                  ? 'ring-2 ring-amber-warm bg-amber-faint'
                  : 'bg-paper-300 hover:bg-paper-400',
                isDisabled && 'opacity-40 pointer-events-none'
              )}
            >
              <span className="text-2xl leading-none">{sticker.emoji}</span>
              <span className="text-[10px] font-sans text-ink-300 truncate w-full text-center leading-tight">
                {sticker.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected summary */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-sans text-ink-300">Selected:</span>
          {selectedIds.map(id => (
            <span key={id} className="text-lg leading-none">
              {STICKER_MAP[id]?.emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
