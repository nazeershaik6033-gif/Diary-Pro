'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDisplay } from '@/lib/utils/date'
import { toDateString } from '@/lib/utils/date'
import { ClipboardList, Inbox, CheckSquare, FolderOpen, Clock, Star, Trash2, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { subDays } from 'date-fns'

const AREA_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  'inbox':        { label: 'Inbox',         icon: Inbox,       color: 'text-orange-500', bg: 'bg-orange-50' },
  'next-actions': { label: 'Next Actions',  icon: CheckSquare, color: 'text-sage',       bg: 'bg-sage/10' },
  'projects':     { label: 'Projects',      icon: FolderOpen,  color: 'text-blue-500',   bg: 'bg-blue-50' },
  'waiting-for':  { label: 'Waiting For',   icon: Clock,       color: 'text-purple-500', bg: 'bg-purple-50' },
  'someday':      { label: 'Someday',       icon: Star,        color: 'text-amber-warm', bg: 'bg-amber-faint' },
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  created:   { label: 'Added',     icon: CheckSquare, color: 'text-emerald-500' },
  completed: { label: 'Completed', icon: CheckSquare, color: 'text-emerald-600' },
  deleted:   { label: 'Deleted',   icon: Trash2,      color: 'text-red-400' },
  processed: { label: 'Processed', icon: RefreshCw,   color: 'text-blue-500' },
}

const RANGE_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function GTDLogsPage() {
  const [rangeDays, setRangeDays] = useState(30)

  const logs = useLiveQuery(async () => {
    const cutoff = subDays(new Date(), rangeDays).getTime()
    const results = await db.gtdLogs.where('createdAt').above(cutoff).toArray()
    return results.sort((a, b) => b.createdAt - a.createdAt)
  }, [rangeDays])

  // Group by date
  const grouped = (logs ?? []).reduce<Record<string, typeof logs>>((acc, log) => {
    const d = log!.date
    if (!acc[d]) acc[d] = []
    acc[d]!.push(log)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const totalByArea = (logs ?? []).reduce<Record<string, number>>((acc, log) => {
    acc[log!.area] = (acc[log!.area] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <PageHeader title="GTD Logs" />

      <div className="px-4 pb-8">
        {/* Range selector */}
        <div className="flex gap-2 mb-4 mt-1">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.days}
              onClick={() => setRangeDays(opt.days)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors',
                rangeDays === opt.days
                  ? 'bg-amber-warm text-white'
                  : 'bg-paper-300 text-ink-300 hover:bg-paper-400'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Summary chips */}
        {logs && logs.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {Object.entries(totalByArea).map(([area, count]) => {
              const cfg = AREA_CONFIG[area]
              if (!cfg) return null
              const Icon = cfg.icon
              return (
                <div key={area} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium', cfg.bg, cfg.color)}>
                  <Icon size={12} />
                  {cfg.label}: {count}
                </div>
              )
            })}
          </div>
        )}

        {logs === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-paper-300 animate-pulse" />)}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No activity yet"
            description="GTD actions will appear here as you use the system."
          />
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date, di) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: di * 0.04 }}
              >
                <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2">
                  {date === toDateString() ? 'Today' : formatDisplay(date)}
                </p>
                <div className="space-y-2">
                  {grouped[date]!.map((log, li) => {
                    const areaCfg = AREA_CONFIG[log!.area] ?? { label: log!.area, icon: ClipboardList, color: 'text-ink-300', bg: 'bg-paper-300' }
                    const actionCfg = ACTION_CONFIG[log!.action] ?? { label: log!.action, icon: CheckSquare, color: 'text-ink-300' }
                    const ActionIcon = actionCfg.icon
                    const AreaIcon = areaCfg.icon

                    return (
                      <motion.div
                        key={log!.id ?? li}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: di * 0.04 + li * 0.03 }}
                        className="flex items-start gap-3 bg-white rounded-xl border border-paper-300 p-3"
                      >
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', areaCfg.bg)}>
                          <AreaIcon size={14} className={areaCfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <ActionIcon size={12} className={actionCfg.color} />
                            <span className={cn('text-xs font-sans font-semibold', actionCfg.color)}>{actionCfg.label}</span>
                            <span className="text-xs font-sans text-ink-200">·</span>
                            <span className="text-xs font-sans text-ink-300">{areaCfg.label}</span>
                          </div>
                          <p className="text-sm font-sans text-ink truncate">{log!.itemTitle}</p>
                        </div>
                        <span className="text-xs font-sans text-ink-200 flex-shrink-0 mt-0.5">{formatTime(log!.createdAt)}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
