export type GoalTier = '1year' | '5year' | 'life'

export const GOAL_TIER_CONFIG: Record<GoalTier, { label: string; color: string; bg: string; desc: string }> = {
  '1year': { label: '1-Year Goal', color: 'text-amber-dark', bg: 'bg-amber-faint', desc: 'Achievable this year' },
  '5year': { label: '5-Year Goal', color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Medium-term vision' },
  'life':  { label: 'Lifetime Goal', color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Your ultimate aspirations' },
}

export interface GoalMilestone {
  id?: number
  goalId: number
  title: string
  completed: boolean
  completedAt?: number
  order: number
}

export interface Goal {
  id?: number
  title: string
  description?: string
  tier: GoalTier
  affirmation?: string        // daily affirmation statement
  photos: string[]            // base64 data URLs
  createdAt: number
  updatedAt: number
}

export interface DailyAffirmation {
  id?: number
  text: string
  active: boolean
  createdAt: number
}
