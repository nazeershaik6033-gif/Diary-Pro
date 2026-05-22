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
import { addSomedayMaybe } from '@/lib/db/gtd'
import { Star, Plus, Trash2 } from 'lucide-react'

export default function SomedayPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')

  const items = useLiveQuery(() => db.gtdSomedayMaybe.orderBy('createdAt').reverse().toArray(), [])

  const handleAdd = async () => {
    if (!title.trim()) return
    await addSomedayMaybe({ title: title.trim(), createdAt: Date.now() })
    setTitle(''); setAddOpen(false)
  }

  return (
    <div>
      <PageHeader title="Someday Maybe" rightAction={
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} /> Add</Button>
      } />
      <div className="px-4 space-y-3">
        {items === undefined ? (
          <div className="h-16 rounded-2xl bg-paper-300 animate-pulse" />
        ) : items.length === 0 ? (
          <EmptyState icon={Star} title="No someday items" description="Future aspirations and ideas you might pursue one day." />
        ) : (
          items.map(item => (
            <Card key={item.id} className="p-4 flex items-center gap-3">
              <Star size={16} className="text-amber-warm flex-shrink-0" />
              <p className="flex-1 font-sans text-ink">{item.title}</p>
              <button onClick={() => item.id && db.gtdSomedayMaybe.delete(item.id)}>
                <Trash2 size={14} className="text-red-300 hover:text-red-500" />
              </button>
            </Card>
          ))
        )}
      </div>
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add Someday Maybe">
        <div className="space-y-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="What might you want to do someday?" />
          <Button fullWidth onClick={handleAdd} disabled={!title.trim()}>Add</Button>
        </div>
      </Sheet>
    </div>
  )
}
