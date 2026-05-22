'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { EmptyState } from '@/components/shared/EmptyState'
import { addProject } from '@/lib/db/gtd'
import { FolderOpen, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ProjectsPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [outcome, setOutcome] = useState('')

  const projects = useLiveQuery(
    () => db.gtdProjects.where('status').equals('active').toArray(),
    []
  )

  const handleAdd = async () => {
    if (!title.trim()) return
    const now = Date.now()
    await addProject({ title: title.trim(), outcome, status: 'active', createdAt: now, updatedAt: now })
    setTitle(''); setOutcome(''); setAddOpen(false)
  }

  return (
    <div>
      <PageHeader title="Projects" rightAction={
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} /> Add</Button>
      } />
      <div className="px-4 space-y-3">
        {projects === undefined ? (
          <div className="h-20 rounded-2xl bg-paper-300 animate-pulse" />
        ) : projects.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No projects" description="A project is any outcome requiring more than one action." />
        ) : (
          projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/gtd/projects/${p.id}`}>
                <Card className="p-4 flex items-center gap-3 hover:shadow-warm-md transition-shadow">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FolderOpen size={16} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-medium text-ink truncate">{p.title}</p>
                    {p.outcome && <p className="text-xs font-sans text-ink-300 truncate mt-0.5">{p.outcome}</p>}
                  </div>
                  <ChevronRight size={16} className="text-ink-200 flex-shrink-0" />
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="New Project">
        <div className="space-y-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Project name" />
          <Textarea value={outcome} onChange={e => setOutcome(e.target.value)} placeholder="What does success look like?" rows={3} />
          <Button fullWidth onClick={handleAdd} disabled={!title.trim()}>Create Project</Button>
        </div>
      </Sheet>
    </div>
  )
}
