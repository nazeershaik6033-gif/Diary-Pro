'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Scale, BookOpen, Grid3X3 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { DecisionType, ProsConsData, JournalData, MatrixData } from '@/types/decisions'

const TYPE_OPTIONS: { type: DecisionType; icon: React.ElementType; label: string; desc: string }[] = [
  { type: 'proscons', icon: Scale,    label: 'Pros & Cons',     desc: 'Compare advantages and disadvantages with weighted scoring' },
  { type: 'journal',  icon: BookOpen, label: 'Decision Journal', desc: 'Log your reasoning and review outcomes later' },
  { type: 'matrix',   icon: Grid3X3,  label: 'Criteria Matrix',  desc: 'Score multiple options against weighted criteria' },
]

function defaultData(type: DecisionType): ProsConsData | JournalData | MatrixData {
  if (type === 'proscons') return { options: [{ name: 'Option A', pros: [], cons: [] }] }
  if (type === 'journal')  return { situation: '', options: [], reasoning: '', expectedOutcome: '', tags: [] }
  return { criteria: [], options: [], scores: {} }
}

export default function NewDecisionPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<DecisionType>('proscons')
  const { register, handleSubmit, formState: { errors } } = useForm<{ title: string; deadline: string }>()

  const onSubmit = async (data: { title: string; deadline: string }) => {
    await db.decisions.add({
      title: data.title,
      type: selectedType,
      status: 'exploring',
      deadline: data.deadline || undefined,
      data: defaultData(selectedType),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    router.back()
  }

  return (
    <div>
      <PageHeader title="New Decision" showBack />
      <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4 pb-8">
        <input
          {...register('title', { required: true })}
          placeholder="What are you deciding?"
          className={cn(
            'w-full rounded-xl border px-4 py-3 text-[16px] font-sans text-ink bg-white focus:outline-none focus:ring-2 focus:ring-amber-warm',
            errors.title ? 'border-red-400' : 'border-paper-400'
          )}
        />

        <div>
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2">Decision tool</p>
          <div className="space-y-2">
            {TYPE_OPTIONS.map(opt => {
              const Icon = opt.icon
              return (
                <button key={opt.type} type="button" onClick={() => setSelectedType(opt.type)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-colors',
                    selectedType === opt.type ? 'border-amber-warm bg-amber-faint' : 'border-paper-300 bg-white'
                  )}>
                  <Icon size={20} className={selectedType === opt.type ? 'text-amber-warm' : 'text-ink-300'} />
                  <div>
                    <p className={cn('font-sans font-semibold text-sm', selectedType === opt.type ? 'text-amber-dark' : 'text-ink')}>{opt.label}</p>
                    <p className="text-xs font-sans text-ink-300 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-sans text-ink-300 mb-1 block">Deadline (optional)</label>
          <input type="date" {...register('deadline')}
            className="w-full rounded-xl border border-paper-400 px-4 py-2.5 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm" />
        </div>

        <Button type="submit" fullWidth>Create Decision</Button>
      </form>
    </div>
  )
}
