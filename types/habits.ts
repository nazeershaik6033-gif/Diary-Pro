export type HabitColor = 'amber' | 'sage' | 'blush' | 'blue' | 'purple' | 'orange'
export type HabitIcon = 'droplets' | 'book' | 'dumbbell' | 'brain' | 'moon' | 'sun' | 'heart' | 'zap' | 'star' | 'check'

export const HABIT_COLORS: Record<HabitColor, { bg: string; ring: string; text: string }> = {
  amber:  { bg: 'bg-amber-faint', ring: '#C4933F', text: 'text-amber-dark' },
  sage:   { bg: 'bg-sage/10', ring: '#7a9e7e', text: 'text-sage-dark' },
  blush:  { bg: 'bg-blush/10', ring: '#c4857a', text: 'text-blush-dark' },
  blue:   { bg: 'bg-blue-50', ring: '#3b82f6', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', ring: '#9333ea', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', ring: '#f97316', text: 'text-orange-600' },
}

export interface Habit {
  id?: number
  name: string
  description?: string
  color: HabitColor
  icon: HabitIcon
  targetCount: number     // 1 for boolean, >1 for count (e.g. 8 glasses of water)
  unit?: string           // e.g. 'glasses', 'pages', 'minutes'
  active: boolean
  createdAt: number
}

export interface HabitLog {
  id?: number
  habitId: number
  date: string            // 'YYYY-MM-DD'
  count: number           // how many times done (1 for boolean check)
  createdAt: number
}

export const HABIT_TEMPLATES: Omit<Habit, 'id' | 'createdAt'>[] = [
  { name: 'Drink Water', description: '8 glasses per day', color: 'blue', icon: 'droplets', targetCount: 8, unit: 'glasses', active: true },
  { name: 'Read', description: '30 minutes of reading', color: 'amber', icon: 'book', targetCount: 1, unit: 'session', active: true },
  { name: 'Exercise', description: 'Any physical activity', color: 'orange', icon: 'dumbbell', targetCount: 1, unit: 'session', active: true },
  { name: 'Meditate', description: '10 minutes mindfulness', color: 'purple', icon: 'brain', targetCount: 1, unit: 'session', active: true },
  { name: 'Sleep by 10pm', description: 'Early to bed', color: 'blush', icon: 'moon', targetCount: 1, unit: 'night', active: true },
  { name: 'Morning Routine', description: 'Complete morning routine', color: 'sage', icon: 'sun', targetCount: 1, unit: 'session', active: true },
]
