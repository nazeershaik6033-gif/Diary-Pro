import { db } from '@/lib/db'
import type { WorkoutLog, WorkoutSet, BodyMetric, WorkoutTemplate, Exercise } from '@/types'

export async function startWorkout(log: Omit<WorkoutLog, 'id'>): Promise<number> {
  return db.workoutLogs.add(log)
}

export async function finishWorkout(id: number): Promise<void> {
  const sets = await db.workoutSets.where('workoutLogId').equals(id).toArray()
  const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
  await db.workoutLogs.update(id, { completedAt: Date.now(), totalVolume })
}

export async function logSet(set: Omit<WorkoutSet, 'id'>): Promise<number> {
  return db.workoutSets.add(set)
}

export async function deleteSet(id: number): Promise<void> {
  await db.workoutSets.delete(id)
}

export async function updateSet(id: number, changes: Partial<WorkoutSet>): Promise<void> {
  await db.workoutSets.update(id, changes)
}

export async function addBodyMetric(metric: Omit<BodyMetric, 'id'>): Promise<number> {
  return db.bodyMetrics.add(metric)
}

export async function saveTemplate(template: Omit<WorkoutTemplate, 'id'>): Promise<number> {
  return db.workoutTemplates.add(template)
}

export async function updateTemplate(id: number, changes: Partial<WorkoutTemplate>): Promise<void> {
  await db.workoutTemplates.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteTemplate(id: number): Promise<void> {
  await db.workoutTemplates.delete(id)
}

export async function addExercise(exercise: Omit<Exercise, 'id'>): Promise<number> {
  return db.exercises.add(exercise)
}
