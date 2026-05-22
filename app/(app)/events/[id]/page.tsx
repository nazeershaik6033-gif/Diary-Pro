'use client'
import { use } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { format, parseISO } from 'date-fns'
import { MapPin, Clock, RotateCcw, Users, Trash2 } from 'lucide-react'
import { EVENT_CATEGORY_CONFIG, RSVP_CONFIG } from '@/types/events'
import { cn } from '@/lib/utils/cn'

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const event = useLiveQuery(() => db.events.get(Number(id)), [id])

  if (!event) return null

  const cat = EVENT_CATEGORY_CONFIG[event.category]
  const rsvp = RSVP_CONFIG[event.rsvp]

  const handleDelete = async () => {
    if (confirm('Delete this event?')) {
      await db.events.delete(event.id!)
      router.back()
    }
  }

  return (
    <div>
      <PageHeader title="Event" showBack />
      <div className="px-4 space-y-4 pb-8">
        <div className="bg-white rounded-2xl shadow-warm border border-paper-300 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-serif font-bold text-ink">{event.title}</h2>
            <span className={cn('text-xs font-sans px-2.5 py-1 rounded-full flex-shrink-0', cat.badge)}>{cat.label}</span>
          </div>

          <div className="space-y-2.5 text-sm font-sans text-ink-300">
            <div className="flex items-center gap-2">
              <Clock size={14} className="flex-shrink-0" />
              <span>
                {event.allDay
                  ? format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')
                  : `${format(parseISO(event.startDate), 'EEEE, MMM d, yyyy')} · ${event.startTime ?? ''}${event.endTime ? ` – ${event.endTime}` : ''}`
                }
                {event.endDate && event.endDate !== event.startDate && ` → ${format(parseISO(event.endDate), 'MMM d')}`}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="flex-shrink-0" /> <span>{event.location}</span>
              </div>
            )}
            {event.recurring !== 'none' && (
              <div className="flex items-center gap-2">
                <RotateCcw size={14} className="flex-shrink-0" />
                <span>Repeats {event.recurring}{event.recurringEnd ? ` until ${format(parseISO(event.recurringEnd), 'MMM d, yyyy')}` : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users size={14} className="flex-shrink-0" />
              <span className={rsvp.color}>{rsvp.label}</span>
            </div>
          </div>

          {event.description && (
            <p className="text-sm font-sans text-ink border-t border-paper-300 pt-4">{event.description}</p>
          )}
          {event.notes && (
            <p className="text-sm font-sans text-ink-300 border-t border-paper-300 pt-4">{event.notes}</p>
          )}
        </div>

        <button onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-red-500 border border-red-200 font-sans text-sm font-medium">
          <Trash2 size={16} /> Delete Event
        </button>
      </div>
    </div>
  )
}
