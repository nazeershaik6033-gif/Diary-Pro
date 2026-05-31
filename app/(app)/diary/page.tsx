'use client'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Plus, BookOpen, Star, Bell } from 'lucide-react'
import { StreakBanner } from '@/components/diary/StreakBanner'
import { toDateString, formatDisplay, formatDay } from '@/lib/utils/date'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { STICKER_MAP } from '@/types/stickers'
import type { DiaryEntry } from '@/types'
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
      <div className={`p-4 rounded-2xl neu-card transition-all active:scale-[0.99] ${borderClass ? 'border-l-4 ' + borderClass : ''}`}>
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-sans text-slate-400">{formatDisplay(entry.date)} · {formatDay(entry.date)}</p>
            <h3 className="font-serif font-semibold text-slate-100 text-base leading-snug truncate">
              {entry.title || formatDisplay(entry.date)}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            {hasUpcomingReminder && <Bell size={13} className="text-[#6b82c8]" />}
            {entry.starred && <Star size={14} className="text-[#6b82c8] fill-[#6b82c8]" />}
            {stickers && stickers.length > 0 && (
              <span className="text-lg leading-none">
                {stickers.map(s => STICKER_MAP[s.stickerId]?.emoji ?? '').join('')}
              </span>
            )}
          </div>
        </div>
        {preview && <p className="text-sm font-sans text-slate-400 line-clamp-2 leading-relaxed">{preview}</p>}
        {tags && tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {tags.slice(0, 3).map(tag => (
              <span key={tag!.id} className="text-xs font-sans text-[#6b82c8] bg-[#1e2244] px-2 py-0.5 rounded-full">
                #{tag!.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
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
  const today = toDateString()

  // Show only this week's entries (Mon–Sun)
  const weekEntries = useLiveQuery(
    () => db.diaryEntries
      .where('date').between(WEEK.from, WEEK.to, true, true)
      .filter(e => !e.deletedAt)
      .sortBy('date')
      .then(r => r.reverse()),
    []
  )

  const todayEntry = useLiveQuery(
    () => db.diaryEntries.where('date').equals(today).filter(e => !e.deletedAt).first(),
    [today]
  )

  const displayEntries: DiaryEntry[] = (weekEntries as unknown as DiaryEntry[]) ?? []
  const loading = weekEntries === undefined

  const pinned = displayEntries.filter(e => e.pinned)
  const regular = displayEntries.filter(e => !e.pinned)

  return (
    <div className="neu-surface min-h-screen pb-4 px-4 pt-3">
      <StreakBanner />

      {!todayEntry && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="neu-card rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="font-serif font-semibold text-slate-100 text-base">Write today&apos;s entry</p>
            <p className="text-xs font-sans text-slate-400 mt-0.5">Capture your thoughts for {formatDisplay(today)}</p>
          </div>
          <button
            className="neu-btn-blue text-sm font-sans font-medium px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
            onClick={() => router.push('/diary/new')}
          >
            <Plus size={14} /> Write
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#1c1c32] animate-pulse" />
          ))}
        </div>
      ) : displayEntries.length === 0 ? (
        <div>
          <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-3">{WEEK.label}</p>
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="neu-icon-pit w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-[#6b82c8]" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-slate-100 mb-2">No entries this week</h3>
            <p className="text-sm font-sans text-slate-400 mb-6 max-w-xs">Start writing — your first entry this week awaits.</p>
            <button
              className="neu-btn-blue text-base font-sans font-medium px-5 py-3 rounded-xl inline-flex items-center gap-2"
              onClick={() => router.push('/diary/new')}
            >
              <Plus size={16} /> Write First Entry
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-3">{WEEK.label}</p>
          {pinned.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
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
