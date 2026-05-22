import { db } from '@/lib/db'
import type { DiaryEntry, DiaryPhoto } from '@/types'

export async function addDiaryEntry(entry: Omit<DiaryEntry, 'id'>): Promise<number> {
  return db.diaryEntries.add(entry)
}

export async function updateDiaryEntry(id: number, changes: Partial<DiaryEntry>): Promise<void> {
  await db.diaryEntries.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteDiaryEntry(id: number): Promise<void> {
  await db.transaction('rw', [db.diaryEntries, db.diaryPhotos], async () => {
    await db.diaryEntries.delete(id)
    await db.diaryPhotos.where('entryId').equals(id).delete()
  })
}

export async function getEntryByDate(date: string): Promise<DiaryEntry | undefined> {
  return db.diaryEntries.where('date').equals(date).first()
}

export async function addDiaryPhoto(photo: Omit<DiaryPhoto, 'id'>): Promise<number> {
  return db.diaryPhotos.add(photo)
}

export async function deleteDiaryPhoto(id: number): Promise<void> {
  await db.diaryPhotos.delete(id)
}

export async function getEntryDates(): Promise<string[]> {
  return db.diaryEntries.orderBy('date').keys() as Promise<string[]>
}

export async function searchDiaryEntries(query: string): Promise<DiaryEntry[]> {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return db.diaryEntries.filter(entry => {
    const contentText = entry.content.replace(/<[^>]*>/g, ' ')
    return (
      entry.title.toLowerCase().includes(q) ||
      contentText.toLowerCase().includes(q) ||
      entry.tags.some(tag => tag.toLowerCase().includes(q))
    )
  }).toArray()
}
