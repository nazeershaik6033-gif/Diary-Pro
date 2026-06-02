export type WorkCategory = 'task' | 'meeting' | 'win' | 'blocker' | 'note'
export type Priority = 'low' | 'medium' | 'high' | 'critical'

export const WORK_CATEGORY_CONFIG: Record<WorkCategory, { label: string; color: string; icon: string }> = {
  task: { label: 'Task', color: 'bg-amber-faint text-amber-dark', icon: 'CheckSquare' },
  meeting: { label: 'Meeting', color: 'bg-blue-50 text-blue-600', icon: 'Users' },
  win: { label: 'Win', color: 'bg-green-50 text-green-600', icon: 'Trophy' },
  blocker: { label: 'Blocker', color: 'bg-red-50 text-red-600', icon: 'AlertTriangle' },
  note: { label: 'Note', color: 'bg-paper-300 text-ink-400', icon: 'FileText' },
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-ink-200' },
  medium: { label: 'Medium', color: 'text-amber-warm' },
  high: { label: 'High', color: 'text-orange-500' },
  critical: { label: 'Critical', color: 'text-red-600' },
}

export interface WorkEntry {
  id?: number
  date: string // 'YYYY-MM-DD'
  title: string
  content: string
  category: WorkCategory
  priority: Priority
  linkedActionId?: number
  createdAt: number
  updatedAt: number
}
