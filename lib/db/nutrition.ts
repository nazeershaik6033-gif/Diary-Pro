import { db } from '@/lib/db'
import type { NutritionLog, FoodLibraryItem, NutritionGoals } from '@/types'
import { DEFAULT_NUTRITION_GOALS } from '@/types/nutrition'

export async function addNutritionLog(log: Omit<NutritionLog, 'id'>): Promise<number> {
  return db.nutritionLogs.add(log)
}

export async function deleteNutritionLog(id: number): Promise<void> {
  await db.nutritionLogs.delete(id)
}

export async function getLogsForDate(date: string): Promise<NutritionLog[]> {
  return db.nutritionLogs.where('date').equals(date).sortBy('createdAt')
}

export async function saveFoodLibraryItem(item: Omit<FoodLibraryItem, 'id'>): Promise<number> {
  return db.foodLibrary.add(item)
}

export async function deleteFoodLibraryItem(id: number): Promise<void> {
  await db.foodLibrary.delete(id)
}

export async function getNutritionGoals(): Promise<NutritionGoals> {
  const existing = await db.nutritionGoals.get(1)
  if (existing) return existing
  const id = await db.nutritionGoals.add({ ...DEFAULT_NUTRITION_GOALS, id: 1 })
  return { ...DEFAULT_NUTRITION_GOALS, id: id as number }
}

export async function saveNutritionGoals(goals: Omit<NutritionGoals, 'id' | 'updatedAt'>): Promise<void> {
  await db.nutritionGoals.put({ ...goals, id: 1, updatedAt: Date.now() })
}
