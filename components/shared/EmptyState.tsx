import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-paper-300 flex items-center justify-center mb-4">
        <Icon size={28} className="text-ink-200" />
      </div>
      <h3 className="text-lg font-serif font-semibold text-ink mb-2">{title}</h3>
      {description && <p className="text-sm font-sans text-ink-300 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}
