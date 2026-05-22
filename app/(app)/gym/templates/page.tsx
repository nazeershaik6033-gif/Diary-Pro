'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { TemplateCard } from '@/components/gym/TemplateCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Dumbbell } from 'lucide-react'

export default function TemplatesPage() {
  const templates = useLiveQuery(() => db.workoutTemplates.toArray(), [])

  return (
    <div>
      <PageHeader title="Workout Templates" />
      <div className="px-4 space-y-2">
        {templates === undefined ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-paper-300 animate-pulse" />)}
          </div>
        ) : templates.length === 0 ? (
          <EmptyState icon={Dumbbell} title="No templates" />
        ) : (
          templates.map(t => <TemplateCard key={t.id} template={t} />)
        )}
      </div>
    </div>
  )
}
