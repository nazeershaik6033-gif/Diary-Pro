export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_TYPE_CONFIG: Record<MealType, { label: string; color: string; bg: string }> = {
  breakfast: { label: 'Breakfast', color: 'text-amber-600', bg: 'bg-amber-50' },
  lunch:     { label: 'Lunch',     color: 'text-green-600',  bg: 'bg-green-50' },
  dinner:    { label: 'Dinner',    color: 'text-indigo-600', bg: 'bg-indigo-50' },
  snack:     { label: 'Snacks',    color: 'text-rose-500',   bg: 'bg-rose-50' },
}

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export interface NutritionLog {
  id?: number
  date: string       // 'YYYY-MM-DD'
  mealType: MealType
  name: string
  calories: number
  protein?: number   // g
  carbs?: number     // g
  fat?: number       // g
  foodLibraryId?: number
  createdAt: number
}

export interface FoodLibraryItem {
  id?: number
  name: string
  calories: number
  protein?: number
  carbs?: number
  fat?: number
  createdAt: number
}

export interface NutritionGoals {
  id?: number  // always 1
  calories: number
  protein: number
  carbs: number
  fat: number
  updatedAt: number
}

export const DEFAULT_NUTRITION_GOALS: Omit<NutritionGoals, 'id'> = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  updatedAt: 0,
}
