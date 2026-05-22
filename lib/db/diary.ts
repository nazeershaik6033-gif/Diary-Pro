import { db } from '@/lib/db'
import type {
  DiaryEntry,
  DiaryPhoto,
  DiaryAsset,
  EntryContent,
  EntrySticker,
} from '@/types'

// ---------------------------------------------------------------------------
// Entry CRUD
// ---------------------------------------------------------------------------

/**
 * Creates a new diary entry plus its first EntryContent record.
 * Returns the new entry's id.
 */
export async function createDiaryEntry(
  data: Omit<DiaryEntry, 'id' | 'latestContentId' | 'plainText'> & {
    content?: string
    pages?: EntryContent['pages']
  }
): Promise<number> {
  const { content, pages, ...entryData } = data

  // Build initial pages array
  const initialPages: EntryContent['pages'] = pages ?? [
    { id: crypto.randomUUID(), content: content ?? '', title: undefined },
  ]

  // Compute plainText from all pages
  const plainText = initialPages
    .map(p => p.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
    .join(' ')
    .trim()

  return db.transaction('rw', [db.diaryEntries, db.entryContents], async () => {
    // Insert entry stub first (without latestContentId so we have the entry id)
    const entryId = await db.diaryEntries.add({
      ...entryData,
      latestContentId: undefined,
      plainText,
    } as DiaryEntry)

    // Insert content
    const contentId = await db.entryContents.add({
      entryId,
      pages: initialPages,
      createdAt: Date.now(),
    })

    // Back-fill latestContentId
    await db.diaryEntries.update(entryId, { latestContentId: contentId })

    return entryId
  })
}

/**
 * Updates an entry: saves a new EntryContent version (keeps last 10),
 * refreshes plainText, and writes any scalar field changes.
 */
export async function updateDiaryEntry(
  id: number,
  changes: Partial<DiaryEntry> & { pages?: EntryContent['pages']; content?: string }
): Promise<void> {
  const { pages, content, ...scalarChanges } = changes

  await db.transaction(
    'rw',
    [db.diaryEntries, db.entryContents],
    async () => {
      let latestContentId: number | undefined

      if (pages !== undefined || content !== undefined) {
        const entry = await db.diaryEntries.get(id)
        if (!entry) return

        // Build pages from either explicit pages or single-page content string
        const newPages: EntryContent['pages'] = pages ?? [
          { id: crypto.randomUUID(), content: content ?? '', title: undefined },
        ]

        // Compute plain text
        const plainText = newPages
          .map(p => p.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
          .join(' ')
          .trim()

        scalarChanges.plainText = plainText

        // Save new version
        const newContentId = await db.entryContents.add({
          entryId: id,
          pages: newPages,
          createdAt: Date.now(),
        })

        latestContentId = newContentId
        scalarChanges.latestContentId = newContentId

        // Prune: keep only the 10 most recent versions
        const allVersions = await db.entryContents
          .where('entryId')
          .equals(id)
          .sortBy('createdAt')

        if (allVersions.length > 10) {
          const toDelete = allVersions.slice(0, allVersions.length - 10)
          await db.entryContents.bulkDelete(toDelete.map(v => v.id!))
        }
      }

      await db.diaryEntries.update(id, {
        ...scalarChanges,
        updatedAt: Date.now(),
      })
    }
  )
}

/**
 * Soft-deletes an entry by setting deletedAt timestamp.
 */
export async function deleteDiaryEntry(id: number): Promise<void> {
  await db.diaryEntries.update(id, { deletedAt: Date.now(), updatedAt: Date.now() })
}

/**
 * Permanently removes an entry and all associated records.
 */
export async function permanentlyDeleteEntry(id: number): Promise<void> {
  await db.transaction(
    'rw',
    [db.diaryEntries, db.diaryPhotos, db.entryContents, db.entryStickers, db.diaryAssets],
    async () => {
      await db.diaryEntries.delete(id)
      await db.diaryPhotos.where('entryId').equals(id).delete()
      await db.entryContents.where('entryId').equals(id).delete()
      await db.entryStickers.where('entryId').equals(id).delete()
      await db.diaryAssets.where('entryId').equals(id).delete()
    }
  )
}

/**
 * Restores a soft-deleted entry by clearing deletedAt.
 */
export async function restoreEntry(id: number): Promise<void> {
  await db.diaryEntries.update(id, { deletedAt: undefined, updatedAt: Date.now() })
}

// ---------------------------------------------------------------------------
// Entry queries
// ---------------------------------------------------------------------------

export async function getEntryByDate(date: string): Promise<DiaryEntry | undefined> {
  return db.diaryEntries
    .where('date')
    .equals(date)
    .filter(e => e.deletedAt === undefined || e.deletedAt === null)
    .first()
}

export async function getEntryDates(): Promise<string[]> {
  const entries = await db.diaryEntries
    .filter(e => e.deletedAt === undefined || e.deletedAt === null)
    .toArray()
  return entries.map(e => e.date).sort()
}

/**
 * Returns an entry together with its latest content pages.
 */
export async function getEntryWithContent(
  id: number
): Promise<{ entry: DiaryEntry; content: EntryContent | undefined } | undefined> {
  const entry = await db.diaryEntries.get(id)
  if (!entry) return undefined

  let content: EntryContent | undefined
  if (entry.latestContentId) {
    content = await db.entryContents.get(entry.latestContentId)
  }
  // Fallback: fetch the most recent content for this entry
  if (!content) {
    const versions = await db.entryContents
      .where('entryId')
      .equals(id)
      .sortBy('createdAt')
    content = versions[versions.length - 1]
  }

  return { entry, content }
}

export async function searchDiaryEntries(query: string): Promise<DiaryEntry[]> {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return db.diaryEntries
    .filter(entry => {
      if (entry.deletedAt) return false
      const text = (entry.plainText ?? '').toLowerCase()
      const title = (entry.title ?? '').toLowerCase()
      return title.includes(q) || text.includes(q)
    })
    .toArray()
}

// ---------------------------------------------------------------------------
// Stickers
// ---------------------------------------------------------------------------

/**
 * Adds a sticker to an entry. Idempotent — won't add duplicates.
 */
export async function addEntrySticker(entryId: number, stickerId: string): Promise<void> {
  const existing = await db.entryStickers
    .where('entryId')
    .equals(entryId)
    .filter(s => s.stickerId === stickerId)
    .first()
  if (!existing) {
    await db.entryStickers.add({ entryId, stickerId, createdAt: Date.now() })
  }
}

/**
 * Removes a specific sticker from an entry.
 */
export async function removeEntrySticker(entryId: number, stickerId: string): Promise<void> {
  await db.entryStickers
    .where('entryId')
    .equals(entryId)
    .filter(s => s.stickerId === stickerId)
    .delete()
}

export async function getEntryStickers(entryId: number): Promise<EntrySticker[]> {
  return db.entryStickers.where('entryId').equals(entryId).toArray()
}

// ---------------------------------------------------------------------------
// Assets (photos / audio)
// ---------------------------------------------------------------------------

export async function addDiaryAsset(asset: Omit<DiaryAsset, 'id'>): Promise<number> {
  return db.diaryAssets.add(asset)
}

export async function deleteDiaryAsset(id: number): Promise<void> {
  await db.diaryAssets.delete(id)
}

export async function getEntryAssets(entryId: number): Promise<DiaryAsset[]> {
  return db.diaryAssets
    .where('entryId')
    .equals(entryId)
    .sortBy('order')
}

// ---------------------------------------------------------------------------
// Legacy photo helpers (kept for backward compat)
// ---------------------------------------------------------------------------

export async function addDiaryPhoto(photo: Omit<DiaryPhoto, 'id'>): Promise<number> {
  return db.diaryPhotos.add(photo)
}

export async function deleteDiaryPhoto(id: number): Promise<void> {
  await db.diaryPhotos.delete(id)
}
