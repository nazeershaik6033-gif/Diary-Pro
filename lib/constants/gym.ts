import type { Exercise, WorkoutTemplate } from '@/types'

export const SEED_EXERCISES: Omit<Exercise, 'id'>[] = [
  // Chest
  { name: 'Bench Press', muscleGroup: 'chest', equipment: 'Barbell', isCustom: false },
  { name: 'Incline Bench Press', muscleGroup: 'chest', equipment: 'Barbell', isCustom: false },
  { name: 'Decline Bench Press', muscleGroup: 'chest', equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Chest Press', muscleGroup: 'chest', equipment: 'Dumbbell', isCustom: false },
  { name: 'Dumbbell Flyes', muscleGroup: 'chest', equipment: 'Dumbbell', isCustom: false },
  { name: 'Cable Crossover', muscleGroup: 'chest', equipment: 'Cable', isCustom: false },
  { name: 'Push-ups', muscleGroup: 'chest', equipment: 'Bodyweight', isCustom: false },
  { name: 'Chest Dips', muscleGroup: 'chest', equipment: 'Bodyweight', isCustom: false },
  // Back
  { name: 'Deadlift', muscleGroup: 'back', equipment: 'Barbell', isCustom: false },
  { name: 'Barbell Row', muscleGroup: 'back', equipment: 'Barbell', isCustom: false },
  { name: 'Pull-ups', muscleGroup: 'back', equipment: 'Bodyweight', isCustom: false },
  { name: 'Chin-ups', muscleGroup: 'back', equipment: 'Bodyweight', isCustom: false },
  { name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'Cable', isCustom: false },
  { name: 'Seated Cable Row', muscleGroup: 'back', equipment: 'Cable', isCustom: false },
  { name: 'T-Bar Row', muscleGroup: 'back', equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Row', muscleGroup: 'back', equipment: 'Dumbbell', isCustom: false },
  { name: 'Face Pulls', muscleGroup: 'back', equipment: 'Cable', isCustom: false },
  // Shoulders
  { name: 'Overhead Press', muscleGroup: 'shoulders', equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'shoulders', equipment: 'Dumbbell', isCustom: false },
  { name: 'Lateral Raises', muscleGroup: 'shoulders', equipment: 'Dumbbell', isCustom: false },
  { name: 'Front Raises', muscleGroup: 'shoulders', equipment: 'Dumbbell', isCustom: false },
  { name: 'Rear Delt Flyes', muscleGroup: 'shoulders', equipment: 'Dumbbell', isCustom: false },
  { name: 'Arnold Press', muscleGroup: 'shoulders', equipment: 'Dumbbell', isCustom: false },
  // Biceps
  { name: 'Barbell Curl', muscleGroup: 'biceps', equipment: 'Barbell', isCustom: false },
  { name: 'Dumbbell Curl', muscleGroup: 'biceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Hammer Curl', muscleGroup: 'biceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Preacher Curl', muscleGroup: 'biceps', equipment: 'Barbell', isCustom: false },
  { name: 'Concentration Curl', muscleGroup: 'biceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Cable Curl', muscleGroup: 'biceps', equipment: 'Cable', isCustom: false },
  // Triceps
  { name: 'Tricep Pushdown', muscleGroup: 'triceps', equipment: 'Cable', isCustom: false },
  { name: 'Overhead Tricep Extension', muscleGroup: 'triceps', equipment: 'Dumbbell', isCustom: false },
  { name: 'Skull Crushers', muscleGroup: 'triceps', equipment: 'Barbell', isCustom: false },
  { name: 'Tricep Dips', muscleGroup: 'triceps', equipment: 'Bodyweight', isCustom: false },
  { name: 'Close-Grip Bench Press', muscleGroup: 'triceps', equipment: 'Barbell', isCustom: false },
  // Legs
  { name: 'Squat', muscleGroup: 'quads', equipment: 'Barbell', isCustom: false },
  { name: 'Front Squat', muscleGroup: 'quads', equipment: 'Barbell', isCustom: false },
  { name: 'Leg Press', muscleGroup: 'quads', equipment: 'Machine', isCustom: false },
  { name: 'Lunges', muscleGroup: 'quads', equipment: 'Bodyweight', isCustom: false },
  { name: 'Bulgarian Split Squat', muscleGroup: 'quads', equipment: 'Dumbbell', isCustom: false },
  { name: 'Leg Extension', muscleGroup: 'quads', equipment: 'Machine', isCustom: false },
  { name: 'Romanian Deadlift', muscleGroup: 'hamstrings', equipment: 'Barbell', isCustom: false },
  { name: 'Leg Curl', muscleGroup: 'hamstrings', equipment: 'Machine', isCustom: false },
  { name: 'Good Morning', muscleGroup: 'hamstrings', equipment: 'Barbell', isCustom: false },
  { name: 'Hip Thrust', muscleGroup: 'glutes', equipment: 'Barbell', isCustom: false },
  { name: 'Glute Bridge', muscleGroup: 'glutes', equipment: 'Bodyweight', isCustom: false },
  { name: 'Standing Calf Raise', muscleGroup: 'calves', equipment: 'Machine', isCustom: false },
  { name: 'Seated Calf Raise', muscleGroup: 'calves', equipment: 'Machine', isCustom: false },
  // Core
  { name: 'Plank', muscleGroup: 'core', equipment: 'Bodyweight', isCustom: false },
  { name: 'Crunches', muscleGroup: 'core', equipment: 'Bodyweight', isCustom: false },
  { name: 'Leg Raises', muscleGroup: 'core', equipment: 'Bodyweight', isCustom: false },
  { name: 'Russian Twists', muscleGroup: 'core', equipment: 'Bodyweight', isCustom: false },
  { name: 'Cable Crunches', muscleGroup: 'core', equipment: 'Cable', isCustom: false },
  { name: 'Ab Wheel Rollout', muscleGroup: 'core', equipment: 'Equipment', isCustom: false },
  // Cardio
  { name: 'Treadmill Run', muscleGroup: 'cardio', equipment: 'Machine', isCustom: false },
  { name: 'Cycling', muscleGroup: 'cardio', equipment: 'Machine', isCustom: false },
  { name: 'Jump Rope', muscleGroup: 'cardio', equipment: 'Equipment', isCustom: false },
  { name: 'Rowing Machine', muscleGroup: 'cardio', equipment: 'Machine', isCustom: false },
]

const now = Date.now()

export const SEED_TEMPLATES: Omit<WorkoutTemplate, 'id'>[] = [
  {
    name: 'Push Day',
    type: 'push',
    exercises: [
      { exerciseId: 1, exerciseName: 'Bench Press', sets: 4, repsTarget: 8, order: 0 },
      { exerciseId: 2, exerciseName: 'Incline Bench Press', sets: 3, repsTarget: 10, order: 1 },
      { exerciseId: 18, exerciseName: 'Overhead Press', sets: 3, repsTarget: 8, order: 2 },
      { exerciseId: 20, exerciseName: 'Lateral Raises', sets: 3, repsTarget: 15, order: 3 },
      { exerciseId: 30, exerciseName: 'Tricep Pushdown', sets: 3, repsTarget: 12, order: 4 },
      { exerciseId: 32, exerciseName: 'Skull Crushers', sets: 3, repsTarget: 10, order: 5 },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'Pull Day',
    type: 'pull',
    exercises: [
      { exerciseId: 9, exerciseName: 'Deadlift', sets: 4, repsTarget: 5, order: 0 },
      { exerciseId: 11, exerciseName: 'Pull-ups', sets: 4, repsTarget: 8, order: 1 },
      { exerciseId: 13, exerciseName: 'Lat Pulldown', sets: 3, repsTarget: 10, order: 2 },
      { exerciseId: 14, exerciseName: 'Seated Cable Row', sets: 3, repsTarget: 12, order: 3 },
      { exerciseId: 24, exerciseName: 'Barbell Curl', sets: 3, repsTarget: 10, order: 4 },
      { exerciseId: 26, exerciseName: 'Hammer Curl', sets: 3, repsTarget: 12, order: 5 },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'Legs Day',
    type: 'legs',
    exercises: [
      { exerciseId: 35, exerciseName: 'Squat', sets: 4, repsTarget: 8, order: 0 },
      { exerciseId: 37, exerciseName: 'Leg Press', sets: 3, repsTarget: 12, order: 1 },
      { exerciseId: 39, exerciseName: 'Bulgarian Split Squat', sets: 3, repsTarget: 10, order: 2 },
      { exerciseId: 41, exerciseName: 'Romanian Deadlift', sets: 3, repsTarget: 10, order: 3 },
      { exerciseId: 44, exerciseName: 'Hip Thrust', sets: 3, repsTarget: 12, order: 4 },
      { exerciseId: 46, exerciseName: 'Standing Calf Raise', sets: 4, repsTarget: 15, order: 5 },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    name: 'Full Body',
    type: 'full-body',
    exercises: [
      { exerciseId: 35, exerciseName: 'Squat', sets: 3, repsTarget: 8, order: 0 },
      { exerciseId: 1, exerciseName: 'Bench Press', sets: 3, repsTarget: 8, order: 1 },
      { exerciseId: 9, exerciseName: 'Deadlift', sets: 3, repsTarget: 5, order: 2 },
      { exerciseId: 18, exerciseName: 'Overhead Press', sets: 3, repsTarget: 8, order: 3 },
      { exerciseId: 11, exerciseName: 'Pull-ups', sets: 3, repsTarget: 8, order: 4 },
    ],
    createdAt: now,
    updatedAt: now,
  },
]
