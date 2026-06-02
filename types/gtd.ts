export type GTDContext = '@home' | '@office' | '@phone' | '@computer' | '@errands' | '@anywhere'
export type GTDProjectStatus = 'active' | 'on-hold' | 'completed'
export type GTDEnergy = 'low' | 'medium' | 'high'

export const GTD_CONTEXTS: GTDContext[] = [
  '@anywhere', '@home', '@office', '@phone', '@computer', '@errands',
]

export const GTD_CONTEXT_CONFIG: Record<GTDContext, { label: string; color: string }> = {
  '@anywhere': { label: 'Anywhere', color: 'bg-paper-300 text-ink-400' },
  '@home': { label: 'Home', color: 'bg-sage/20 text-sage-dark' },
  '@office': { label: 'Office', color: 'bg-blue-50 text-blue-600' },
  '@phone': { label: 'Phone', color: 'bg-purple-50 text-purple-600' },
  '@computer': { label: 'Computer', color: 'bg-amber-faint text-amber-dark' },
  '@errands': { label: 'Errands', color: 'bg-orange-50 text-orange-600' },
}

export interface GTDInboxItem {
  id?: number
  content: string
  processed: boolean
  createdAt: number
}

export interface GTDProject {
  id?: number
  title: string
  description?: string
  status: GTDProjectStatus
  outcome?: string
  createdAt: number
  updatedAt: number
}

export interface GTDNextAction {
  id?: number
  title: string
  notes?: string
  context: GTDContext
  projectId?: number
  dueDate?: string // 'YYYY-MM-DD'
  completed: boolean
  completedAt?: number
  energy: GTDEnergy
  duration?: number // minutes
  createdAt: number
  updatedAt: number
}

export interface GTDWaitingFor {
  id?: number
  title: string
  delegatedTo: string
  dueDate?: string
  notes?: string
  completed: boolean
  createdAt: number
}

export interface GTDSomedayMaybe {
  id?: number
  title: string
  notes?: string
  category?: string
  createdAt: number
}

export interface GTDWeeklyReview {
  id?: number
  weekStartDate: string // 'YYYY-MM-DD' Monday
  steps: {
    collect: boolean
    process: boolean
    organize: boolean
    reflect: boolean
    engage: boolean
  }
  reflectionNotes: string
  topPriorities: [string, string, string]
  completedAt?: number
  createdAt: number
}
