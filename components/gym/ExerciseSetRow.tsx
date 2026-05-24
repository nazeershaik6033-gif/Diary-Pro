'use client'
import { useState } from 'react'
import { Trash2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const LBS_PER_KG = 2.20462

function kgToLbs(kg: string): string {
  const n = parseFloat(kg)
  return isNaN(n) ? '' : String(Math.round(n * LBS_PER_KG * 10) / 10)
}

function lbsToKg(lbs: string): string {
  const n = parseFloat(lbs)
  return isNaN(n) ? '' : String(Math.round(n / LBS_PER_KG * 10) / 10)
}

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
  const [weightLbs, setWeightLbs] = useState(defaultWeight ? kgToLbs(String(defaultWeight)) : '')
  const [warmup, setWarmup] = useState(isWarmup)

  function handleKgChange(v: string) {
    setWeight(v)
    setWeightLbs(kgToLbs(v))
  }

  function handleLbsChange(v: string) {
    setWeightLbs(v)
    setWeight(lbsToKg(v))
  }

  return (
    <div className={cn('flex items-center gap-2 py-2 px-3 rounded-xl', logged ? 'bg-sage/10' : 'bg-paper-50 border border-paper-400')}>
      <span className="text-xs font-sans text-ink-300 w-5 text-center flex-shrink-0">{setNumber}</span>

      {/* Weight: kg | lbs paired input */}
      <div className="flex items-center flex-shrink-0">
        <div className="relative">
          <input
            type="number"
            value={weight}
            onChange={e => handleKgChange(e.target.value)}
            placeholder="0"
            className="w-[52px] text-center rounded-l-lg border border-paper-400 border-r-0 py-1.5 text-[15px] font-sans text-ink focus:outline-none focus:z-10 focus:ring-2 focus:ring-amber-warm bg-white"
            inputMode="decimal"
          />
          <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] font-sans text-ink-300 pointer-events-none">kg</span>
        </div>
        <div className="relative">
          <input
            type="number"
            value={weightLbs}
            onChange={e => handleLbsChange(e.target.value)}
            placeholder="0"
            className="w-[52px] text-center rounded-r-lg border border-paper-400 py-1.5 text-[15px] font-sans text-ink focus:outline-none focus:z-10 focus:ring-2 focus:ring-amber-warm bg-white"
            inputMode="decimal"
          />
          <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] font-sans text-ink-300 pointer-events-none">lbs</span>
        </div>
      </div>

      <span className="text-xs text-ink-200 flex-shrink-0">×</span>
      <input
        type="number"
        value={reps}
        onChange={e => setReps(e.target.value)}
        placeholder="reps"
        className="w-14 text-center rounded-lg border border-paper-400 py-1.5 text-[16px] font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm bg-white flex-shrink-0"
        inputMode="numeric"
      />
      <button
        onClick={() => setWarmup(w => !w)}
        className={cn('text-xs font-sans px-2 py-1 rounded-full transition-colors flex-shrink-0', warmup ? 'bg-blue-100 text-blue-600' : 'bg-paper-300 text-ink-300')}
      >
        W
      </button>
      {!logged ? (
        <button
          onClick={() => onLog(Number(reps), Number(weight), warmup)}
          disabled={!reps || !weight}
          className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl bg-sage text-white disabled:opacity-40 flex-shrink-0"
        >
          <CheckCircle size={16} />
        </button>
      ) : (
        <button onClick={onDelete} className="ml-auto flex-shrink-0">
          <Trash2 size={14} className="text-red-300" />
        </button>
      )}
    </div>
  )
}
