'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Plus, BookOpen, Search, Calendar, Star, SlidersHorizontal, X, Bell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StreakBanner } from '@/components/diary/StreakBanner'
import { CalendarView } from '@/components/diary/CalendarView'
import { EmptyState } from '@/components/shared/EmptyState'
import { toDateString, formatDisplay, formatDay } from '@/lib/utils/date'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { STICKER_MAP } from '@/types/stickers'
import type { DiaryEntry } from '@/types'
import { useHeader } from '@/app/contexts/HeaderContext'
import { cn } from '@/lib/utils/cn'
import { startOfWeek, endOfWeek, getWeekOfMonth, format } from 'date-fns'

const TONE_BORDER: Record<string, string> = {
  warm:     'border-l-amber-400',
  ocean:    'border-l-sky-400',
  forest:   'border-l-emerald-400',
  dark:     'border-l-slate-500',
  midnight: 'border-l-violet-400',
}

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
  const hasUpcomingReminder = entry.reminderAt && entry.reminderAt > Date.now()

  return (
    <Link href={`/diary/entry?date=${entry.date}`}>
      <Card className={`p-4 hover:shadow-warm-md transition-shadow active:scale-[0.99] ${borderClass ? 'border-l-4 ' + borderClass : ''}`}>
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-sans text-ink-300">{formatDisplay(entry.date)} · {formatDay(entry.date)}</p>
            <h3 className="font-serif font-semibold text-ink text-base leading-snug truncate">
              {entry.title || formatDisplay(entry.date)}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            {hasUpcomingReminder && <Bell size={13} className="text-amber-warm" />}
            {entry.starred && <Star size={14} className="text-amber-400 fill-amber-400" />}
            {stickers && stickers.length > 0 && (
              <span className="text-lg leading-none">
                {stickers.map(s => STICKER_MAP[s.stickerId]?.emoji ?? '').join('')}
              </span>
            )}
          </div>
        </div>
        {preview && <p className="text-sm font-sans text-ink-300 line-clamp-2 leading-relaxed">{preview}</p>}
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

interface Filters {
  dateFrom: string
  dateTo: string
  starred: boolean
}

function getCurrentWeekBounds() {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const weekNum = getWeekOfMonth(today, { weekStartsOn: 1 })
  const label = `Week ${weekNum} of ${format(today, 'MMMM yyyy')}`
  return { from: toDateString(weekStart), to: toDateString(weekEnd), label }
}

const WEEK = getCurrentWeekBounds()

export default function DiaryPage() {
  const router = useRouter()
  const [showCalendar, setShowCalendar] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({ dateFrom: '', dateTo: '', starred: false })
  const { setRightSlot } = useHeader()
  const today = toDateString()

  const hasActiveFilters = !!(filters.dateFrom || filters.dateTo || filters.starred)

  // Logo click resets all local state
  useEffect(() => {
    const handler = () => {
      setFilters({ dateFrom: '', dateTo: '', starred: false })
      setShowCalendar(false)
      setShowFilters(false)
    }
    window.addEventListener('diary:reset', handler)
    return () => window.removeEventListener('diary:reset', handler)
  }, [])

  useEffect(() => {
    setRightSlot(
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowFilters(v => !v)}
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded-xl transition-colors',
            showFilters || hasActiveFilters ? 'bg-amber-warm/15 text-amber-warm' : 'hover:bg-paper-300 text-ink-300'
          )}
          aria-label="Filter entries"
        >
          <SlidersHorizontal size={17} />
        </button>
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
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 text-ink-300 transition-colors" aria-label="Search">
            <Search size={18} />
          </button>
        </Link>
      </div>
    )
    return () => setRightSlot(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRightSlot, showCalendar, showFilters, hasActiveFilters])

  // Default: show only this week's entries (Mon–Sun)
  const weekEntries = useLiveQuery(
    () => db.diaryEntries
      .where('date').between(WEEK.from, WEEK.to, true, true)
      .filter(e => !e.deletedAt)
      .sortBy('date')
      .then(r => r.reverse()),
    []
  )

  // When filters active: show all matching entries
  const filteredEntries = useLiveQuery(
    () => {
      if (!hasActiveFilters) return Promise.resolve(null)
      return db.diaryEntries.orderBy('date').reverse()
        .filter(e => {
          if (e.deletedAt) return false
          if (filters.dateFrom && e.date < filters.dateFrom) return false
          if (filters.dateTo && e.date > filters.dateTo) return false
          if (filters.starred && !e.starred) return false
          return true
        })
        .limit(200)
        .toArray()
    },
    [hasActiveFilters, filters.dateFrom, filters.dateTo, filters.starred]
  )

  const todayEntry = useLiveQuery(
    () => db.diaryEntries.where('date').equals(today).filter(e => !e.deletedAt).first(),
    [today]
  )

  const clearFilters = () => setFilters({ dateFrom: '', dateTo: '', starred: false })

  const displayEntries: DiaryEntry[] = hasActiveFilters ? ((filteredEntries as unknown as DiaryEntry[]) ?? []) : ((weekEntries as unknown as DiaryEntry[]) ?? [])
  const loading = hasActiveFilters ? filteredEntries === undefined : weekEntries === undefined

  const pinned = displayEntries.filter(e => e.pinned)
  const regular = displayEntries.filter(e => !e.pinned)

  return (
    <div className="pb-4 px-4 pt-3">
      <StreakBanner />

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white rounded-2xl border border-paper-400 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-sans font-semibold text-ink">Filter entries</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-amber-warm font-sans">
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-sans text-ink-300 block mb-1">From date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                    className="w-full rounded-xl border border-paper-400 px-3 py-2 text-sm font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm"
                  />
                </div>
                <div>
                  <label className="text-xs font-sans text-ink-300 block mb-1">To date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                    className="w-full rounded-xl border border-paper-400 px-3 py-2 text-sm font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.starred}
                  onChange={e => setFilters(f => ({ ...f, starred: e.target.checked }))}
                  className="w-4 h-4 rounded accent-amber-warm"
                />
                <span className="text-sm font-sans text-ink">Starred entries only</span>
                <Star size={14} className="text-amber-400" />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCalendar && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <CalendarView />
        </motion.div>
      )}

      {!todayEntry && !hasActiveFilters && (
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

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-paper-300 animate-pulse" />
          ))}
        </div>
      ) : displayEntries.length === 0 ? (
        <div>
          {!hasActiveFilters && (
            <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-3">{WEEK.label}</p>
          )}
          <EmptyState
            icon={BookOpen}
            title={hasActiveFilters ? 'No entries match' : 'No entries this week'}
            description={hasActiveFilters ? 'Try adjusting your filters.' : 'Start writing — your first entry this week awaits.'}
            action={!hasActiveFilters ? <Button onClick={() => router.push('/diary/new')}><Plus size={16} /> Write First Entry</Button> : undefined}
          />
        </div>
      ) : (
        <>
          {!hasActiveFilters && (
            <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-3">{WEEK.label}</p>
          )}
          {hasActiveFilters && (
            <p className="text-xs font-sans text-ink-300 mb-3">
              {displayEntries.length} {displayEntries.length === 1 ? 'entry' : 'entries'} found
            </p>
          )}
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
