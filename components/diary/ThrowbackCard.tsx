'use client'

import { STICKER_MAP } from '@/types/stickers'
import type { DiaryEntry, DiaryPage, EntrySticker } from '@/types/diary'
import { cn } from '@/lib/utils/cn'

interface ThrowbackCardProps {
  entry: DiaryEntry
  content: DiaryPage | null
  stickers: EntrySticker[]
}

const TONE_BORDER: Record<string, string> = {
  warm:     'border-l-amber-400',
  ocean:    'border-l-sky-400',
  forest:   'border-l-emerald-400',
  dark:     'border-l-slate-500',
  midnight: 'border-l-violet-400',
}

function yearsAgoLabel(dateStr: string): string {
  const entryYear = parseInt(dateStr.slice(0, 4), 10)
  const currentYear = new Date().getFullYear()
  const diff = currentYear - entryYear
  if (diff <= 0) return 'This year'
  return diff === 1 ? '1 year ago' : `${diff} years ago`
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Returns the first ~180 chars of plain text (roughly 2 lines). */
function excerpt(html: string, maxChars = 180): string {
  const text = stripHtml(html)
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars).replace(/\s\S*$/, '') + '…'
}

export function ThrowbackCard({ entry, content, stickers }: ThrowbackCardProps) {
  const hasTone = !!entry.colorTone
  const borderClass = hasTone ? TONE_BORDER[entry.colorTone!] ?? '' : ''

  const plainExcerpt = content ? excerpt(content.content) : ''

  const stickerEmojis = stickers
    .slice(0, 5)
    .map(s => STICKER_MAP[s.stickerId]?.emoji)
    .filter(Boolean)

  // Format entry date nicely: "Jan 15" or full date
  const formattedDate = (() => {
    try {
      return new Date(entry.date + 'T12:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return entry.date
    }
  })()

  return (
    <div
      className={cn(
        'rounded-2xl bg-white shadow-warm-sm border border-paper-300 overflow-hidden',
        hasTone && 'border-l-4',
        hasTone && borderClass
      )}
    >
      <div className="p-4 flex flex-col gap-2">
        {/* Header row: year badge + date */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-faint text-amber-dark text-xs font-sans font-semibold">
            {yearsAgoLabel(entry.date)}
          </span>
          <span className="text-xs font-sans text-ink-300">{formattedDate}</span>
        </div>

        {/* Title */}
        {entry.title ? (
          <h3 className="font-serif text-base font-semibold text-ink line-clamp-1">
            {entry.title}
          </h3>
        ) : (
          <h3 className="font-serif text-base font-semibold text-ink-300 italic line-clamp-1">
            Untitled entry
          </h3>
        )}

        {/* Excerpt */}
        {plainExcerpt && (
          <p className="text-sm font-sans text-ink-300 line-clamp-2 leading-relaxed">
            {plainExcerpt}
          </p>
        )}

        {/* Sticker emojis */}
        {stickerEmojis.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            {stickerEmojis.map((emoji, i) => (
              <span key={i} className="text-lg leading-none">
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
