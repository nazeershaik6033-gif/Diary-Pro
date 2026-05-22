'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Control, Controller } from 'react-hook-form'
import { Heart } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

interface GratitudeSectionProps {
  control: Control<any, any, any>
}

export function GratitudeSection({ control }: GratitudeSectionProps) {
  const settings = useLiveQuery(() => db.settings.get('singleton'))
  const prompts = settings?.diaryGratitudePrompts ?? [
    'What are you grateful for today?',
    'Who made your day better?',
    'What small moment brought you joy?',
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Heart size={14} className="text-blush" />
        <span className="text-sm font-medium font-sans text-ink-400">Gratitude</span>
      </div>
      {prompts.map((prompt, i) => (
        <Controller
          key={i}
          name={`gratitude.${i}` as any}
          control={control}
          render={({ field }) => (
            <div>
              <p className="text-xs font-sans text-ink-300 mb-1">{prompt}</p>
              <textarea
                {...field}
                rows={2}
                placeholder="Write here…"
                className="w-full rounded-xl border border-paper-400 bg-paper-50 px-3 py-2 text-[16px] font-sans text-ink placeholder:text-ink-200 focus:outline-none focus:ring-2 focus:ring-amber-warm resize-none"
              />
            </div>
          )}
        />
      ))}
    </div>
  )
}
