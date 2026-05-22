'use client'
import Link from 'next/link'
import { type DiaryEntry, MOOD_CONFIG } from '@/types'
import { formatDisplay, formatDay } from '@/lib/utils/date'
import { Card } from '@/components/ui/Card'

interface DiaryEntryCardProps {
  entry: DiaryEntry
}

export function DiaryEntryCard({ entry }: DiaryEntryCardProps) {
  const mood = MOOD_CONFIG[entry.mood]
  const preview = entry.content.replace(/<[^>]*>/g, ' ').trim().slice(0, 120)

  return (
    <Link href={`/diary/${entry.date}`}>
      <Card className="p-4 hover:shadow-warm-md transition-shadow active:scale-[0.99]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-sans text-ink-300">{formatDay(entry.date)}</p>
            <h3 className="font-serif font-semibold text-ink text-base leading-snug">
              {entry.title || formatDisplay(entry.date)}
            </h3>
          </div>
          <span className="text-xl ml-2">{mood.emoji}</span>
        </div>
        {preview && (
          <p className="text-sm font-sans text-ink-300 line-clamp-2 leading-relaxed">{preview}</p>
        )}
        {entry.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {entry.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs font-sans text-amber-dark bg-amber-faint px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Card>
    </Link>
  )
}
