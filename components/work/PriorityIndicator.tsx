import { PRIORITY_CONFIG, type Priority } from '@/types'

export function PriorityIndicator({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span className={`text-xs font-sans font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
