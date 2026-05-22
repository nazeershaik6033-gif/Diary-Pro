export type EventCategory = 'personal' | 'work' | 'health' | 'social'
export type EventRSVP = 'yes' | 'no' | 'maybe' | 'pending'
export type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface CalendarEvent {
  id?: number
  title: string
  description?: string
  startDate: string
  startTime?: string
  endDate?: string
  endTime?: string
  allDay: boolean
  location?: string
  category: EventCategory
  rsvp: EventRSVP
  recurring: RecurringType
  recurringEnd?: string
  reminderMinutes?: number
  notes?: string
  createdAt: number
  updatedAt: number
}

export const EVENT_CATEGORY_CONFIG: Record<EventCategory, { label: string; dot: string; badge: string }> = {
  personal: { label: 'Personal', dot: 'bg-amber-warm', badge: 'bg-amber-faint text-amber-dark' },
  work:     { label: 'Work',     dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700' },
  health:   { label: 'Health',   dot: 'bg-blush',      badge: 'bg-red-50 text-blush-dark' },
  social:   { label: 'Social',   dot: 'bg-sage',       badge: 'bg-green-50 text-sage-dark' },
}

export const RSVP_CONFIG: Record<EventRSVP, { label: string; color: string }> = {
  yes:     { label: 'Going',     color: 'text-green-600' },
  no:      { label: 'Not going', color: 'text-red-500' },
  maybe:   { label: 'Maybe',     color: 'text-amber-warm' },
  pending: { label: 'Pending',   color: 'text-ink-300' },
}
