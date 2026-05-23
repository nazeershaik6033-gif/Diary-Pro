'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { ChevronLeft, ChevronRight, BookOpen, Dumbbell } from 'lucide-react'
import {
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameDay, isSameMonth, isToday, parseISO,
} from 'date-fns'
import { toDateString } from '@/lib/utils/date'
import { EVENT_CATEGORY_CONFIG } from '@/types/events'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

type View = 'month' | 'week' | 'day'

function useCalendarData(startDate: Date, endDate: Date) {
  const start = toDateString(startDate)
  const end = toDateString(endDate)

  const diaryDates = useLiveQuery(() =>
    db.diaryEntries.where('date').between(start, end, true, true).primaryKeys()
      .then(keys => db.diaryEntries.bulkGet(keys as number[]))
      .then(entries => entries.filter(Boolean).map(e => e!.date)),
    [start, end]
  )

  const events = useLiveQuery(() =>
    db.events.where('startDate').between(start, end, true, true).toArray(),
    [start, end]
  )

  const workoutDates = useLiveQuery(() =>
    db.workoutLogs.where('date').between(start, end, true, true).toArray()
      .then(logs => logs.map(l => l.date)),
    [start, end]
  )

  const habitLogs = useLiveQuery(() =>
    db.habitLogs.where('date').between(start, end, true, true).toArray(),
    [start, end]
  )

  const habits = useLiveQuery(() => db.habits.filter(h => !!h.active).toArray())

  return { diaryDates: diaryDates ?? [], events: events ?? [], workoutDates: workoutDates ?? [], habitLogs: habitLogs ?? [], habits: habits ?? [] }
}

