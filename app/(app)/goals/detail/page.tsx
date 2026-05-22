'use client'
import { Suspense } from 'react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { MilestoneList } from '@/components/goals/MilestoneList'
import { GOAL_TIER_CONFIG } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { Sparkles } from 'lucide-react'

function GoalDetailContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const goalId = Number(id)
  const [photoIndex, setPhotoIndex] = useState(0)

  const goal = useLiveQuery(() => db.goals.get(goalId), [goalId])

  if (goal === undefined) return <div className="flex justify-center pt-20"><Spinner /></div>
  if (!goal) return <div className="px-4 pt-8 text-center"><p className="text-ink-300">Goal not found.</p></div>

  const cfg = GOAL_TIER_CONFIG[goal.tier]

  return (
    <div>
      <PageHeader title={goal.title} showBack />

      <div className="px-4 space-y-5 pb-8">
        {goal.photos.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden">
            <img src={goal.photos[photoIndex]} alt="" className="w-full h-48 object-cover" />
            {goal.photos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {goal.photos.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full ${i === photoIndex ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
          {goal.description && (
            <p className="text-base font-sans text-ink-400 mt-2 leading-relaxed">{goal.description}</p>
          )}
        </div>

        {goal.affirmation && (
          <div className="bg-amber-faint border border-amber-warm/30 rounded-xl p-3 flex gap-2">
            <Sparkles size={14} className="text-amber-warm flex-shrink-0 mt-0.5" />
            <p className="text-sm font-serif italic text-ink">"{goal.affirmation}"</p>
          </div>
        )}

        <div>
          <p className="text-sm font-sans font-semibold text-ink-400 uppercase tracking-wide mb-3">Milestones</p>
          <MilestoneList goalId={goalId} />
        </div>
      </div>
    </div>
  )
}

export default function GoalDetailPage() {
  return <Suspense><GoalDetailContent /></Suspense>
}
