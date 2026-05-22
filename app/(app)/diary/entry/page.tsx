'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { STICKER_MAP } from '@/types/stickers'
import type { EntrySticker, DiaryPhoto } from '@/types/diary'
import { formatDisplay, formatDay } from '@/lib/utils/date'
import { deleteDiaryEntry } from '@/lib/db/diary'
import { useToast } from '@/app/contexts/ToastContext'
import { Trash2, Edit } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'

function DiaryEntryContent() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') ?? ''
  const router = useRouter()
  const { showToast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const entry = useLiveQuery(
    () => db.diaryEntries.where('date').equals(date).filter(e => !e.deletedAt).first(),
    [date]
  )

  const stickers = useLiveQuery(
    () => entry?.id ? db.entryStickers.where('entryId').equals(entry.id).toArray() : ([] as EntrySticker[]),
    [entry?.id]
  )

  const tags = useLiveQuery(async () => {
    if (!entry?.tagIds || entry.tagIds.length === 0) return []
    const results = await db.tags.bulkGet(entry.tagIds)
    return results.filter(Boolean)
  }, [entry?.tagIds?.join(',')])

  const entryContent = useLiveQuery(async () => {
    if (!entry?.latestContentId) return undefined
    return db.entryContents.get(entry.latestContentId)
  }, [entry?.latestContentId])

  const photos = useLiveQuery(
    () => entry?.id ? db.diaryPhotos.where('entryId').equals(entry.id).toArray() : ([] as DiaryPhoto[]),
    [entry?.id]
  )

  if (entry === undefined) {
    return <div className="flex justify-center pt-20"><Spinner /></div>
  }

  if (!entry) {
    return (
      <div>
        <PageHeader title={formatDisplay(date)} />
        <div className="flex flex-col items-center py-20 px-6">
          <p className="text-ink-300 font-sans mb-4">No entry for this date.</p>
          <Button onClick={() => router.push('/diary/new')}>Write Entry</Button>
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!entry.id) return
    await deleteDiaryEntry(entry.id)
    showToast('Entry deleted')
    router.replace('/diary')
  }

  // Get HTML content from the latest content record's first page
  const htmlContent = entryContent?.pages?.[0]?.content ?? ''

  return (
    <div>
      <PageHeader
        title={formatDisplay(date)}
        rightAction={
          <div className="flex gap-1">
            <button
              onClick={() => router.push(`/diary/${date}/edit`)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300"
            >
              <Edit size={18} className="text-ink-300" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50"
            >
              <Trash2 size={18} className="text-red-400" />
            </button>
          </div>
        }
      />

      <div className="px-4 space-y-5 pb-8">
        <div className="flex items-center gap-3">
          {stickers && stickers.length > 0 && (
            <span className="text-3xl leading-none">
              {stickers.map(s => STICKER_MAP[s.stickerId]?.emoji ?? '').join('')}
            </span>
          )}
          <div>
            <p className="font-serif font-bold text-ink text-xl">{entry.title || formatDay(date)}</p>
          </div>
        </div>

        {htmlContent && (
          <div
            className="prose prose-sm max-w-none font-sans text-ink leading-relaxed"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {entry.gratitude.some(g => g) && (
          <div className="bg-blush/10 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-medium font-sans text-blush-dark mb-2">Gratitude</p>
            {entry.gratitude.map((g, i) => g ? (
              <p key={i} className="text-sm font-sans text-ink-400 flex gap-2">
                <span className="text-blush">♥</span> {g}
              </p>
            ) : null)}
          </div>
        )}

        {photos && photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map(photo => (
              <img key={photo.id} src={photo.data} alt="" className="w-full aspect-square object-cover rounded-xl" />
            ))}
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag!.id} className="text-xs font-sans text-amber-dark bg-amber-faint px-3 py-1 rounded-full">
                #{tag!.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Entry"
        message="This entry will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}

export default function DiaryEntryPage() {
  return <Suspense><DiaryEntryContent /></Suspense>
}
