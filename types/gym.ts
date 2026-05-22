export type WorkoutType = 'push' | 'pull' | 'legs' | 'full-body' | 'upper' | 'lower' | 'custom'
export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'core' | 'quads' | 'hamstrings' | 'glutes'
  | 'calves' | 'cardio' | 'full-body'

export const WORKOUT_TYPE_CONFIG: Record<WorkoutType, { label: string; color: string }> = {
  push: { label: 'Push Day', color: 'bg-orange-50 text-orange-600' },
  pull: { label: 'Pull Day', color: 'bg-blue-50 text-blue-600' },
  legs: { label: 'Legs Day', color: 'bg-purple-50 text-purple-600' },
  'full-body': { label: 'Full Body', color: 'bg-green-50 text-green-600' },
  upper: { label: 'Upper Body', color: 'bg-amber-faint text-amber-dark' },
  lower: { label: 'Lower Body', color: 'bg-rose-50 text-rose-600' },
  custom: { label: 'Custom', color: 'bg-paper-300 text-ink-400' },
}

export interface Exercise {
  id?: number
  name: string
  muscleGroup: MuscleGroup
  equipment?: string
  isCustom: boolean
  notes?: string
}

export interface WorkoutTemplateExercise {
  exerciseId: number
  exerciseName: string
  sets: number
  repsTarget?: number
  weightTarget?: number
  order: number
}

export interface WorkoutTemplate {
  id?: number
  name: string
  type: WorkoutType
  exercises: WorkoutTemplateExercise[]
  createdAt: number
  updatedAt: number
}

export interface WorkoutLog {
  id?: number
  templateId?: number
  templateName: string
  date: string // 'YYYY-MM-DD'
  startedAt: number
  completedAt?: number
  notes?: string
  totalVolume?: number // kg * reps summed
}

export interface WorkoutSet {
  id?: number
  workoutLogId: number
  exerciseId: number
  exerciseName: string
  setNumber: number
  reps: number
  weight: number // kg
  isWarmup: boolean
  rpe?: number // 1-10
}

export interface BodyMetric {
  id?: number
  date: string // 'YYYY-MM-DD'
  bodyWeight?: number // kg
  bodyFatPercent?: number
  chestCm?: number
  waistCm?: number
  hipsCm?: number
  leftArmCm?: number
  rightArmCm?: number
  leftThighCm?: number
  rightThighCm?: number
  notes?: string
}

export interface PersonalRecord {
  id?: number
  exerciseId: number
  exerciseName: string
  weight: number
  reps: number
  estimated1RM: number // Epley formula: weight * (1 + reps/30)
  date: string
  workoutLogId: number
}
