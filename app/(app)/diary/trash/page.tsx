'use client'
import { Suspense } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { restoreEntry, permanentlyDeleteEntry } from '@/lib/db/diary'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { format, formatDistanceToNow } from 'date-fns'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DiaryEntry } from '@/types'

// ─── "Deleted X days ago" helper ─────────────────────────────────────────────
function deletedLabel(deletedAt: number): string {
  return formatDistanceToNow(new Date(deletedAt), { addSuffix: true })
}

// ─── Single trash card ────────────────────────────────────────────────────────
function TrashCard({ entry, index }: { entry: DiaryEntry; index: number }) {
  const displayTitle =
    entry.title?.trim() ||
    format(new Date(entry.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')

  const handleRestore = async () => {
    await restoreEntry(entry.id!)
  }

  const handleDelete = async () => {
    if (confirm(`Permanently delete "${displayTitle}"? This cannot be undone.`)) {
      await permanentlyDeleteEntry(entry.id!)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-ink text-base leading-snug truncate">
              {displayTitle}
            </h3>
            {entry.plainText && (
              <p className="text-sm font-sans text-ink-300 mt-0.5 line-clamp-2">
                {entry.plainText.slice(0, 120)}
                {entry.plainText.length > 120 ? '…' : ''}
              </p>
            )}
            <p className="text-xs font-sans text-ink-200 mt-1.5">
              Deleted {deletedLabel(entry.deletedAt!)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleRestore}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-sans font-medium text-amber-warm bg-amber-50 hover:bg-amber-100 rounded-xl py-2 transition-colors"
          >
            <RotateCcw size={14} />
            Restore
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-sans font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl py-2 transition-colors"
          >
            <Trash2 size={14} />
            Delete forever
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main page content ────────────────────────────────────────────────────────
function TrashContent() {
  const trashed = useLiveQuery(() =>
    db.diaryEntries
      .filter(e => !!e.deletedAt)
      .sortBy('deletedAt')
      .then(r => r.reverse())
  )

  const isLoading = trashed === undefined

  const handleEmptyTrash = async () => {
    if (!trashed?.length) return
    if (confirm(`Permanently delete all ${trashed.length} item(s) in trash? This cannot be undone.`)) {
      await Promise.all(trashed.map(e => permanentlyDeleteEntry(e.id!)))
    }
  }

  return (
    <div>
      <PageHeader
        title="Trash"
        rightAction={
          trashed && trashed.length > 0 ? (
            <button
              onClick={handleEmptyTrash}
              className="text-sm font-sans font-medium text-red-500 hover:text-red-600 transition-colors px-2 py-1"
            >
              Empty Trash
            </button>
          ) : undefined
        }
      />

      <div className="px-4 pb-8 space-y-3">
        {/* Auto-delete notice */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3"
        >
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm font-sans text-amber-800">
            Items in trash are automatically deleted after 30 days.
          </p>
        </motion.div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-amber-warm border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && trashed.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Trash2 size={48} className="text-ink-200 mb-4" />
            <p className="font-serif font-semibold text-lg text-ink">Trash is empty</p>
            <p className="text-sm font-sans text-ink-300 mt-1 max-w-xs">
              Deleted entries will appear here before being permanently removed.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {!isLoading && trashed.map((entry, i) => (
            <TrashCard key={entry.id} entry={entry} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Exported page ────────────────────────────────────────────────────────────
export default function TrashPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 rounded-full border-2 border-amber-warm border-t-transparent animate-spin" />
      </div>
    }>
      <TrashContent />
    </Suspense>
  )
}
