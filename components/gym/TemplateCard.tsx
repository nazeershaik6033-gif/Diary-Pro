'use client'
import Link from 'next/link'
import type { WorkoutTemplate } from '@/types'
import { WORKOUT_TYPE_CONFIG } from '@/types'
import { Card } from '@/components/ui/Card'
import { ChevronRight, Dumbbell } from 'lucide-react'

interface TemplateCardProps {
  template: WorkoutTemplate
  onStart?: () => void
}

export function TemplateCard({ template, onStart }: TemplateCardProps) {
  const typeConfig = WORKOUT_TYPE_CONFIG[template.type]

  return (
    <Card className="p-4 flex items-center gap-3 hover:shadow-warm-md transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
        <Dumbbell size={18} className="text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans font-medium text-ink truncate">{template.name}</p>
        <p className="text-xs font-sans text-ink-300 mt-0.5">{template.exercises.length} exercises</p>
      </div>
      <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${typeConfig.color}`}>{typeConfig.label}</span>
      {onStart ? (
        <button onClick={onStart} className="bg-amber-warm text-white text-xs font-sans font-medium px-3 py-1.5 rounded-xl hover:bg-amber-dark transition-colors flex-shrink-0">
          Start
        </button>
      ) : (
        <Link href={`/gym/templates/${template.id}`}>
          <ChevronRight size={16} className="text-ink-200" />
        </Link>
      )}
    </Card>
  )
}
