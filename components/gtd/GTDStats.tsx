'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Inbox, CheckSquare, Clock, Star } from 'lucide-react'

export function GTDStats() {
  const inboxCount = useLiveQuery(() => db.gtdInbox.where('processed').equals(0).count(), [])
  const activeActionsCount = useLiveQuery(() => db.gtdNextActions.where('completed').equals(0).count(), [])
  const waitingCount = useLiveQuery(() => db.gtdWaitingFor.where('completed').equals(0).count(), [])
  const somedayCount = useLiveQuery(() => db.gtdSomedayMaybe.count(), [])

  const stats = [
    { label: 'Inbox', count: inboxCount ?? 0, icon: Inbox, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Actions', count: activeActionsCount ?? 0, icon: CheckSquare, color: 'text-sage', bg: 'bg-sage/10' },
    { label: 'Waiting', count: waitingCount ?? 0, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Someday', count: somedayCount ?? 0, icon: Star, color: 'text-amber-warm', bg: 'bg-amber-faint' },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map(stat => (
        <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
          <stat.icon size={16} className={`${stat.color} mx-auto mb-1`} />
          <p className={`text-lg font-serif font-bold ${stat.color}`}>{stat.count}</p>
          <p className="text-xs font-sans text-ink-300">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
