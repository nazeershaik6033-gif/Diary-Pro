'use client'
import { GTD_CONTEXTS, GTD_CONTEXT_CONFIG, type GTDContext } from '@/types'
import { cn } from '@/lib/utils/cn'

interface ContextFilterProps {
  value: GTDContext | 'all'
  onChange: (ctx: GTDContext | 'all') => void
}

export function ContextFilter({ value, onChange }: ContextFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      <button
        onClick={() => onChange('all')}
        className={cn(
          'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-sans font-medium transition-colors',
          value === 'all' ? 'bg-ink text-white' : 'bg-paper-300 text-ink-400'
        )}
      >
        All
      </button>
      {GTD_CONTEXTS.map(ctx => {
        const config = GTD_CONTEXT_CONFIG[ctx]
        return (
          <button
            key={ctx}
            onClick={() => onChange(ctx)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-sans font-medium transition-colors',
              value === ctx ? 'bg-ink text-white' : `${config.color}`
            )}
          >
            {ctx}
          </button>
        )
      })}
    </div>
  )
}
