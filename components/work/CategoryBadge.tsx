import { WORK_CATEGORY_CONFIG, type WorkCategory } from '@/types'

export function CategoryBadge({ category }: { category: WorkCategory }) {
  const config = WORK_CATEGORY_CONFIG[category]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sans font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
