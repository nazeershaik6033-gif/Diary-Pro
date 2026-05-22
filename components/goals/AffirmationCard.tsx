'use client'
import { useEffect, useState } from 'react'
import { getRandomAffirmation } from '@/lib/db/goals'
import type { DailyAffirmation } from '@/types'
import { Sparkles } from 'lucide-react'

export function AffirmationCard() {
  const [affirmation, setAffirmation] = useState<DailyAffirmation | null>(null)

  useEffect(() => {
    getRandomAffirmation().then(a => a && setAffirmation(a))
  }, [])

  if (!affirmation) return null

  return (
    <div className="bg-amber-faint border border-amber-warm/30 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-amber-warm" />
        <span className="text-xs font-sans font-semibold text-amber-dark uppercase tracking-wide">Daily Affirmation</span>
      </div>
      <p className="font-serif text-ink text-base italic leading-relaxed">"{affirmation.text}"</p>
    </div>
  )
}
