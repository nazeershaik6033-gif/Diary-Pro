'use client'
import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchBar } from '@/components/shared/SearchBar'
import { DiaryEntryCard } from '@/components/diary/DiaryEntryCard'
import { searchDiaryEntries } from '@/lib/db/diary'
import type { DiaryEntry } from '@/types'
import { Search } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function DiarySearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DiaryEntry[]>([])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      const r = await searchDiaryEntries(query)
      setResults(r)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div>
      <PageHeader title="Search Diary" />
      <div className="px-4 space-y-4">
        <SearchBar value={query} onChange={setQuery} placeholder="Search entries, tags…" />
        {query && results.length === 0 && (
          <EmptyState icon={Search} title="No results" description={`Nothing found for "${query}"`} />
        )}
        <div className="space-y-3">
          {results.map(entry => <DiaryEntryCard key={entry.id} entry={entry} />)}
        </div>
      </div>
    </div>
  )
}
