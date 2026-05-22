'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchBar } from '@/components/shared/SearchBar'
import { Card } from '@/components/ui/Card'
import { searchDiaryEntries } from '@/lib/db/diary'
import { db } from '@/lib/db'
import type { DiaryEntry } from '@/types'
import { STICKER_MAP } from '@/types/stickers'
import { Search, Star } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import Link from 'next/link'
import { formatDay, formatDisplay } from '@/lib/utils/date'

// ---------------------------------------------------------------------------
// Highlight matching text in a snippet
// ---------------------------------------------------------------------------
function highlightSnippet(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim())
  if (idx === -1) return text.slice(0, 120)

  const start = Math.max(0, idx - 30)
  const end = Math.min(text.length, idx + query.length + 60)
  const before = (start > 0 ? '…' : '') + text.slice(start, idx)
  const match = text.slice(idx, idx + query.trim().length)
  const after = text.slice(idx + query.trim().length, end) + (end < text.length ? '…' : '')

  return (
    <>
      {before}
      <mark className="bg-amber-100 text-amber-900 rounded px-0.5">{match}</mark>
      {after}
    </>
  )
}

// ---------------------------------------------------------------------------
// SearchResultCard — loads stickers & tags live
// ---------------------------------------------------------------------------
function SearchResultCard({ entry, query }: { entry: DiaryEntry; query: string }) {
  const stickers = useLiveQuery(
    () => db.entryStickers.where('entryId').equals(entry.id!).toArray(),
    [entry.id]
  )

  const tags = useLiveQuery(async () => {
    if (!entry.tagIds || entry.tagIds.length === 0) return []
    const results = await db.tags.bulkGet(entry.tagIds)
    return results.filter(Boolean)
  }, [entry.tagIds?.join(',')])

  return (
    <Link href={`/diary/${entry.date}`}>
      <Card className="p-4 hover:shadow-warm-md transition-shadow active:scale-[0.99]">
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

        {entry.plainText && (
          <p className="text-sm font-sans text-ink-300 line-clamp-2 leading-relaxed">
            {highlightSnippet(entry.plainText, query)}
          </p>
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
// DiarySearchPage
// ---------------------------------------------------------------------------
export default function DiarySearchPage() {
  const [query, setQuery] = useState('')

  const results = useLiveQuery(
    () => query.trim() ? searchDiaryEntries(query) : Promise.resolve([]),
    [query]
  )

  return (
    <div>
      <PageHeader title="Search Diary" />
      <div className="px-4 space-y-4">
        <SearchBar value={query} onChange={setQuery} placeholder="Search entries, tags…" />
        {query.trim() && results !== undefined && results.length === 0 && (
          <EmptyState icon={Search} title="No results" description={`Nothing found for "${query}"`} />
        )}
        <div className="space-y-3">
          {(results ?? []).map(entry => (
            <SearchResultCard key={entry.id} entry={entry} query={query} />
          ))}
        </div>
      </div>
    </div>
  )
}
