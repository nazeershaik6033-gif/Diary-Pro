'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { Trophy } from 'lucide-react'
import { formatShort } from '@/lib/utils/date'
import { motion } from 'framer-motion'

export default function RecordsPage() {
  const records = useLiveQuery(() => db.personalRecords.orderBy('exerciseName').toArray(), [])

  return (
    <div>
      <PageHeader title="Personal Records" />
      <div className="px-4 space-y-2">
        {records === undefined ? (
          <div className="h-20 rounded-2xl bg-paper-300 animate-pulse" />
        ) : records.length === 0 ? (
          <EmptyState icon={Trophy} title="No records yet" description="Complete workouts to set personal records." />
        ) : (
          records.map((rec, i) => (
            <motion.div key={rec.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-faint flex items-center justify-center flex-shrink-0">
                  <Trophy size={18} className="text-amber-warm" />
                </div>
                <div className="flex-1">
                  <p className="font-sans font-medium text-ink">{rec.exerciseName}</p>
                  <p className="text-sm font-sans text-ink-400">{rec.weight}kg × {rec.reps} reps</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-sans text-amber-dark font-semibold">Est. 1RM</p>
                  <p className="text-base font-serif font-bold text-amber-warm">{rec.estimated1RM}kg</p>
                  <p className="text-xs font-sans text-ink-200">{formatShort(rec.date)}</p>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
