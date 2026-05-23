'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProcessCard } from '@/components/gtd/ProcessCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { GTDInboxItem } from '@/types'
import { Inbox, Trash2, ArrowRight, Clock, Pencil, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { timeAgo } from '@/lib/utils/date'
import { deleteInboxItem, processInboxItem, updateInboxItem } from '@/lib/db/gtd'
import { useToast } from '@/app/contexts/ToastContext'

function InboxCard({ item, onProcess }: { item: GTDInboxItem; onProcess: (item: GTDInboxItem) => void }) {
  const { showToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(item.content)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSaveEdit = async () => {
    if (!editText.trim()) return
    await updateInboxItem(item.id!, editText.trim())
    setEditing(false)
    showToast('Updated')
  }

  const handleDelete = async () => {
    await deleteInboxItem(item.id!)
    showToast('Deleted')
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4"
      >
        {editing ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-paper-400 px-3 py-2 text-sm font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} className="flex items-center gap-1 bg-amber-warm text-white text-xs font-sans px-3 py-1.5 rounded-xl">
                <Check size={12} /> Save
              </button>
              <button onClick={() => { setEditing(false); setEditText(item.content) }}
                className="text-xs font-sans text-ink-300 px-3 py-1.5 rounded-xl hover:bg-paper-300">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-sans text-ink text-base mb-3 leading-relaxed">{item.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-ink-200">
                <Clock size={11} />
                <span className="text-xs font-sans">{timeAgo(item.createdAt)}</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setEditing(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-paper-300 transition-colors"
                >
                  <Pencil size={13} className="text-ink-300" />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} className="text-red-400" />
                </button>
                <button
                  onClick={() => onProcess(item)}
                  className="flex items-center gap-1.5 bg-amber-warm text-white text-xs font-sans font-medium px-3 py-1.5 rounded-xl hover:bg-amber-dark transition-colors"
                >
                  Process <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="This inbox item will be permanently deleted."
        confirmLabel="Delete"
        danger
      />
    </>
  )
}

export default function InboxPage() {
  const [processing, setProcessing] = useState<GTDInboxItem | null>(null)

  // Fixed: use .filter() instead of .where('processed').equals(0)
  // IndexedDB boolean vs number comparison was causing items to not appear
  const items = useLiveQuery(
    () => db.gtdInbox.orderBy('createdAt').reverse().filter(item => !item.processed).toArray(),
    []
  )

  return (
    <div>
      <PageHeader title={`Inbox (${items?.length ?? 0})`} />
      <div className="px-4 space-y-3">
        {items === undefined ? (
          <div className="h-24 rounded-2xl bg-paper-300 animate-pulse" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Inbox is clear"
            description="Use the + button to capture anything on your mind."
          />
        ) : (
          <AnimatePresence>
            {items.map(item => (
              <InboxCard key={item.id} item={item} onProcess={setProcessing} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <Sheet open={!!processing} onClose={() => setProcessing(null)} title="Process Item">
        {processing && <ProcessCard item={processing} onDone={() => setProcessing(null)} />}
      </Sheet>
    </div>
  )
}
