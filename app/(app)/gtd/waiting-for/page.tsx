'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/shared/EmptyState'
import { addWaitingFor, completeWaitingFor } from '@/lib/db/gtd'
import { Clock, Plus, CheckCircle } from 'lucide-react'

export default function WaitingForPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [person, setPerson] = useState('')

  const items = useLiveQuery(() => db.gtdWaitingFor.where('completed').equals(0).toArray(), [])

  const handleAdd = async () => {
    if (!title.trim() || !person.trim()) return
    await addWaitingFor({ title: title.trim(), delegatedTo: person.trim(), completed: false, createdAt: Date.now() })
    setTitle(''); setPerson(''); setAddOpen(false)
  }

  return (
    <div>
      <PageHeader title="Waiting For" rightAction={
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} /> Add</Button>
      } />
      <div className="px-4 space-y-3">
        {items === undefined ? (
          <div className="h-16 rounded-2xl bg-paper-300 animate-pulse" />
        ) : items.length === 0 ? (
          <EmptyState icon={Clock} title="Nothing waiting" description="Items delegated to others live here." />
        ) : (
          items.map(item => (
            <Card key={item.id} className="p-4 flex items-center gap-3">
              <button onClick={() => item.id && completeWaitingFor(item.id)}>
                <CheckCircle size={20} className="text-ink-200 hover:text-sage transition-colors" />
              </button>
              <div className="flex-1">
                <p className="font-sans text-ink">{item.title}</p>
                <p className="text-xs font-sans text-ink-300 mt-0.5">Waiting for: <span className="font-medium text-purple-600">{item.delegatedTo}</span></p>
              </div>
            </Card>
          ))
        )}
      </div>
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add Waiting For">
        <div className="space-y-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you waiting for?" />
          <Input value={person} onChange={e => setPerson(e.target.value)} placeholder="Waiting for (person/team)…" />
          <Button fullWidth onClick={handleAdd} disabled={!title.trim() || !person.trim()}>Add</Button>
        </div>
      </Sheet>
    </div>
  )
}
