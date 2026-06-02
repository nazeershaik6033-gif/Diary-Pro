import {
  format, parseISO, isToday, isYesterday, isSameDay,
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, getDay, differenceInCalendarDays,
  addDays, subDays, formatDistanceToNow,
} from 'date-fns'

export function toDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

export function fromDateString(dateStr: string): Date {
  return parseISO(dateStr)
}

export function formatDisplay(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

export function formatShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d')
}

export function formatDay(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE')
}

export function getMonthDays(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  return eachDayOfInterval({ start, end })
}

export function getCalendarPadding(year: number, month: number): number {
  const firstDay = startOfMonth(new Date(year, month))
  return getDay(firstDay)
}

export function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...dates].sort().reverse()
  const today = toDateString()
  const yesterday = toDateString(subDays(new Date(), 1))

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 1
  let prev = parseISO(sorted[0])
  for (let i = 1; i < sorted.length; i++) {
    const curr = parseISO(sorted[i])
    if (differenceInCalendarDays(prev, curr) === 1) {
      streak++
      prev = curr
    } else {
      break
    }
  }
  return streak
}

export function getWeekStart(date: Date = new Date()): string {
  return toDateString(startOfWeek(date, { weekStartsOn: 1 }))
}

export function timeAgo(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

export { format, parseISO, isToday, isSameDay, addDays, subDays }
