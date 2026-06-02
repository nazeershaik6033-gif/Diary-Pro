import { db } from '@/lib/db'
import type { Habit, HabitLog } from '@/types'
import { HABIT_TEMPLATES } from '@/types'
import { toDateString } from '@/lib/utils/date'

export async function addHabit(habit: Omit<Habit, 'id'>): Promise<number> {
  return db.habits.add(habit)
}

export async function updateHabit(id: number, changes: Partial<Habit>): Promise<void> {
  await db.habits.update(id, changes)
}

export async function archiveHabit(id: number): Promise<void> {
  await db.habits.update(id, { active: false })
}

export async function logHabit(habitId: number, count: number, date?: string): Promise<void> {
  const d = date ?? toDateString()
  const existing = await db.habitLogs.where({ habitId, date: d }).first()
  if (existing?.id) {
    await db.habitLogs.update(existing.id, { count })
  } else {
    await db.habitLogs.add({ habitId, date: d, count, createdAt: Date.now() })
  }
}

export async function getHabitLogsForRange(habitId: number, startDate: string, endDate: string): Promise<HabitLog[]> {
  return db.habitLogs
    .where('habitId').equals(habitId)
    .and(log => log.date >= startDate && log.date <= endDate)
    .toArray()
}

export async function getTodayLog(habitId: number): Promise<HabitLog | undefined> {
  return db.habitLogs.where({ habitId, date: toDateString() }).first()
}

export async function computeStreak(habitId: number): Promise<{ current: number; best: number }> {
  const logs = await db.habitLogs
    .where('habitId').equals(habitId)
    .and(l => l.count > 0)
    .sortBy('date')

  if (logs.length === 0) return { current: 0, best: 0 }

  const today = toDateString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const dates = logs.map(l => l.date).sort().reverse()
  if (dates[0] !== today && dates[0] !== yesterdayStr) return { current: 0, best: 0 }

  let current = 1
  let best = 1
  let streak = 1
  let prev = new Date(dates[0])

  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i])
    const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 1) {
      streak++
      best = Math.max(best, streak)
    } else {
      streak = 1
    }
    prev = curr
  }
  current = streak

  return { current, best }
}

export async function seedHabitsIfEmpty(): Promise<void> {
  const count = await db.habits.count()
  if (count === 0) {
    const now = Date.now()
    await db.habits.bulkAdd(HABIT_TEMPLATES.map(t => ({ ...t, createdAt: now })))
  }
}
