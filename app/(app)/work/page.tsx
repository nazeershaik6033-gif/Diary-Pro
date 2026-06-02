'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { WorkEntryCard } from '@/components/work/WorkEntryCard'
import { WorkEntryForm } from '@/components/work/WorkEntryForm'
import { EmptyState } from '@/components/shared/EmptyState'
import { Briefcase, Plus } from 'lucide-react'
import { toDateString, formatDisplay, formatShort } from '@/lib/utils/date'
import { motion } from 'framer-motion'

export default function WorkPage() {
  const [addOpen, setAddOpen] = useState(false)
  const today = toDateString()

  const entries = useLiveQuery(
    () => db.workEntries.orderBy('createdAt').reverse().limit(50).toArray(),
    []
  )

  const todayEntries = (entries ?? []).filter(e => e.date === today)
  const pastEntries = (entries ?? []).filter(e => e.date !== today)

  const grouped = pastEntries.reduce<Record<string, typeof pastEntries>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = []
    acc[entry.date].push(entry)
    return acc
  }, {})

  return (
    <div className="px-4 pb-4">
      <div className="pt-2 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink">Work Log</h2>
          <p className="text-sm font-sans text-ink-300">{formatDisplay(today)}</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {entries === undefined ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-paper-300 animate-pulse" />)}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState icon={Briefcase} title="No entries yet" description="Log your tasks, meetings, wins, and blockers." action={
          <Button onClick={() => setAddOpen(true)}><Plus size={16} /> Add First Entry</Button>
        } />
      ) : (
        <div className="space-y-5">
          {todayEntries.length > 0 && (
            <div>
              <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wide mb-2">Today</p>
              <div className="space-y-2">
                {todayEntries.map((e, i) => (
                  <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <WorkEntryCard entry={e} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, dayEntries]) => (
            <div key={date}>
              <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wide mb-2">{formatShort(date)}</p>
              <div className="space-y-2">
                {dayEntries.map((e, i) => (
                  <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <WorkEntryCard entry={e} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add Work Entry">
        <WorkEntryForm onDone={() => setAddOpen(false)} />
      </Sheet>
    </div>
  )
}
