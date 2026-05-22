'use client'
import { Suspense } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { format, differenceInYears } from 'date-fns'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { STICKER_MAP } from '@/types/stickers'
import type { DiaryEntry, EntrySticker } from '@/types'

// ─── Color tone left-border map ───────────────────────────────────────────────
const COLOR_TONE_BORDER: Record<string, string> = {
  warm:     'border-l-amber-400',
  ocean:    'border-l-sky-400',
  forest:   'border-l-green-400',
  dark:     'border-l-slate-500',
  midnight: 'border-l-indigo-400',
}

// ─── "X years ago" helper ─────────────────────────────────────────────────────
function yearsAgoLabel(dateStr: string): string {
  const entryYear = parseInt(dateStr.slice(0, 4), 10)
  const currentYear = new Date().getFullYear()
  const diff = currentYear - entryYear
  if (diff === 0) return 'Earlier this year'
  if (diff === 1) return '1 year ago'
  return `${diff} years ago`
}

// ─── Stickers sub-component ──────────────────────────────────────────────────
function EntryStickers({ entryId }: { entryId: number }) {
  const stickers = useLiveQuery(
    () => db.entryStickers.where('entryId').equals(entryId).toArray(),
    [entryId]
  )
  if (!stickers?.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {stickers.map(s => {
        const def = STICKER_MAP[s.stickerId]
        if (!def) return null
        return (
          <span key={s.id} className="text-base" title={def.label}>
            {def.emoji}
          </span>
        )
      })}
    </div>
  )
}

// ─── Single entry card ────────────────────────────────────────────────────────
function ThrowbackCard({ entry, index }: { entry: DiaryEntry; index: number }) {
  const borderClass = entry.colorTone ? COLOR_TONE_BORDER[entry.colorTone] : undefined
  const displayTitle = entry.title?.trim() || format(new Date(entry.date + 'T00:00:00'), 'EEEE, MMMM d')
  const snippet = (entry.plainText ?? '').slice(0, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/diary/entry?date=${entry.date}`} className="block">
        <div
          className={[
            'bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4',
            'active:scale-[0.98] transition-transform',
            borderClass ? `border-l-4 ${borderClass}` : '',
          ].join(' ')}
        >
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-serif font-semibold text-ink text-base leading-snug flex-1">
              {displayTitle}
            </h3>
            <span className="shrink-0 text-xs font-sans font-medium text-amber-warm bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              {yearsAgoLabel(entry.date)}
            </span>
          </div>
          {snippet && (
            <p className="text-sm font-sans text-ink-300 leading-relaxed line-clamp-2">
              {snippet}{(entry.plainText ?? '').length > 100 ? '…' : ''}
            </p>
          )}
          <EntryStickers entryId={entry.id!} />
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Main page content ────────────────────────────────────────────────────────
function ThrowbackContent() {
  const todayMMDD = format(new Date(), 'MM-dd')
  const todayFormatted = format(new Date(), 'MMMM d')

  const entries = useLiveQuery(
    () =>
      db.diaryEntries
        .filter(e => e.date.slice(5) === todayMMDD && !e.deletedAt)
        .sortBy('date'),
    [todayMMDD]
  )

  const isLoading = entries === undefined

  return (
    <div>
      <PageHeader title={`On This Day — ${todayFormatted}`} />
      <div className="px-4 pb-8 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-amber-warm border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Clock size={48} className="text-ink-200 mb-4" />
            <p className="font-serif font-semibold text-lg text-ink">No memories yet</p>
            <p className="text-sm font-sans text-ink-300 mt-1 max-w-xs">
              No memories yet for today. Keep writing!
            </p>
          </motion.div>
        )}

        {!isLoading && entries.length > 0 && entries.map((entry, i) => (
          <ThrowbackCard key={entry.id} entry={entry} index={i} />
        ))}
      </div>
    </div>
  )
}

// ─── Exported page ────────────────────────────────────────────────────────────
export default function ThrowbackPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 rounded-full border-2 border-amber-warm border-t-transparent animate-spin" />
      </div>
    }>
      <ThrowbackContent />
    </Suspense>
  )
}
