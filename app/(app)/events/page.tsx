'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import Link from 'next/link'
import { Plus, MapPin, Clock, RotateCcw, Users } from 'lucide-react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { EVENT_CATEGORY_CONFIG, RSVP_CONFIG, type CalendarEvent } from '@/types/events'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

function EventCard({ event }: { event: CalendarEvent }) {
  const cat = EVENT_CATEGORY_CONFIG[event.category]
  const rsvp = RSVP_CONFIG[event.rsvp]
  const past = !isToday(parseISO(event.startDate)) && isPast(parseISO(event.startDate))

  return (
    <Link href={`/events/${event.id}`}>
      <div className={cn('bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4 space-y-2', past && 'opacity-60')}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', cat.dot)} />
            <p className="font-sans font-semibold text-ink truncate">{event.title}</p>
          </div>
          <span className={cn('text-xs font-sans px-2 py-0.5 rounded-full flex-shrink-0', cat.badge)}>{cat.label}</span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-sans text-ink-300">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {event.allDay
              ? format(parseISO(event.startDate), 'MMM d, yyyy')
              : `${format(parseISO(event.startDate), 'MMM d')} · ${event.startTime ?? ''}${event.endTime ? ` – ${event.endTime}` : ''}`
            }
          </span>
          {event.location && (
            <span className="flex items-center gap-1"><MapPin size={11} /> {event.location}</span>
          )}
          {event.recurring !== 'none' && (
            <span className="flex items-center gap-1"><RotateCcw size={11} /> {event.recurring}</span>
          )}
          {event.rsvp !== 'pending' && (
            <span className={cn('flex items-center gap-1', rsvp.color)}><Users size={11} /> {rsvp.label}</span>
          )}
        </div>

        {event.description && (
          <p className="text-sm font-sans text-ink-300 line-clamp-1">{event.description}</p>
        )}
      </div>
    </Link>
  )
}

export default function EventsPage() {
  const events = useLiveQuery(() => db.events.orderBy('startDate').toArray())
  const today = format(new Date(), 'yyyy-MM-dd')
  const upcoming = (events ?? []).filter(e => e.startDate >= today)
  const past = (events ?? []).filter(e => e.startDate < today).reverse()

  return (
    <div>
      <PageHeader title="Events" />
      <div className="px-4 space-y-4 pb-8">
        <Link href="/events/new">
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-warm text-white font-sans font-semibold text-sm">
            <Plus size={16} /> New Event
          </button>
        </Link>

        {(events ?? []).length === 0 && (
          <div className="text-center py-12">
            <p className="text-ink-300 font-sans">No events yet</p>
            <p className="text-xs text-ink-300 mt-1 font-sans">Tap + New Event to get started</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <h3 className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2">Upcoming</h3>
            <div className="space-y-3">
              {upcoming.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <EventCard event={e} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h3 className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2 mt-2">Past</h3>
            <div className="space-y-3">
              {past.slice(0, 10).map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <EventCard event={e} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
