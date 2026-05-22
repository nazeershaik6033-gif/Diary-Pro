'use client'
import { useState } from 'react'
import { Trash2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ExerciseSetRowProps {
  setNumber: number
  reps: number
  weight: number
  isWarmup: boolean
  onLog: (reps: number, weight: number, isWarmup: boolean) => void
  onDelete?: () => void
  logged?: boolean
}

export function ExerciseSetRow({ setNumber, reps: defaultReps, weight: defaultWeight, isWarmup, onLog, onDelete, logged }: ExerciseSetRowProps) {
  const [reps, setReps] = useState(String(defaultReps || ''))
  const [weight, setWeight] = useState(String(defaultWeight || ''))
  const [warmup, setWarmup] = useState(isWarmup)

  return (
    <div className={cn('flex items-center gap-2 py-2 px-3 rounded-xl', logged ? 'bg-sage/10' : 'bg-paper-50 border border-paper-400')}>
      <span className="text-xs font-sans text-ink-300 w-5 text-center">{setNumber}</span>
      <input
        type="number"
        value={weight}
        onChange={e => setWeight(e.target.value)}
        placeholder="kg"
        className="w-16 text-center rounded-lg border border-paper-400 py-1.5 text-[16px] font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm bg-white"
        inputMode="decimal"
      />
      <span className="text-xs text-ink-200">×</span>
      <input
        type="number"
        value={reps}
        onChange={e => setReps(e.target.value)}
        placeholder="reps"
        className="w-16 text-center rounded-lg border border-paper-400 py-1.5 text-[16px] font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm bg-white"
        inputMode="numeric"
      />
      <button
        onClick={() => setWarmup(w => !w)}
        className={cn('text-xs font-sans px-2 py-1 rounded-full transition-colors', warmup ? 'bg-blue-100 text-blue-600' : 'bg-paper-300 text-ink-300')}
      >
        W
      </button>
      {!logged ? (
        <button
          onClick={() => onLog(Number(reps), Number(weight), warmup)}
          disabled={!reps || !weight}
          className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl bg-sage text-white disabled:opacity-40"
        >
          <CheckCircle size={16} />
        </button>
      ) : (
        <button onClick={onDelete} className="ml-auto">
          <Trash2 size={14} className="text-red-300" />
        </button>
      )}
    </div>
  )
}
