export type EnergyLevel = 1 | 2 | 3 | 4 | 5

export const ENERGY_CONFIG: Record<EnergyLevel, { label: string; emoji: string; color: string }> = {
  1: { label: 'Exhausted', emoji: '😴', color: 'text-blush-dark' },
  2: { label: 'Tired', emoji: '😕', color: 'text-blush' },
  3: { label: 'Okay', emoji: '😐', color: 'text-ink-300' },
  4: { label: 'Good', emoji: '⚡', color: 'text-sage' },
  5: { label: 'Energized', emoji: '🔥', color: 'text-amber-warm' },
}

export interface HealthLog {
  id?: number
  date: string              // 'YYYY-MM-DD'
  time: string              // 'HH:MM' — multiple logs per day allowed
  energyLevel?: EnergyLevel
  mood?: number             // 1-5
  notes?: string
  createdAt: number
}

export interface SleepLog {
  id?: number
  date: string              // 'YYYY-MM-DD' — the date you wake up
  bedTime: string           // 'HH:MM'
  wakeTime: string          // 'HH:MM'
  durationHours?: number    // computed
  quality: 1 | 2 | 3 | 4 | 5
  notes?: string
  createdAt: number
}

export interface WaterLog {
  id?: number
  date: string              // 'YYYY-MM-DD'
  glasses: number           // total for the day
  goalGlasses: number       // default 8
}

export interface Supplement {
  id?: number
  name: string
  dosage?: string
  timing: 'morning' | 'afternoon' | 'evening' | 'with-meal'
  active: boolean
  createdAt: number
}

export interface SupplementLog {
  id?: number
  date: string              // 'YYYY-MM-DD'
  supplementId: number
  taken: boolean
  takenAt?: number
}