// ── Month View ────────────────────────────────────────────────────
function MonthView({ current, onDaySelect }: { current: Date; onDaySelect: (d: Date) => void }) {
  const start = startOfMonth(current)
  const end = endOfMonth(current)
  const gridStart = startOfWeek(start, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(end, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const { diaryDates, events, workoutDates } = useCalendarData(gridStart, gridEnd)

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs font-sans text-ink-300 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(day => {
          const ds = toDateString(day)
          const hasDiary = diaryDates.includes(ds)
          const dayEvents = events.filter(e => e.startDate === ds)
          const hasWorkout = workoutDates.includes(ds)
          const today = isToday(day)
          const thisMonth = isSameMonth(day, current)

          return (
            <button
              key={ds}
              onClick={() => onDaySelect(day)}
              className={cn(
                'relative flex flex-col items-center py-1.5 rounded-xl min-h-[52px] transition-colors',
                !thisMonth && 'opacity-30',
                today ? 'bg-amber-warm' : 'hover:bg-paper-300'
              )}
            >
              <span className={cn('text-sm font-sans font-medium', today ? 'text-white' : 'text-ink')}>
                {format(day, 'd')}
              </span>
              <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-1">
                {hasDiary && <div className={cn('w-1.5 h-1.5 rounded-full', today ? 'bg-white/70' : 'bg-amber-warm')} />}
                {hasWorkout && <div className={cn('w-1.5 h-1.5 rounded-full', today ? 'bg-white/70' : 'bg-orange-400')} />}
                {dayEvents.slice(0, 2).map(e => (
                  <div key={e.id} className={cn('w-1.5 h-1.5 rounded-full', EVENT_CATEGORY_CONFIG[e.category].dot, today && 'opacity-70')} />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Week View ─────────────────────────────────────────────────────
function WeekView({ current, onDaySelect }: { current: Date; onDaySelect: (d: Date) => void }) {
  const start = startOfWeek(current, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start, end: addDays(start, 6) })
  const { diaryDates, events, workoutDates } = useCalendarData(start, addDays(start, 6))

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const ds = toDateString(day)
          const today = isToday(day)
          const dayEvents = events.filter(e => e.startDate === ds)
          const hasDiary = diaryDates.includes(ds)
          const hasWorkout = workoutDates.includes(ds)

          return (
            <button key={ds} onClick={() => onDaySelect(day)}
              className={cn('flex flex-col items-center gap-1 p-2 rounded-xl transition-colors',
                today ? 'bg-amber-warm' : 'hover:bg-paper-300'
              )}>
              <span className={cn('text-[10px] font-sans', today ? 'text-white/80' : 'text-ink-300')}>{format(day, 'EEE')}</span>
              <span className={cn('text-base font-sans font-semibold', today ? 'text-white' : 'text-ink')}>{format(day, 'd')}</span>
              <div className="flex gap-0.5 flex-wrap justify-center">
                {hasDiary && <div className={cn('w-1.5 h-1.5 rounded-full', today ? 'bg-white/70' : 'bg-amber-warm')} />}
                {hasWorkout && <div className={cn('w-1.5 h-1.5 rounded-full', today ? 'bg-white/70' : 'bg-orange-400')} />}
                {dayEvents.slice(0, 2).map(e => (
                  <div key={e.id} className={cn('w-1.5 h-1.5 rounded-full', EVENT_CATEGORY_CONFIG[e.category].dot)} />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <div className="space-y-1 mt-2">
        {days.map(day => {
          const ds = toDateString(day)
          const dayEvents = events.filter(e => e.startDate === ds)
          if (dayEvents.length === 0) return null
          return (
            <div key={ds}>
              <p className="text-xs font-sans text-ink-300 mb-1">{format(day, 'EEEE, MMM d')}</p>
              {dayEvents.map(e => (
                <Link key={e.id} href={`/events/detail?id=${e.id}`}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-paper-300 mb-1">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', EVENT_CATEGORY_CONFIG[e.category].dot)} />
                    <span className="text-sm font-sans text-ink truncate">{e.title}</span>
                    {e.startTime && <span className="text-xs font-sans text-ink-300 ml-auto">{e.startTime}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Day View ──────────────────────────────────────────────────────
function DayView({ current }: { current: Date }) {
  const ds = toDateString(current)
  const { events, workoutDates } = useCalendarData(current, current)

  const diaryEntry = useLiveQuery(() => db.diaryEntries.where('date').equals(ds).first(), [ds])
  const habits = useLiveQuery(() => db.habits.filter(h => !!h.active).toArray())
  const habitLogs = useLiveQuery(() => db.habitLogs.where('date').equals(ds).toArray(), [ds])

  const dayEvents = events.filter(e => e.startDate === ds)
  const hasWorkout = workoutDates.includes(ds)

  const timedEvents = dayEvents.filter(e => !e.allDay && e.startTime).sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
  const allDayEvents = dayEvents.filter(e => e.allDay || !e.startTime)

  return (
    <div className="space-y-3">
      {allDayEvents.length > 0 && (
        <div className="space-y-1">
          {allDayEvents.map(e => (
            <Link key={e.id} href={`/events/detail?id=${e.id}`}>
              <div className={cn('px-3 py-2 rounded-xl text-sm font-sans font-medium', EVENT_CATEGORY_CONFIG[e.category].badge)}>
                {e.title}
              </div>
            </Link>
          ))}
        </div>
      )}

      {diaryEntry && (
        <Link href={`/diary/entry?date=${ds}`}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-faint border border-amber-warm/30">
            <BookOpen size={16} className="text-amber-warm flex-shrink-0" />
            <div>
              <p className="text-sm font-sans font-semibold text-amber-dark">{diaryEntry.title || 'Diary Entry'}</p>
              <p className="text-xs font-sans text-amber-dark/70">Tap to read</p>
            </div>
          </div>
        </Link>
      )}

      {!diaryEntry && (
        <Link href={`/diary/new?date=${ds}`}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-paper-300 border border-paper-400 border-dashed">
            <BookOpen size={16} className="text-ink-300 flex-shrink-0" />
            <p className="text-sm font-sans text-ink-300">Write a diary entry</p>
          </div>
        </Link>
      )}

      {hasWorkout && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-orange-50 border border-orange-200">
          <Dumbbell size={16} className="text-orange-500 flex-shrink-0" />
          <p className="text-sm font-sans text-orange-700 font-medium">Workout logged</p>
        </div>
      )}

      {timedEvents.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Schedule</p>
          {timedEvents.map(e => (
            <Link key={e.id} href={`/events/detail?id=${e.id}`}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-paper-300">
                <div className={cn('w-2 h-full min-h-[20px] rounded-full flex-shrink-0', EVENT_CATEGORY_CONFIG[e.category].dot)} />
                <div className="flex-1">
                  <p className="text-sm font-sans text-ink font-medium">{e.title}</p>
                  <p className="text-xs font-sans text-ink-300">{e.startTime}{e.endTime ? ` – ${e.endTime}` : ''}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {habits && habits.length > 0 && (
        <div>
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2">Habits</p>
          <div className="space-y-1.5">
            {habits.map(h => {
              const logged = (habitLogs ?? []).filter(l => l.habitId === h.id)
              const done = logged.reduce((s, l) => s + (l.count ?? 1), 0) >= (h.targetCount ?? 1)
              return (
                <div key={h.id} className={cn('flex items-center gap-3 px-4 py-2.5 rounded-xl border',
                  done ? 'bg-green-50 border-green-200' : 'bg-paper-300 border-paper-400'
                )}>
                  <div className={cn('w-2 h-2 rounded-full', done ? 'bg-green-500' : 'bg-paper-400')} />
                  <span className="text-sm font-sans text-ink">{h.name}</span>
                  {done && <span className="ml-auto text-xs font-sans text-green-600">Done</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {dayEvents.length === 0 && !diaryEntry && !hasWorkout && (
        <div className="text-center py-8">
          <p className="text-ink-300 font-sans text-sm">Nothing scheduled</p>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function CalendarPage() {
  const [view, setView] = useState<View>('month')
  const [current, setCurrent] = useState(new Date())

  const title = view === 'month'
    ? format(current, 'MMMM yyyy')
    : view === 'week'
    ? `${format(startOfWeek(current, { weekStartsOn: 0 }), 'MMM d')} – ${format(endOfWeek(current, { weekStartsOn: 0 }), 'MMM d, yyyy')}`
    : format(current, 'EEEE, MMMM d')

  const prev = () => {
    if (view === 'month') setCurrent(d => subMonths(d, 1))
    else if (view === 'week') setCurrent(d => subWeeks(d, 1))
    else setCurrent(d => subDays(d, 1))
  }

  const next = () => {
    if (view === 'month') setCurrent(d => addMonths(d, 1))
    else if (view === 'week') setCurrent(d => addWeeks(d, 1))
    else setCurrent(d => addDays(d, 1))
  }

  const handleDaySelect = (day: Date) => {
    setCurrent(day)
    setView('day')
  }

  return (
    <div>
      <PageHeader title="Calendar" />
      <div className="px-4 space-y-4 pb-8">

        {/* View tabs */}
        <div className="flex gap-1 bg-paper-300 rounded-xl p-1">
          {(['month', 'week', 'day'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn('flex-1 py-1.5 rounded-lg text-sm font-sans font-medium capitalize transition-colors',
                view === v ? 'bg-white text-ink shadow-warm-sm' : 'text-ink-300'
              )}>{v}</button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prev} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 transition-colors">
            <ChevronLeft size={20} className="text-ink-300" />
          </button>
          <button onClick={() => setCurrent(new Date())}
            className="text-sm font-sans font-semibold text-ink px-3 py-1.5 rounded-lg hover:bg-paper-300 transition-colors">
            {title}
          </button>
          <button onClick={next} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 transition-colors">
            <ChevronRight size={20} className="text-ink-300" />
          </button>
        </div>

        {/* Legend */}
        {view === 'month' && (
          <div className="flex gap-3 flex-wrap">
            {[
              { dot: 'bg-amber-warm', label: 'Diary' },
              { dot: 'bg-orange-400', label: 'Workout' },
              { dot: 'bg-blue-500', label: 'Work event' },
              { dot: 'bg-purple-400', label: 'Personal' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className={cn('w-2 h-2 rounded-full', l.dot)} />
                <span className="text-xs font-sans text-ink-300">{l.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* View content */}
        {view === 'month' && <MonthView current={current} onDaySelect={handleDaySelect} />}
        {view === 'week'  && <WeekView  current={current} onDaySelect={handleDaySelect} />}
        {view === 'day'   && (
          <div>
            <h3 className="text-base font-serif font-bold text-ink mb-3">{format(current, 'EEEE, MMMM d')}</h3>
            <DayView current={current} />
          </div>
        )}
      </div>
    </div>
  )
}
