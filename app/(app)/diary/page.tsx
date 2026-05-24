'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Plus, BookOpen, Star, Bell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StreakBanner } from '@/components/diary/StreakBanner'
import { EmptyState } from '@/components/shared/EmptyState'
import { toDateString, formatDisplay, formatDay } from '@/lib/utils/date'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { STICKER_MAP } from '@/types/stickers'
import type { DiaryEntry } from '@/types'
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
    <div className="pb-4 px-4 pt-3">
      <StreakBanner />

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

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-paper-300 animate-pulse" />
          ))}
        </div>
      ) : displayEntries.length === 0 ? (
        <div>
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-3">{WEEK.label}</p>
          <EmptyState
            icon={BookOpen}
            title="No entries this week"
            description="Start writing — your first entry this week awaits."
            action={<Button onClick={() => router.push('/diary/new')}><Plus size={16} /> Write First Entry</Button>}
          />
        </div>
      ) : (
        <>
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-3">{WEEK.label}</p>
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
