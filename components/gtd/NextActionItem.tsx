'use client'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, Trash2, Calendar } from 'lucide-react'
import type { GTDNextAction } from '@/types'
import { GTD_CONTEXT_CONFIG } from '@/types'
import { completeNextAction, deleteNextAction } from '@/lib/db/gtd'
import { cn } from '@/lib/utils/cn'

interface NextActionItemProps {
  action: GTDNextAction
}

export function NextActionItem({ action }: NextActionItemProps) {
  const ctx = GTD_CONTEXT_CONFIG[action.context]
  const isOverdue = action.dueDate && action.dueDate < new Date().toISOString().split('T')[0]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        'bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4 flex items-start gap-3',
        action.completed && 'opacity-50'
      )}
    >
      <button
        onClick={() => action.id && completeNextAction(action.id)}
        className="mt-0.5 flex-shrink-0"
        disabled={action.completed}
      >
        {action.completed
          ? <CheckCircle size={20} className="text-sage" />
          : <Circle size={20} className="text-ink-200" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('font-sans text-ink text-base leading-snug', action.completed && 'line-through text-ink-200')}>
          {action.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${ctx.color}`}>
            {action.context}
          </span>
          {action.dueDate && (
            <span className={cn('flex items-center gap-1 text-xs font-sans', isOverdue ? 'text-red-500' : 'text-ink-300')}>
              <Calendar size={10} />
              {action.dueDate}
            </span>
          )}
        </div>
      </div>

      {!action.completed && (
        <button onClick={() => action.id && deleteNextAction(action.id)} className="p-1 rounded-lg hover:bg-red-50">
          <Trash2 size={14} className="text-red-300" />
        </button>
      )}
    </motion.div>
  )
}
