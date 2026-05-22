import { db } from '@/lib/db'
import type { WorkEntry } from '@/types'

export async function addWorkEntry(entry: Omit<WorkEntry, 'id'>): Promise<number> {
  return db.workEntries.add(entry)
}

export async function updateWorkEntry(id: number, changes: Partial<WorkEntry>): Promise<void> {
  await db.workEntries.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteWorkEntry(id: number): Promise<void> {
  await db.workEntries.delete(id)
}
