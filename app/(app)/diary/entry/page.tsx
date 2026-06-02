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
import type { EntrySticker } from '@/types/diary'
import { formatDisplay, formatDay } from '@/lib/utils/date'
import { deleteDiaryEntry } from '@/lib/db/diary'
import { useToast } from '@/app/contexts/ToastContext'
import { Trash2, Edit } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils/cn'

const TABS = ['Content', 'Learnings'] as const
type Tab = typeof TABS[number]

function DiaryEntryContent() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') ?? ''
  const router = useRouter()
  const { showToast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('Content')

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

  // Fix: query diaryAssets (photos migrated from diaryPhotos in v4)
  const photos = useLiveQuery(
    () => entry?.id
      ? db.diaryAssets.where('entryId').equals(entry.id).filter(a => a.type === 'photo').sortBy('order')
      : Promise.resolve([] as import('@/types').DiaryAsset[]),
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

  const htmlContent = entryContent?.pages?.[0]?.content ?? ''

  return (
    <div>
      <PageHeader
        title={formatDisplay(date)}
        rightAction={
          <div className="flex gap-1">
            <button
              onClick={() => router.push(`/diary/edit?date=${date}`)}
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

      <div className="px-4 pb-8">
      <div className="rounded-2xl space-y-4 px-4 py-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        {/* Date + stickers row */}
        <div className="flex items-center gap-2 pt-1">
          {stickers && stickers.length > 0 && (
            <span className="text-2xl leading-none">
              {stickers.map(s => STICKER_MAP[s.stickerId]?.emoji ?? '').join('')}
            </span>
          )}
          <p className="font-sans text-xs text-[#666]">{formatDay(date)}</p>
        </div>

        {/* Title */}
        <div style={{ borderBottom: '1px solid #1e1e1e', paddingBottom: 14 }}>
          <h1 className="font-serif font-bold text-white text-2xl leading-snug">
            {entry.title || formatDisplay(date)}
          </h1>
        </div>

        {/* Tabs — only show if there are learnings */}
        {entry.learnings && (
          <div className="flex gap-2 border-b border-[#222]">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'pb-2 px-1 text-sm font-sans font-medium border-b-2 transition-colors',
                  activeTab === tab
                    ? 'border-amber-warm text-amber-warm'
                    : 'border-transparent text-[#666]'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'Content' && htmlContent && (
          <div
            className="entry-prose"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {activeTab === 'Learnings' && entry.learnings && (
          <div
            className="entry-prose"
            dangerouslySetInnerHTML={{ __html: entry.learnings }}
          />
        )}

        {/* Gratitude */}
        {entry.gratitude.some(g => g) && (
          <div className="rounded-2xl p-4 space-y-2" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <p className="text-sm font-medium font-sans text-[#c4933f] mb-2">Gratitude</p>
            {entry.gratitude.map((g, i) => g ? (
              <p key={i} className="text-sm font-sans text-[#ccc] flex gap-2">
                <span className="text-[#c4933f]">♥</span> {g}
              </p>
            ) : null)}
          </div>
        )}

        {/* Photos */}
        {photos && photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map(photo => (
              <img key={photo.id} src={photo.data} alt="" className="w-full aspect-square object-cover rounded-xl" />
            ))}
          </div>
        )}

        {/* Tags */}
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
      </div>

      <style>{`
        .entry-prose { color: #d0d0d0; font-size: 15px; line-height: 1.8; }
        .entry-prose h1 { font-size: 1.5em; font-weight: 700; color: #fff; margin: 1em 0 0.4em; }
        .entry-prose h2 { font-size: 1.25em; font-weight: 600; color: #f0f0f0; margin: 0.9em 0 0.35em; }
        .entry-prose h3 { font-size: 1.05em; font-weight: 600; color: #e0e0e0; margin: 0.8em 0 0.3em; }
        .entry-prose p  { margin: 0.5em 0; }
        .entry-prose ul { list-style-type: disc;    padding-left: 1.6em; margin: 0.5em 0; }
        .entry-prose ol { list-style-type: decimal; padding-left: 1.6em; margin: 0.5em 0; }
        .entry-prose li { margin: 0.3em 0; }
        .entry-prose ul ul, .entry-prose ol ol,
        .entry-prose ul ol, .entry-prose ol ul { padding-left: 1.6em; }
        .entry-prose strong { color: #fff; font-weight: 600; }
        .entry-prose em { color: #e0d0b0; font-style: italic; }
        .entry-prose s  { color: #888; text-decoration: line-through; }
        .entry-prose code { background: #252525; border-radius: 4px; padding: 2px 5px; font-size: 0.88em; color: #e0b47a; }
        .entry-prose blockquote { border-left: 3px solid #c4933f; padding-left: 1em; color: #aaa; margin: 0.6em 0; }
        .entry-prose table { border-collapse: collapse; width: 100%; margin: 0.75em 0; }
        .entry-prose td, .entry-prose th { border: 1px solid #2a2a2a; padding: 6px 10px; vertical-align: top; }
        .entry-prose th { background: #1a1a1a; font-weight: 600; color: #fff; }
        .entry-prose [style*="text-align: center"] { text-align: center; }
        .entry-prose [style*="text-align: right"]  { text-align: right; }
      `}</style>

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
