'use client'
import { useState } from 'react'
import { useActiveWorkout } from '@/app/contexts/ActiveWorkoutContext'
import { ExerciseSetRow } from './ExerciseSetRow'
import { PRBadge } from './PRBadge'
import { WorkoutTimer } from './WorkoutTimer'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useToast } from '@/app/contexts/ToastContext'
import { useRouter } from 'next/navigation'
import type { WorkoutTemplateExercise } from '@/types'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ActiveWorkoutProps {
  exercises: WorkoutTemplateExercise[]
}

export function ActiveWorkout({ exercises }: ActiveWorkoutProps) {
  const { activeLog, sets, lastPR, addSet, removeSet, completeWorkout, cancelWorkout, clearPR } = useActiveWorkout()
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [expandedExercise, setExpandedExercise] = useState<number>(0)
  const { showToast } = useToast()
  const router = useRouter()

  if (!activeLog) return null

  const handleFinish = async () => {
    await completeWorkout()
    showToast('Workout complete! 💪')
    router.push('/gym')
  }

  const handleCancel = async () => {
    await cancelWorkout()
    router.push('/gym')
  }

  return (
    <div className="px-4 pb-8 space-y-4">
      <div className="flex items-center justify-between bg-amber-warm text-white rounded-2xl px-4 py-3">
        <div>
          <p className="font-sans font-semibold text-sm">{activeLog.templateName}</p>
          <p className="text-xs opacity-80">{sets.length} sets logged</p>
        </div>
        <WorkoutTimer startedAt={activeLog.startedAt} />
      </div>

      {exercises.map((ex, idx) => {
        const exerciseSets = sets.filter(s => s.exerciseId === ex.exerciseId)
        const expanded = expandedExercise === idx
        const totalSets = ex.sets

        return (
          <div key={ex.exerciseId} className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 overflow-hidden">
            <button
              className="w-full flex items-center gap-3 p-4"
              onClick={() => setExpandedExercise(expanded ? -1 : idx)}
            >
              <div className="flex-1 text-left">
                <p className="font-sans font-medium text-ink">{ex.exerciseName}</p>
                <p className="text-xs text-ink-300 mt-0.5">{exerciseSets.length}/{totalSets} sets</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: totalSets }).map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < exerciseSets.length ? 'bg-sage' : 'bg-paper-400'}`} />
                ))}
              </div>
              {expanded ? <ChevronUp size={16} className="text-ink-200 ml-2" /> : <ChevronDown size={16} className="text-ink-200 ml-2" />}
            </button>

            {expanded && (
              <div className="px-4 pb-4 space-y-2">
                {exerciseSets.map(s => (
                  <ExerciseSetRow
                    key={s.id}
                    setNumber={s.setNumber}
                    reps={s.reps}
                    weight={s.weight}
                    isWarmup={s.isWarmup}
                    onLog={() => {}}
                    onDelete={() => s.id && removeSet(s.id)}
                    logged
                  />
                ))}
                {exerciseSets.length < totalSets && (
                  <ExerciseSetRow
                    setNumber={exerciseSets.length + 1}
                    reps={ex.repsTarget ?? 0}
                    weight={0}
                    isWarmup={false}
                    onLog={(reps, weight, isWarmup) => addSet({
                      exerciseId: ex.exerciseId,
                      exerciseName: ex.exerciseName,
                      setNumber: exerciseSets.length + 1,
                      reps, weight, isWarmup,
                    })}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" fullWidth onClick={() => setConfirmCancel(true)}>Cancel</Button>
        <Button fullWidth onClick={() => setConfirmFinish(true)}>Finish Workout</Button>
      </div>

      <PRBadge pr={lastPR} onDismiss={clearPR} />

      <ConfirmDialog open={confirmFinish} onClose={() => setConfirmFinish(false)} onConfirm={handleFinish}
        title="Finish Workout" message="Mark this workout as complete?" confirmLabel="Finish" />
      <ConfirmDialog open={confirmCancel} onClose={() => setConfirmCancel(false)} onConfirm={handleCancel}
        title="Cancel Workout" message="All sets logged in this session will be lost." confirmLabel="Cancel Workout" danger />
    </div>
  )
}
