'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { NextActionItem } from '@/components/gtd/NextActionItem'
import { ContextFilter } from '@/components/gtd/ContextFilter'
import { EmptyState } from '@/components/shared/EmptyState'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { addNextAction } from '@/lib/db/gtd'
import type { GTDContext } from '@/types'
import { GTD_CONTEXTS } from '@/types'
import { CheckSquare, Plus } from 'lucide-react'
import { useToast } from '@/app/contexts/ToastContext'
import { AnimatePresence } from 'framer-motion'

export default function NextActionsPage() {
  const [filter, setFilter] = useState<GTDContext | 'all'>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [context, setContext] = useState<GTDContext>('@anywhere')
  const [dueDate, setDueDate] = useState('')
  const { showToast } = useToast()

  const actions = useLiveQuery(
    () => db.gtdNextActions.orderBy('createdAt').reverse().filter(a => !a.completed).toArray(),
    []
  )

  const filtered = filter === 'all' ? (actions ?? []) : (actions ?? []).filter(a => a.context === filter)

  const handleAdd = async () => {
    if (!title.trim()) return
    const now = Date.now()
    await addNextAction({
      title: title.trim(),
      context,
      dueDate: dueDate || undefined,
      completed: false,
      energy: 'medium',
      createdAt: now,
      updatedAt: now,
    })
    setTitle('')
    setDueDate('')
    setAddOpen(false)
    showToast('Action added')
  }

  return (
    <div>
      <PageHeader title="Next Actions" rightAction={
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} /> Add</Button>
      } />

      <div className="px-4 mb-4">
        <ContextFilter value={filter} onChange={setFilter} />
      </div>

      <div className="px-4 space-y-2">
        {actions === undefined ? (
          <div className="h-16 rounded-2xl bg-paper-300 animate-pulse" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={CheckSquare} title="No actions" description="Add your first next action." />
        ) : (
          <AnimatePresence>
            {filtered.map(action => <NextActionItem key={action.id} action={action} />)}
          </AnimatePresence>
        )}
      </div>

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add Next Action">
        <div className="space-y-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="What's the next physical action?" />
          <select
            value={context}
            onChange={e => setContext(e.target.value as GTDContext)}
            className="w-full rounded-xl border border-paper-400 px-4 py-3 text-[16px] font-sans text-ink bg-white focus:outline-none focus:ring-2 focus:ring-amber-warm"
          >
            {GTD_CONTEXTS.map(ctx => <option key={ctx} value={ctx}>{ctx}</option>)}
          </select>
          <Input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            placeholder="Due date (optional)"
            label="Due date (optional)"
          />
          <Button fullWidth onClick={handleAdd} disabled={!title.trim()}>Add Action</Button>
        </div>
      </Sheet>
    </div>
  )
}
