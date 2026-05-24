'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { db } from '@/lib/db'
import { useToast } from '@/app/contexts/ToastContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { TemplateEditorSheet } from '@/components/gym/TemplateEditorSheet'
import { WORKOUT_TYPE_CONFIG } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { Dumbbell, Trash2, Pencil } from 'lucide-react'

function TemplateDetailContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const router = useRouter()
  const { showToast } = useToast()
  const template = useLiveQuery(() => db.workoutTemplates.get(Number(id)), [id])
  const [editing, setEditing] = useState(false)

  if (template === undefined) return <div className="flex justify-center pt-20"><Spinner /></div>
  if (!template) return <div className="px-4 pt-8 text-center"><p className="text-ink-300">Template not found.</p></div>

  const typeConfig = WORKOUT_TYPE_CONFIG[template.type]

  const handleDelete = async () => {
    if (confirm('Delete this template?')) {
      await db.workoutTemplates.delete(template.id!)
      router.back()
    }
  }

  return (
    <div>
      <PageHeader title={template.name} showBack />
      <div className="px-4 space-y-4 pb-8">
        <div className="bg-white rounded-2xl shadow-warm border border-paper-300 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${typeConfig.color}`}>{typeConfig.label}</span>
            <span className="text-xs font-sans text-ink-300">{template.exercises.length} exercises</span>
          </div>

          <div className="space-y-3">
            {template.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-paper-300 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={14} className="text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium text-ink text-sm">{ex.exerciseName}</p>
                  <p className="text-xs font-sans text-ink-300">
                    {ex.sets} sets{ex.repsTarget ? ` × ${ex.repsTarget} reps` : ''}
                    {ex.weightTarget ? ` @ ${ex.weightTarget}kg` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => setEditing(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-paper-300 text-ink font-sans text-sm font-medium hover:bg-paper-400 transition-colors">
          <Pencil size={16} /> Edit Template
        </button>

        <button onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-red-500 border border-red-200 font-sans text-sm font-medium hover:bg-red-50 transition-colors">
          <Trash2 size={16} /> Delete Template
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <TemplateEditorSheet
            template={template}
            onClose={() => setEditing(false)}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TemplateDetailPage() {
  return <Suspense><TemplateDetailContent /></Suspense>
}
