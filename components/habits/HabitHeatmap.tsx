'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { HABIT_COLORS, type Habit } from '@/types'
import { cn } from '@/lib/utils/cn'

interface HabitHeatmapProps {
  habit: Habit
  weeks?: number
}

export function HabitHeatmap({ habit, weeks = 13 }: HabitHeatmapProps) {
  const endDate = new Date()
  const startDate = subDays(endDate, weeks * 7 - 1)
  const startStr = format(startDate, 'yyyy-MM-dd')
  const endStr = format(endDate, 'yyyy-MM-dd')

  const logs = useLiveQuery(
    () => habit.id
      ? db.habitLogs
          .where('habitId').equals(habit.id)
          .and(l => l.date >= startStr && l.date <= endStr)
          .toArray()
      : [],
    [habit.id, startStr, endStr]
  )

  const logMap = new Map((logs ?? []).map(l => [l.date, l.count]))
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const cfg = HABIT_COLORS[habit.color]

  const getOpacity = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const count = logMap.get(dateStr) ?? 0
    if (count === 0) return 0
    return Math.min(count / habit.targetCount, 1)
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-1" style={{ minWidth: weeks * 12 }}>
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} className="flex flex-col gap-1">
            {days.slice(w * 7, (w + 1) * 7).map(day => {
              const opacity = getOpacity(day)
              return (
                <div
                  key={day.toISOString()}
                  title={format(day, 'MMM d')}
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{
                    backgroundColor: opacity > 0
                      ? cfg.ring + Math.round(opacity * 255).toString(16).padStart(2, '0')
                      : '#ede3d0'
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
