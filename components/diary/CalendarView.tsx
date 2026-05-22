'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getMonthDays, getCalendarPadding, toDateString, format } from '@/lib/utils/date'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function CalendarView() {
  const router = useRouter()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const entryDates = useLiveQuery(
    () => db.diaryEntries.orderBy('date').keys(),
    []
  ) as string[] | undefined

  const dateSet = new Set(entryDates ?? [])
  const days = getMonthDays(year, month)
  const padding = getCalendarPadding(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const monthLabel = format(new Date(year, month), 'MMMM yyyy')
  const todayStr = toDateString()

  return (
    <div className="bg-white rounded-2xl shadow-warm-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-paper-300 transition-colors">
          <ChevronLeft size={18} className="text-ink" />
        </button>
        <span className="font-serif font-semibold text-ink">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-paper-300 transition-colors">
          <ChevronRight size={18} className="text-ink" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-sans font-medium text-ink-200 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: padding }).map((_, i) => <div key={`p${i}`} />)}
        {days.map(day => {
          const dateStr = toDateString(day)
          const hasEntry = dateSet.has(dateStr)
          const isToday = dateStr === todayStr
          return (
            <button
              key={dateStr}
              onClick={() => hasEntry && router.push(`/diary/${dateStr}`)}
              className={cn(
                'relative mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-sans transition-colors',
                isToday && 'bg-amber-warm text-white font-semibold',
                !isToday && hasEntry && 'hover:bg-amber-faint text-ink font-medium',
                !isToday && !hasEntry && 'text-ink-200 cursor-default'
              )}
            >
              {day.getDate()}
              {hasEntry && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-warm" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
