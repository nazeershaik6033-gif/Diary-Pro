'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { type EventCategory, type EventRSVP, type RecurringType, EVENT_CATEGORY_CONFIG } from '@/types/events'
import { toDateString } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'

interface FormValues {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  allDay: boolean
  location: string
  category: EventCategory
  rsvp: EventRSVP
  recurring: RecurringType
  recurringEnd: string
  notes: string
}

export default function NewEventPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      startDate: toDateString(),
      category: 'personal',
      rsvp: 'pending',
      recurring: 'none',
      allDay: false,
    }
  })

  const allDay = watch('allDay')
  const recurring = watch('recurring')
  const category = watch('category')
  const rsvp = watch('rsvp')

  const onSubmit = async (data: FormValues) => {
    await db.events.add({
      title: data.title,
      description: data.description || undefined,
      startDate: data.startDate,
      startTime: data.allDay ? undefined : (data.startTime || undefined),
      endDate: data.endDate || undefined,
      endTime: data.allDay ? undefined : (data.endTime || undefined),
      allDay: data.allDay,
      location: data.location || undefined,
      category: data.category,
      rsvp: data.rsvp,
      recurring: data.recurring,
      recurringEnd: data.recurring !== 'none' ? (data.recurringEnd || undefined) : undefined,
      notes: data.notes || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    router.back()
  }

  const categories: EventCategory[] = ['personal', 'work', 'health', 'social']

  return (
    <div>
      <PageHeader title="New Event" showBack />
      <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4 pb-8">

        <input
          {...register('title', { required: true })}
          placeholder="Event title"
          className={cn(
            'w-full rounded-xl border px-4 py-3 text-[16px] font-sans text-ink bg-white focus:outline-none focus:ring-2 focus:ring-amber-warm',
            errors.title ? 'border-red-400' : 'border-paper-400'
          )}
        />

        <div className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-3">
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Category</p>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => {
              const cfg = EVENT_CATEGORY_CONFIG[cat]
              return (
                <label key={cat} className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer text-sm font-sans transition-colors',
                  category === cat ? `${cfg.badge} border-transparent` : 'border-paper-400 text-ink-300'
                )}>
                  <input type="radio" {...register('category')} value={cat} className="sr-only" />
                  <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                  {cfg.label}
                </label>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-3">
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Date & Time</p>
          <label className="flex items-center gap-3">
            <input type="checkbox" {...register('allDay')} className="w-4 h-4 accent-amber-warm" />
            <span className="font-sans text-sm text-ink">All day event</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-sans text-ink-300 mb-1 block">Start date *</label>
              <input type="date" {...register('startDate', { required: true })}
                className="w-full rounded-xl border border-paper-400 px-3 py-2 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm" />
            </div>
            {!allDay && (
              <div>
                <label className="text-xs font-sans text-ink-300 mb-1 block">Start time</label>
                <input type="time" {...register('startTime')}
                  className="w-full rounded-xl border border-paper-400 px-3 py-2 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm" />
              </div>
            )}
            <div>
              <label className="text-xs font-sans text-ink-300 mb-1 block">End date</label>
              <input type="date" {...register('endDate')}
                className="w-full rounded-xl border border-paper-400 px-3 py-2 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm" />
            </div>
            {!allDay && (
              <div>
                <label className="text-xs font-sans text-ink-300 mb-1 block">End time</label>
                <input type="time" {...register('endTime')}
                  className="w-full rounded-xl border border-paper-400 px-3 py-2 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-3">
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Details</p>
          <input {...register('location')} placeholder="Location (optional)"
            className="w-full rounded-xl border border-paper-400 px-4 py-2.5 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm" />
          <textarea {...register('description')} placeholder="Description (optional)" rows={2}
            className="w-full rounded-xl border border-paper-400 px-4 py-2.5 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm resize-none" />
        </div>

        <div className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-3">
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">RSVP</p>
          <div className="grid grid-cols-4 gap-2">
            {(['pending', 'yes', 'maybe', 'no'] as EventRSVP[]).map(r => (
              <label key={r}>
                <input type="radio" {...register('rsvp')} value={r} className="sr-only" />
                <div className={cn('py-2 rounded-xl border text-center text-xs font-sans cursor-pointer transition-colors',
                  rsvp === r ? 'bg-amber-warm text-white border-amber-warm' : 'border-paper-400 text-ink-300'
                )}>
                  {r === 'pending' ? 'TBD' : r === 'yes' ? '✓ Yes' : r === 'maybe' ? '? Maybe' : '✕ No'}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-3">
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Recurring</p>
          <select {...register('recurring')}
            className="w-full rounded-xl border border-paper-400 px-4 py-2.5 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm">
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {recurring !== 'none' && (
            <div>
              <label className="text-xs font-sans text-ink-300 mb-1 block">Repeat until</label>
              <input type="date" {...register('recurringEnd')}
                className="w-full rounded-xl border border-paper-400 px-4 py-2.5 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm" />
            </div>
          )}
        </div>

        <Button type="submit" fullWidth>Save Event</Button>
      </form>
    </div>
  )
}
