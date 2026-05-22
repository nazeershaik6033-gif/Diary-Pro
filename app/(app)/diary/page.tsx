'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Plus, BookOpen, Search, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DiaryEntryCard } from '@/components/diary/DiaryEntryCard'
import { StreakBanner } from '@/components/diary/StreakBanner'
import { CalendarView } from '@/components/diary/CalendarView'
import { EmptyState } from '@/components/shared/EmptyState'
import { toDateString, formatDisplay } from '@/lib/utils/date'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function DiaryPage() {
  const router = useRouter()
  const [showCalendar, setShowCalendar] = useState(false)
  const today = toDateString()

  const entries = useLiveQuery(
    () => db.diaryEntries.orderBy('date').reverse().limit(30).toArray(),
    []
  )

  const todayEntry = useLiveQuery(
    () => db.diaryEntries.where('date').equals(today).first(),
    [today]
  )

  return (
    <div className="pb-4">
      <div className="px-4 pt-2 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink">My Diary</h2>
          <p className="text-sm font-sans text-ink-300">{formatDisplay(today)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCalendar(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 transition-colors"
          >
            <Calendar size={18} className="text-ink-300" />
          </button>
          <Link href="/diary/search">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 transition-colors">
              <Search size={18} className="text-ink-300" />
            </button>
          </Link>
        </div>
      </div>

      <div className="px-4">
        <StreakBanner />

        {showCalendar && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <CalendarView />
          </motion.div>
        )}

        {!todayEntry && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-amber-faint border border-amber-warm/30 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="font-serif font-semibold text-ink text-base">Write today's entry</p>
              <p className="text-xs font-sans text-ink-300 mt-0.5">Capture your thoughts for {formatDisplay(today)}</p>
            </div>
            <Button size="sm" onClick={() => router.push('/diary/new')}>
              <Plus size={14} /> Write
            </Button>
          </motion.div>
        )}

        {entries === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-paper-300 animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No entries yet"
            description="Start your journaling journey today."
            action={<Button onClick={() => router.push('/diary/new')}><Plus size={16} /> Write First Entry</Button>}
          />
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <DiaryEntryCard entry={entry} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
