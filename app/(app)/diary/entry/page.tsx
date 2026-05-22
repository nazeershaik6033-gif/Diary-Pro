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
import { MOOD_CONFIG } from '@/types'
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
    () => db.diaryEntries.where('date').equals(date).first(),
    [date]
  )

  const photos = useLiveQuery(
    () => entry?.id ? db.diaryPhotos.where('entryId').equals(entry.id).toArray() : [],
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

  const mood = MOOD_CONFIG[entry.mood]

  const handleDelete = async () => {
    if (!entry.id) return
    await deleteDiaryEntry(entry.id)
    showToast('Entry deleted')
    router.replace('/diary')
  }

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
          <span className="text-3xl">{mood.emoji}</span>
          <div>
            <p className="font-serif font-bold text-ink text-xl">{entry.title || formatDay(date)}</p>
            <p className="text-sm font-sans text-ink-300 capitalize">{mood.label}</p>
          </div>
        </div>

        {entry.content && (
          <div
            className="prose prose-sm max-w-none font-sans text-ink leading-relaxed"
            dangerouslySetInnerHTML={{ __html: entry.content }}
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

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map(tag => (
              <span key={tag} className="text-xs font-sans text-amber-dark bg-amber-faint px-3 py-1 rounded-full">
                #{tag}
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
