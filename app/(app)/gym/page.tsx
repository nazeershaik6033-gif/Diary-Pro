'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useActiveWorkout } from '@/app/contexts/ActiveWorkoutContext'
import { TemplateCard } from '@/components/gym/TemplateCard'
import { WorkoutCard } from '@/components/gym/WorkoutCard'
import { ActiveWorkout } from '@/components/gym/ActiveWorkout'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'
import { Dumbbell, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toDateString } from '@/lib/utils/date'

export default function GymPage() {
  const { activeLog, startWorkout } = useActiveWorkout()
  const templates = useLiveQuery(() => db.workoutTemplates.toArray(), [])
  const recentLogs = useLiveQuery(
    () => db.workoutLogs.where('completedAt').above(0).reverse().limit(5).toArray(),
    []
  )

  const handleStartTemplate = async (templateId: number) => {
    const t = await db.workoutTemplates.get(templateId)
    if (!t) return
    await startWorkout({
      templateId,
      templateName: t.name,
      date: toDateString(),
      startedAt: Date.now(),
    })
  }

  if (activeLog) {
    const template = templates?.find(t => t.id === activeLog.templateId)
    return (
      <div>
        <div className="px-4 pt-2 pb-4">
          <h2 className="text-2xl font-serif font-bold text-ink">Active Workout</h2>
        </div>
        <ActiveWorkout exercises={template?.exercises ?? []} />
      </div>
    )
  }

  return (
    <div className="px-4 pb-4">
      <div className="pt-2 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink">Gym</h2>
          <p className="text-sm font-sans text-ink-300">Track your training</p>
        </div>
        <Link href="/gym/metrics">
          <Button size="sm" variant="secondary">Metrics</Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-sans font-semibold text-ink-400 uppercase tracking-wide">Workouts</p>
          <Link href="/gym/templates" className="text-xs font-sans text-amber-warm">Manage Templates</Link>
        </div>
        {templates === undefined ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-paper-300 animate-pulse" />)}
          </div>
        ) : templates.length === 0 ? (
          <EmptyState icon={Dumbbell} title="No templates" description="Templates help you start workouts quickly." />
        ) : (
          <div className="space-y-2">
            {templates.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <TemplateCard template={t} onStart={() => t.id && handleStartTemplate(t.id)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {recentLogs && recentLogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-sans font-semibold text-ink-400 uppercase tracking-wide">Recent Workouts</p>
            <Link href="/gym/records" className="text-xs font-sans text-amber-warm flex items-center gap-1">
              Records <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentLogs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <WorkoutCard log={log} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
