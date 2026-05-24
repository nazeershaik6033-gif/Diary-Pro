'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useActiveWorkout } from '@/app/contexts/ActiveWorkoutContext'
import { TemplateCard } from '@/components/gym/TemplateCard'
import { WorkoutCard } from '@/components/gym/WorkoutCard'
import { ActiveWorkout } from '@/components/gym/ActiveWorkout'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'
import { Dumbbell, ChevronRight, Flame } from 'lucide-react'
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
  const todayDate = toDateString()
  const todayNutrition = useLiveQuery(
    () => db.nutritionLogs.where('date').equals(todayDate).toArray(),
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

  const todayCalories = (todayNutrition ?? []).reduce((s, l) => s + l.calories, 0)

  return (
    <div className="px-4 pb-4">
      <div className="pt-2 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink">Exercise & Calories</h2>
          <p className="text-sm font-sans text-ink-300">Track training and nutrition</p>
        </div>
        <Link href="/gym/metrics">
          <Button size="sm" variant="secondary">Metrics</Button>
        </Link>
      </div>

      {/* Calories today card */}
      <Link href="/gym/calories">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4 hover:shadow-warm-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Flame size={18} className="text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-medium text-ink">Calories Today</p>
            <p className="text-xs font-sans text-ink-300 mt-0.5">
              {todayCalories > 0
                ? `${todayCalories.toLocaleString()} kcal logged`
                : 'Tap to log meals'}
            </p>
          </div>
          <ChevronRight size={16} className="text-ink-200 flex-shrink-0" />
        </motion.div>
      </Link>

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
