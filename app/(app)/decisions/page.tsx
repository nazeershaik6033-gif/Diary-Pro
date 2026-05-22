'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import Link from 'next/link'
import { Plus, Scale, BookOpen, Grid3X3, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import type { DecisionType, Decision } from '@/types/decisions'

const TYPE_CONFIG: Record<DecisionType, { label: string; icon: React.ElementType; color: string }> = {
  proscons: { label: 'Pros & Cons',     icon: Scale,    color: 'text-amber-warm' },
  journal:  { label: 'Decision Log',    icon: BookOpen, color: 'text-sage' },
  matrix:   { label: 'Criteria Matrix', icon: Grid3X3,  color: 'text-blue-500' },
}

const STATUS_COLORS: Record<string, string> = {
  exploring: 'bg-amber-faint text-amber-dark',
  decided:   'bg-green-50 text-green-700',
  reviewing: 'bg-blue-50 text-blue-700',
  archived:  'bg-paper-300 text-ink-300',
}

function DecisionCard({ d }: { d: Decision }) {
  const cfg = TYPE_CONFIG[d.type]
  const Icon = cfg.icon
  return (
    <Link href={`/decisions/${d.id}`}>
      <div className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-paper-300 flex items-center justify-center flex-shrink-0">
            <Icon size={16} className={cfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-sans font-semibold text-ink truncate">{d.title}</p>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-sans capitalize', STATUS_COLORS[d.status])}>{d.status}</span>
            </div>
            <p className="text-xs font-sans text-ink-300 mt-0.5">{cfg.label}</p>
            {d.deadline && <p className="text-xs font-sans text-amber-dark mt-1">Due {d.deadline}</p>}
          </div>
          <ChevronRight size={16} className="text-ink-300 flex-shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  )
}

export default function DecisionsPage() {
  const [tab, setTab] = useState<DecisionType | 'all'>('all')
  const decisions = useLiveQuery(() => db.decisions.orderBy('createdAt').reverse().toArray())

  const filtered = (decisions ?? []).filter(d => tab === 'all' || d.type === tab)
  const active = filtered.filter(d => d.status !== 'archived')
  const archived = filtered.filter(d => d.status === 'archived')

  return (
    <div>
      <PageHeader title="Decisions" />
      <div className="px-4 space-y-4 pb-8">
        <Link href="/decisions/new">
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-warm text-white font-sans font-semibold text-sm">
            <Plus size={16} /> New Decision
          </button>
        </Link>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {(['all', 'proscons', 'journal', 'matrix'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('px-3 py-1.5 rounded-full text-sm font-sans flex-shrink-0 transition-colors',
                tab === t ? 'bg-amber-warm text-white' : 'bg-paper-300 text-ink-300'
              )}>
              {t === 'all' ? 'All' : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>

        {(decisions ?? []).length === 0 && (
          <div className="text-center py-12">
            <Scale size={32} className="mx-auto text-ink-300 mb-3" />
            <p className="text-ink-300 font-sans">No decisions yet</p>
            <p className="text-xs text-ink-300 mt-1 font-sans">Use pros/cons, a decision log, or a scoring matrix</p>
          </div>
        )}

        {active.length > 0 && (
          <div className="space-y-3">
            {active.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <DecisionCard d={d} />
              </motion.div>
            ))}
          </div>
        )}

        {archived.length > 0 && (
          <div>
            <h3 className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2 mt-2">Archived</h3>
            <div className="space-y-3">
              {archived.map(d => <DecisionCard key={d.id} d={d} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
