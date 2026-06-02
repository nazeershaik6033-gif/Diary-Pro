'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { subDays } from 'date-fns'
import { toDateString } from '@/lib/utils/date'
import { Sparkles, AlertCircle, Copy, BookOpen, ChevronDown, ChevronUp, Settings } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/layout/PageHeader'

interface DigestSection {
  overview: string
  themes: string[]
  moments: string[]
  reflection: string
}

function parseDigest(text: string): DigestSection {
  const overview = extractSection(text, ['week at a glance', 'overview', 'summary']) ?? text.slice(0, 300)
  const themes = extractList(text, ['key themes', 'themes', 'patterns'])
  const moments = extractList(text, ['memorable moments', 'highlights', 'moments'])
  const reflection = extractSection(text, ['reflection', 'reflect', 'question']) ?? ''
  return { overview, themes, moments, reflection }
}

function extractSection(text: string, headings: string[]): string | null {
  const lower = text.toLowerCase()
  for (const heading of headings) {
    const idx = lower.indexOf(heading)
    if (idx === -1) continue
    const afterHeading = text.slice(idx)
    const nextHeadingMatch = afterHeading.slice(heading.length).match(/\n#{1,3}\s|\n\*\*[A-Z]/)
    const end = nextHeadingMatch ? heading.length + nextHeadingMatch.index! : afterHeading.length
    return afterHeading.slice(heading.length, end).replace(/^[:\n*#\s]+/, '').trim()
  }
  return null
}

function extractList(text: string, headings: string[]): string[] {
  const section = extractSection(text, headings)
  if (!section) return []
  return section
    .split('\n')
    .map(l => l.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(l => l.length > 10)
    .slice(0, 4)
}

export default function DigestPage() {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawText, setRawText] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showEntries, setShowEntries] = useState(false)

  const settings = useLiveQuery(() => db.settings.get('singleton'))
  const apiKey = settings?.anthropicApiKey ?? ''

  const sevenDaysAgo = toDateString(subDays(new Date(), 6))
  const today = toDateString(new Date())

  const entries = useLiveQuery(() =>
    db.diaryEntries
      .where('date').between(sevenDaysAgo, today, true, true)
      .filter(e => !e.deletedAt)
      .reverse()
      .sortBy('date')
      .then(r => r.reverse()),
    [sevenDaysAgo, today]
  )

  const digest = rawText ? parseDigest(rawText) : null

  const generate = async () => {
    if (!apiKey || !entries) return
    setGenerating(true)
    setError(null)
    setRawText(null)

    const entryTexts = entries.map(e => {
      const snippet = (e.plainText ?? '').slice(0, 600).trim()
      return `[${e.date}] ${e.title || 'Untitled'}\n${snippet}`
    }).join('\n\n---\n\n')

    if (!entryTexts.trim()) {
      setError('No diary entries found for the past 7 days. Write some entries first!')
      setGenerating(false)
      return
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          system: 'You are a warm, thoughtful journaling companion. Analyse the diary entries and write a reflective weekly digest. Be concise, empathetic, and insightful. Use plain prose — no markdown headers. Structure your response in exactly four paragraphs separated by blank lines: (1) Week at a Glance — a warm summary paragraph, (2) Key Themes — three short bullet points starting with "•", (3) Memorable Moments — two to three quoted or paraphrased highlights starting with "•", (4) Reflection Prompt — one open question to journal about.',
          messages: [
            {
              role: 'user',
              content: `Here are my diary entries from the past 7 days:\n\n${entryTexts}\n\nPlease write my weekly digest.`,
            },
          ],
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? `API error ${res.status}`)
      }

      const data = await res.json()
      const text = data?.content?.[0]?.text ?? ''
      setRawText(text)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      if (msg.includes('401') || msg.includes('authentication')) {
        setError('Invalid API key. Check your key in Settings → AI Features.')
      } else {
        setError(msg)
      }
    } finally {
      setGenerating(false)
    }
  }

  const copyDigest = () => {
    if (!rawText) return
    navigator.clipboard.writeText(rawText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const saveAsEntry = async () => {
    if (!rawText) return
    const today = toDateString(new Date())
    const now = Date.now()
    await db.diaryEntries.add({
      date: today,
      title: `Weekly Digest — ${today}`,
      gratitude: ['', '', ''],
      tagIds: [],
      hasPhotos: false,
      starred: false,
      pinned: false,
      plainText: rawText,
      createdAt: now,
      updatedAt: now,
    })
  }

  const entryCount = entries?.length ?? 0

  return (
    <div>
      <PageHeader title="AI Digest" />
      <div className="px-4 pb-8 space-y-4">

        {/* Info card */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50 border border-violet-200">
          <Sparkles size={18} className="text-violet-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-sans font-semibold text-violet-800">Weekly AI Summary</p>
            <p className="text-xs font-sans text-violet-600 mt-0.5">
              Claude reads your last 7 days of diary entries and generates a thoughtful digest — themes, highlights, and a reflection prompt.
            </p>
          </div>
        </div>

        {/* Entries preview */}
        <div className="rounded-2xl border border-paper-400 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowEntries(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-paper-200 text-left"
          >
            <span className="text-sm font-sans font-medium text-ink">
              {entryCount === 0 ? 'No entries this week' : `${entryCount} entr${entryCount === 1 ? 'y' : 'ies'} this week`}
            </span>
            {showEntries ? <ChevronUp size={16} className="text-ink-300" /> : <ChevronDown size={16} className="text-ink-300" />}
          </button>
          {showEntries && entries && entries.length > 0 && (
            <div className="divide-y divide-paper-300">
              {entries.map(e => (
                <div key={e.id} className="px-4 py-2.5 flex items-center gap-2">
                  <BookOpen size={13} className="text-amber-warm flex-shrink-0" />
                  <span className="text-sm font-sans text-ink flex-1 truncate">{e.title || 'Untitled'}</span>
                  <span className="text-xs font-sans text-ink-300">{e.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* No API key state */}
        {!apiKey && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-faint border border-amber-warm/30">
            <AlertCircle size={16} className="text-amber-warm flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-sans font-medium text-amber-dark">API key required</p>
              <p className="text-xs font-sans text-amber-dark/80 mt-0.5">
                Add your Anthropic API key in Settings to enable AI features.
              </p>
              <Link href="/settings">
                <button className="mt-2 flex items-center gap-1 text-xs font-sans font-medium text-amber-warm">
                  <Settings size={12} /> Go to Settings
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          type="button"
          onClick={generate}
          disabled={!apiKey || generating || entryCount === 0}
          className={cn(
            'w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-sans font-semibold text-sm transition-all',
            apiKey && entryCount > 0
              ? 'bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.98]'
              : 'bg-paper-300 text-ink-300'
          )}
        >
          <Sparkles size={16} className={generating ? 'animate-pulse' : ''} />
          {generating ? 'Generating digest…' : digest ? 'Regenerate' : 'Generate Weekly Digest'}
        </button>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-sans text-red-700">{error}</p>
          </div>
        )}

        {/* Digest result */}
        {digest && (
          <div className="space-y-4">
            {/* Week at a glance */}
            <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200">
              <p className="text-xs font-sans font-semibold text-violet-500 uppercase tracking-wider mb-2">Week at a Glance</p>
              <p className="text-sm font-sans text-ink leading-relaxed">{digest.overview}</p>
            </div>

            {/* Key themes */}
            {digest.themes.length > 0 && (
              <div className="p-4 rounded-2xl bg-paper-200 border border-paper-400">
                <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-3">Key Themes</p>
                <ul className="space-y-2">
                  {digest.themes.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                      <span className="text-sm font-sans text-ink">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Memorable moments */}
            {digest.moments.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-faint border border-amber-warm/30">
                <p className="text-xs font-sans font-semibold text-amber-dark/60 uppercase tracking-wider mb-3">Memorable Moments</p>
                <ul className="space-y-2">
                  {digest.moments.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-warm mt-1.5 flex-shrink-0" />
                      <span className="text-sm font-sans text-amber-dark italic">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reflection prompt */}
            {digest.reflection && (
              <div className="p-4 rounded-2xl bg-paper-300 border border-paper-400">
                <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2">Reflection Prompt</p>
                <p className="text-sm font-serif text-ink italic leading-relaxed">"{digest.reflection}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyDigest}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-paper-400 text-sm font-sans text-ink-300 hover:bg-paper-300 transition-colors"
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy digest'}
              </button>
              <button
                type="button"
                onClick={saveAsEntry}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-warm text-white text-sm font-sans font-medium hover:bg-amber-dark transition-colors"
              >
                <BookOpen size={14} />
                Save as entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
