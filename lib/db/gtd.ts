import { db, type GTDLog } from '@/lib/db'
import type { GTDInboxItem, GTDNextAction, GTDProject, GTDWaitingFor, GTDSomedayMaybe, GTDWeeklyReview } from '@/types'
import { toDateString } from '@/lib/utils/date'

async function logGTD(action: GTDLog['action'], area: string, itemTitle: string) {
  try {
    await db.gtdLogs.add({ date: toDateString(), action, area, itemTitle, createdAt: Date.now() })
  } catch { /* non-critical */ }
}

// ── Inbox ──────────────────────────────────────────────────────────────────
export async function captureInbox(content: string): Promise<number> {
  const id = await db.gtdInbox.add({ content, processed: false, createdAt: Date.now() })
  await logGTD('created', 'inbox', content.slice(0, 60))
  return id
}

export async function processInboxItem(id: number): Promise<void> {
  await db.gtdInbox.update(id, { processed: true })
  const item = await db.gtdInbox.get(id)
  if (item) await logGTD('processed', 'inbox', item.content.slice(0, 60))
}

export async function updateInboxItem(id: number, content: string): Promise<void> {
  await db.gtdInbox.update(id, { content })
}

export async function deleteInboxItem(id: number): Promise<void> {
  const item = await db.gtdInbox.get(id)
  if (item) await logGTD('deleted', 'inbox', item.content.slice(0, 60))
  await db.gtdInbox.delete(id)
}

// ── Next Actions ───────────────────────────────────────────────────────────
export async function addNextAction(action: Omit<GTDNextAction, 'id'>): Promise<number> {
  const id = await db.gtdNextActions.add(action)
  await logGTD('created', 'next-actions', action.title)
  return id
}

export async function completeNextAction(id: number): Promise<void> {
  const action = await db.gtdNextActions.get(id)
  await db.gtdNextActions.update(id, { completed: true, completedAt: Date.now(), updatedAt: Date.now() })
  if (action) await logGTD('completed', 'next-actions', action.title)
}

export async function deleteNextAction(id: number): Promise<void> {
  const action = await db.gtdNextActions.get(id)
  if (action) await logGTD('deleted', 'next-actions', action.title)
  await db.gtdNextActions.delete(id)
}

// ── Projects ───────────────────────────────────────────────────────────────
export async function addProject(project: Omit<GTDProject, 'id'>): Promise<number> {
  const id = await db.gtdProjects.add(project)
  await logGTD('created', 'projects', project.title)
  return id
}

export async function updateProject(id: number, changes: Partial<GTDProject>): Promise<void> {
  await db.gtdProjects.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteProject(id: number): Promise<void> {
  const p = await db.gtdProjects.get(id)
  if (p) await logGTD('deleted', 'projects', p.title)
  await db.gtdProjects.delete(id)
}

// ── Waiting For ───────────────────────────────────────────────────────────
export async function addWaitingFor(item: Omit<GTDWaitingFor, 'id'>): Promise<number> {
  const id = await db.gtdWaitingFor.add(item)
  await logGTD('created', 'waiting-for', item.title)
  return id
}

export async function completeWaitingFor(id: number): Promise<void> {
  await db.gtdWaitingFor.update(id, { completed: true })
}

// ── Someday / Maybe ───────────────────────────────────────────────────────
export async function addSomedayMaybe(item: Omit<GTDSomedayMaybe, 'id'>): Promise<number> {
  const id = await db.gtdSomedayMaybe.add(item)
  await logGTD('created', 'someday', item.title)
  return id
}

// ── Weekly Review ─────────────────────────────────────────────────────────
export async function saveWeeklyReview(review: Omit<GTDWeeklyReview, 'id'>): Promise<number> {
  return db.gtdWeeklyReviews.add(review)
}

export async function getLatestWeeklyReview(): Promise<GTDWeeklyReview | undefined> {
  return db.gtdWeeklyReviews.orderBy('weekStartDate').last()
}

// ── Logs ─────────────────────────────────────────────────────────────────
export async function getGTDLogsByDate(date: string): Promise<GTDLog[]> {
  return db.gtdLogs.where('date').equals(date).reverse().sortBy('createdAt')
}

export async function getRecentGTDLogs(days = 30): Promise<GTDLog[]> {
  const cutoff = Date.now() - days * 86400000
  return db.gtdLogs.where('createdAt').above(cutoff).reverse().sortBy('createdAt')
}
