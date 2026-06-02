import { db } from '@/lib/db'
import type { PersonalRecord, WorkoutSet } from '@/types'

export function epley1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

export async function checkAndSavePR(
  set: WorkoutSet,
  workoutLogId: number,
  date: string
): Promise<PersonalRecord | null> {
  if (set.isWarmup || set.reps === 0 || set.weight === 0) return null

  const newEstimated1RM = epley1RM(set.weight, set.reps)

  const existing = await db.personalRecords
    .where('exerciseId')
    .equals(set.exerciseId)
    .first()

  if (!existing || newEstimated1RM > existing.estimated1RM) {
    const pr: PersonalRecord = {
      exerciseId: set.exerciseId,
      exerciseName: set.exerciseName,
      weight: set.weight,
      reps: set.reps,
      estimated1RM: newEstimated1RM,
      date,
      workoutLogId,
    }

    if (existing?.id) {
      await db.personalRecords.update(existing.id, pr)
      return { ...pr, id: existing.id }
    } else {
      const id = await db.personalRecords.add(pr)
      return { ...pr, id }
    }
  }

  return null
}
