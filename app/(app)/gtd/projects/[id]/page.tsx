'use client'
import { use } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { NextActionItem } from '@/components/gtd/NextActionItem'
import { EmptyState } from '@/components/shared/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { CheckSquare } from 'lucide-react'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const projectId = Number(id)

  const project = useLiveQuery(() => db.gtdProjects.get(projectId), [projectId])
  const actions = useLiveQuery(
    () => db.gtdNextActions.where('projectId').equals(projectId).toArray(),
    [projectId]
  )

  if (project === undefined) return <div className="flex justify-center pt-20"><Spinner /></div>

  return (
    <div>
      <PageHeader title={project?.title ?? 'Project'} />
      <div className="px-4">
        {project?.outcome && (
          <div className="bg-blue-50 rounded-xl p-3 mb-4">
            <p className="text-xs font-sans text-blue-600 font-medium mb-0.5">Desired Outcome</p>
            <p className="text-sm font-sans text-blue-700">{project.outcome}</p>
          </div>
        )}
        <p className="text-sm font-sans font-medium text-ink-400 mb-3">Next Actions</p>
        <div className="space-y-2">
          {!actions?.length
            ? <EmptyState icon={CheckSquare} title="No actions yet" description="Add next actions from the Next Actions page." />
            : actions.map(a => <NextActionItem key={a.id} action={a} />)
          }
        </div>
      </div>
    </div>
  )
}
