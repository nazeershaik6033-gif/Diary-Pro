'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import type { Goal } from '@/types'
import { GOAL_TIER_CONFIG } from '@/types'
import { Card } from '@/components/ui/Card'
import { ChevronRight, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteGoal } from '@/lib/db/goals'
import { useToast } from '@/app/contexts/ToastContext'

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cfg = GOAL_TIER_CONFIG[goal.tier]

  const milestones = useLiveQuery(
    () => goal.id ? db.goalMilestones.where('goalId').equals(goal.id).toArray() : [],
    [goal.id]
  )

  const total = milestones?.length ?? 0
  const completed = milestones?.filter(m => m.completed).length ?? 0
  const progress = total > 0 ? completed / total : 0

  const handleDelete = async () => {
    if (!goal.id) return
    await deleteGoal(goal.id)
    showToast('Goal deleted')
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-warm-md transition-shadow active:scale-[0.99]">
        {goal.photos.length > 0 && (
          <img src={goal.photos[0]} alt="" className="w-full h-32 object-cover" />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <button onClick={() => setConfirmDelete(true)} className="p-1 rounded-lg hover:bg-red-50">
              <Trash2 size={14} className="text-red-300" />
            </button>
          </div>

          <button className="w-full text-left" onClick={() => goal.id && router.push(`/goals/${goal.id}`)}>
            <h3 className="font-serif font-semibold text-ink text-lg leading-snug mb-2">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm font-sans text-ink-300 line-clamp-2 mb-3">{goal.description}</p>
            )}

            {total > 0 && (
              <div>
                <div className="flex justify-between text-xs font-sans text-ink-300 mb-1">
                  <span>{completed}/{total} milestones</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-paper-300 rounded-full">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${progress * 100}%`, backgroundColor: cfg.color.replace('text-', '').includes('amber') ? '#C4933F' : undefined }}
                  />
                </div>
              </div>
            )}

            {goal.affirmation && (
              <p className="text-xs font-sans italic text-ink-300 mt-2 border-l-2 border-paper-400 pl-2">
                "{goal.affirmation}"
              </p>
            )}
          </button>
        </div>
      </Card>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message="This goal and all its milestones will be permanently deleted."
        confirmLabel="Delete"
        danger
      />
    </>
  )
}
