import { db } from '@/lib/db'
import type { Goal, GoalMilestone, DailyAffirmation } from '@/types'

export async function addGoal(goal: Omit<Goal, 'id'>): Promise<number> {
  return db.goals.add(goal)
}

export async function updateGoal(id: number, changes: Partial<Goal>): Promise<void> {
  await db.goals.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteGoal(id: number): Promise<void> {
  await db.transaction('rw', [db.goals, db.goalMilestones], async () => {
    await db.goals.delete(id)
    await db.goalMilestones.where('goalId').equals(id).delete()
  })
}

export async function addMilestone(milestone: Omit<GoalMilestone, 'id'>): Promise<number> {
  return db.goalMilestones.add(milestone)
}

export async function completeMilestone(id: number): Promise<void> {
  await db.goalMilestones.update(id, { completed: true, completedAt: Date.now() })
}

export async function deleteMilestone(id: number): Promise<void> {
  await db.goalMilestones.delete(id)
}

export async function addAffirmation(text: string): Promise<number> {
  return db.dailyAffirmations.add({ text, active: true, createdAt: Date.now() })
}

export async function toggleAffirmation(id: number, active: boolean): Promise<void> {
  await db.dailyAffirmations.update(id, { active })
}

export async function getRandomAffirmation(): Promise<DailyAffirmation | undefined> {
  const all = await db.dailyAffirmations.filter(a => !!a.active).toArray()
  if (all.length === 0) return undefined
  return all[Math.floor(Math.random() * all.length)]
}
