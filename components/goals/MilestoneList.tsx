'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { completeMilestone, deleteMilestone, addMilestone } from '@/lib/db/goals'
import { CheckCircle, Circle, Trash2, Plus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

interface MilestoneListProps {
  goalId: number
}

export function MilestoneList({ goalId }: MilestoneListProps) {
  const [newTitle, setNewTitle] = useState('')

  const milestones = useLiveQuery(
    () => db.goalMilestones.where('goalId').equals(goalId).sortBy('order'),
    [goalId]
  )

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    const count = milestones?.length ?? 0
    await addMilestone({ goalId, title: newTitle.trim(), completed: false, order: count })
    setNewTitle('')
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {milestones?.map(ms => (
          <motion.div
            key={ms.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-paper-300"
          >
            <button onClick={() => !ms.completed && ms.id && completeMilestone(ms.id)}>
              {ms.completed
                ? <CheckCircle size={18} className="text-sage flex-shrink-0" />
                : <Circle size={18} className="text-ink-200 flex-shrink-0" />
              }
            </button>
            <p className={`flex-1 text-sm font-sans ${ms.completed ? 'line-through text-ink-200' : 'text-ink'}`}>
              {ms.title}
            </p>
            {!ms.completed && (
              <button onClick={() => ms.id && deleteMilestone(ms.id)}>
                <Trash2 size={13} className="text-red-300" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex gap-2 mt-3">
        <Input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add milestone…"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1"
        />
        <Button size="sm" onClick={handleAdd} disabled={!newTitle.trim()}>
          <Plus size={14} />
        </Button>
      </div>
    </div>
  )
}
