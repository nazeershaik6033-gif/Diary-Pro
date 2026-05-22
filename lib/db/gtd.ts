import { db } from '@/lib/db'
import type { GTDInboxItem, GTDNextAction, GTDProject, GTDWaitingFor, GTDSomedayMaybe, GTDWeeklyReview } from '@/types'

export async function captureInbox(content: string): Promise<number> {
  return db.gtdInbox.add({ content, processed: false, createdAt: Date.now() })
}

export async function processInboxItem(id: number): Promise<void> {
  await db.gtdInbox.update(id, { processed: true })
}

export async function deleteInboxItem(id: number): Promise<void> {
  await db.gtdInbox.delete(id)
}

export async function addNextAction(action: Omit<GTDNextAction, 'id'>): Promise<number> {
  return db.gtdNextActions.add(action)
}

export async function completeNextAction(id: number): Promise<void> {
  await db.gtdNextActions.update(id, { completed: true, completedAt: Date.now(), updatedAt: Date.now() })
}

export async function deleteNextAction(id: number): Promise<void> {
  await db.gtdNextActions.delete(id)
}

export async function addProject(project: Omit<GTDProject, 'id'>): Promise<number> {
  return db.gtdProjects.add(project)
}

export async function updateProject(id: number, changes: Partial<GTDProject>): Promise<void> {
  await db.gtdProjects.update(id, { ...changes, updatedAt: Date.now() })
}

export async function addWaitingFor(item: Omit<GTDWaitingFor, 'id'>): Promise<number> {
  return db.gtdWaitingFor.add(item)
}

export async function completeWaitingFor(id: number): Promise<void> {
  await db.gtdWaitingFor.update(id, { completed: true })
}

export async function addSomedayMaybe(item: Omit<GTDSomedayMaybe, 'id'>): Promise<number> {
  return db.gtdSomedayMaybe.add(item)
}

export async function saveWeeklyReview(review: Omit<GTDWeeklyReview, 'id'>): Promise<number> {
  return db.gtdWeeklyReviews.add(review)
}

export async function getLatestWeeklyReview(): Promise<GTDWeeklyReview | undefined> {
  return db.gtdWeeklyReviews.orderBy('weekStartDate').last()
}
