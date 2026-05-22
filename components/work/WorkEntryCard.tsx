'use client'
import { useState } from 'react'
import { type WorkEntry } from '@/types'
import { Card } from '@/components/ui/Card'
import { CategoryBadge } from './CategoryBadge'
import { PriorityIndicator } from './PriorityIndicator'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteWorkEntry } from '@/lib/db/work'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/app/contexts/ToastContext'

interface WorkEntryCardProps {
  entry: WorkEntry
}

export function WorkEntryCard({ entry }: WorkEntryCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { showToast } = useToast()
  const preview = entry.content.replace(/<[^>]*>/g, ' ').trim().slice(0, 100)

  const handleDelete = async () => {
    if (!entry.id) return
    await deleteWorkEntry(entry.id)
    showToast('Entry deleted')
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={entry.category} />
            <PriorityIndicator priority={entry.priority} />
          </div>
          <button onClick={() => setConfirmDelete(true)} className="p-1 rounded-lg hover:bg-red-50 flex-shrink-0">
            <Trash2 size={14} className="text-red-300" />
          </button>
        </div>
        <h3 className="font-sans font-medium text-ink text-base leading-snug mb-1">{entry.title}</h3>
        {preview && <p className="text-sm font-sans text-ink-300 line-clamp-2">{preview}</p>}
      </Card>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Entry"
        message="This work entry will be permanently deleted."
        confirmLabel="Delete"
        danger
      />
    </>
  )
}
