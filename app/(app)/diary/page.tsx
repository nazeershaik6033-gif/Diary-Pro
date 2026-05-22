'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Plus, BookOpen, Search, Calendar, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StreakBanner } from '@/components/diary/StreakBanner'
import { CalendarView } from '@/components/diary/CalendarView'
import { EmptyState } from '@/components/shared/EmptyState'
import { toDateString, formatDisplay, formatDay } from '@/lib/utils/date'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { STICKER_MAP } from '@/types/stickers'
import type { DiaryEntry } from '@/types'
import { useHeader } from '@/app/contexts/HeaderContext'
import { cn } from '@/lib/utils/cn'

// ---------------------------------------------------------------------------
// Color tone accent map
// ---------------------------------------------------------------------------
const TONE_BORDER: Record<string, string> = {
  warm:     'border-l-amber-400',
  ocean:    'border-l-sky-400',
  forest:   'border-l-emerald-400',
  dark:     'border-l-slate-500',
  midnight: 'border-l-violet-400',
}

// ---------------------------------------------------------------------------
// DiaryEntryCard — loads stickers & tags live per entry
// ---------------------------------------------------------------------------
function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  const stickers = useLiveQuery(
    () => db.entryStickers.where('entryId').equals(entry.id!).toArray(),
    [entry.id]
  )

  const tags = useLiveQuery(async () => {
    if (!entry.tagIds || entry.tagIds.length === 0) return []
    const results = await db.tags.bulkGet(entry.tagIds)
    return results.filter(Boolean)
  }, [entry.tagIds?.join(',')])

  const preview = (entry.plainText ?? '').slice(0, 80)
  const borderClass = entry.colorTone ? TONE_BORDER[entry.colorTone] : ''

  return (
    <Link href={`/diary/entry?date=${entry.date}`}>
      <Card className={`p-4 hover:shadow-warm-md transition-shadow active:scale-[0.99] ${borderClass ? 'border-l-4 ' + borderClass : ''}`}>
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-sans text-ink-300">{formatDay(entry.date)}</p>
            <h3 className="font-serif font-semibold text-ink text-base leading-snug truncate">
              {entry.title || formatDisplay(entry.date)}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            {entry.starred && (
              <Star size={14} className="text-amber-400 fill-amber-400" />
            )}
            {stickers && stickers.length > 0 && (
              <span className="text-lg leading-none">
                {stickers.map(s => STICKER_MAP[s.stickerId]?.emoji ?? '').join('')}
              </span>
            )}
          </div>
        </div>

        {preview && (
          <p className="text-sm font-sans text-ink-300 line-clamp-2 leading-relaxed">{preview}</p>
        )}

        {tags && tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {tags.slice(0, 3).map(tag => (
              <span key={tag!.id} className="text-xs font-sans text-amber-dark bg-amber-faint px-2 py-0.5 rounded-full">
                #{tag!.name}
              </span>
            ))}
          </div>
        )}
      </Card>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// DiaryPage
// ---------------------------------------------------------------------------
export default function DiaryPage() {
  const router = useRouter()
  const [showCalendar, setShowCalendar] = useState(false)
  const { setRightSlot } = useHeader()
  const today = toDateString()

  // Inject calendar + search icons into the global top bar
  useEffect(() => {
    setRightSlot(
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowCalendar(v => !v)}
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded-xl transition-colors',
            showCalendar ? 'bg-amber-warm/15 text-amber-warm' : 'hover:bg-paper-300 text-ink-300'
          )}
          aria-label="Toggle calendar"
        >
          <Calendar size={18} />
        </button>
        <Link href="/diary/search">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 text-ink-300 transition-colors" aria-label="Search entries">
            <Search size={18} />
          </button>
        </Link>
      </div>
    )
    return () => setRightSlot(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRightSlot, showCalendar])

  const allEntries = useLiveQuery(
    () => db.diaryEntries
      .orderBy('date')
      .reverse()
      .filter(e => !e.deletedAt)
      .limit(50)
      .toArray(),
    []
  )

  const todayEntry = useLiveQuery(
    () => db.diaryEntries
      .where('date').equals(today)
      .filter(e => !e.deletedAt)
      .first(),
    [today]
  )

  const pinned = allEntries?.filter(e => e.pinned) ?? []
  const regular = allEntries?.filter(e => !e.pinned) ?? []

  return (
    <div className="pb-4 px-4 pt-3">
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

      {allEntries === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-paper-300 animate-pulse" />
          ))}
        </div>
      ) : allEntries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No entries yet"
          description="Start your journaling journey today."
          action={<Button onClick={() => router.push('/diary/new')}><Plus size={16} /> Write First Entry</Button>}
        />
      ) : (
        <>
          {pinned.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>📌</span> Pinned
              </p>
              <div className="space-y-3">
                {pinned.map((entry, i) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <DiaryEntryCard entry={entry} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {regular.length > 0 && (
            <div className="space-y-3">
              {regular.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <DiaryEntryCard entry={entry} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
