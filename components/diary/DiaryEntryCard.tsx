'use client'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { type DiaryEntry } from '@/types'
import { STICKER_MAP } from '@/types/stickers'
import { formatDisplay, formatDay } from '@/lib/utils/date'
import { Card } from '@/components/ui/Card'
import { Star } from 'lucide-react'

const TONE_BORDER: Record<string, string> = {
  warm:     'border-l-amber-400',
  ocean:    'border-l-sky-400',
  forest:   'border-l-emerald-400',
  dark:     'border-l-slate-500',
  midnight: 'border-l-violet-400',
}

interface DiaryEntryCardProps {
  entry: DiaryEntry
}

export function DiaryEntryCard({ entry }: DiaryEntryCardProps) {
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
    <Link href={`/diary/${entry.date}`}>
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
