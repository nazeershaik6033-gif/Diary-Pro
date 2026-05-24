'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { db } from '@/lib/db'
import { useHeader } from '@/app/contexts/HeaderContext'
import { useToast } from '@/app/contexts/ToastContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { TemplateCard } from '@/components/gym/TemplateCard'
import { TemplateEditorSheet } from '@/components/gym/TemplateEditorSheet'
import { EmptyState } from '@/components/shared/EmptyState'
import { AnimatePresence } from 'framer-motion'
import { Dumbbell, Plus } from 'lucide-react'
import type { WorkoutTemplate } from '@/types'

export default function TemplatesPage() {
  const templates = useLiveQuery(() => db.workoutTemplates.toArray(), [])
  const { setRightSlot } = useHeader()
  const { showToast } = useToast()
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | 'new' | null>(null)

  useEffect(() => {
    setRightSlot(
      <button
        onClick={() => setEditingTemplate('new')}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 text-ink-300 transition-colors"
        aria-label="New template"
      >
        <Plus size={20} />
      </button>
    )
    return () => setRightSlot(null)
  }, [setRightSlot])

  return (
    <div>
      <PageHeader title="Workout Templates" showBack />
      <div className="px-4 space-y-2 pb-8">
        {templates === undefined ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-paper-300 animate-pulse" />)}
          </div>
        ) : templates.length === 0 ? (
          <EmptyState icon={Dumbbell} title="No templates" />
        ) : (
          templates.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => setEditingTemplate(t)}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {editingTemplate !== null && (
          <TemplateEditorSheet
            template={editingTemplate === 'new' ? undefined : editingTemplate}
            onClose={() => setEditingTemplate(null)}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
