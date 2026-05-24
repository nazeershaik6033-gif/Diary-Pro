'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { addBodyMetric } from '@/lib/db/gym'
import { toDateString } from '@/lib/utils/date'
import { useToast } from '@/app/contexts/ToastContext'
import type { BodyMetric } from '@/types'

const LBS_PER_KG = 2.20462

function kgToLbs(kg: string): string {
  const n = parseFloat(kg)
  return isNaN(n) ? '' : String(Math.round(n * LBS_PER_KG * 10) / 10)
}

function lbsToKg(lbs: string): string {
  const n = parseFloat(lbs)
  return isNaN(n) ? '' : String(Math.round(n / LBS_PER_KG * 10) / 10)
}

interface BodyMetricsFormProps {
  onDone: () => void
}

export function BodyMetricsForm({ onDone }: BodyMetricsFormProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [weightKg, setWeightKg] = useState('')
  const [weightLbs, setWeightLbs] = useState('')

  const { register, handleSubmit, setValue } = useForm<Partial<BodyMetric>>({
    defaultValues: { date: toDateString() },
  })

  function handleKgChange(v: string) {
    setWeightKg(v)
    setWeightLbs(kgToLbs(v))
    setValue('bodyWeight', v ? parseFloat(v) : undefined as unknown as number)
  }

  function handleLbsChange(v: string) {
    setWeightLbs(v)
    const kg = lbsToKg(v)
    setWeightKg(kg)
    setValue('bodyWeight', kg ? parseFloat(kg) : undefined as unknown as number)
  }

  const onSubmit = async (data: Partial<BodyMetric>) => {
    setLoading(true)
    try {
      await addBodyMetric({ ...data, date: data.date ?? toDateString() } as Omit<BodyMetric, 'id'>)
      showToast('Metrics saved')
      onDone()
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Body weight with live kg ↔ lbs conversion */}
      <div>
        <p className="text-xs font-sans font-medium text-ink-400 mb-1.5">Body Weight</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              type="number"
              value={weightKg}
              onChange={e => handleKgChange(e.target.value)}
              placeholder="e.g. 70"
              inputMode="decimal"
              className="w-full px-3 py-2.5 rounded-xl border border-paper-400 text-sm font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm bg-white pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans font-semibold text-amber-warm pointer-events-none">kg</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={weightLbs}
              onChange={e => handleLbsChange(e.target.value)}
              placeholder="e.g. 154"
              inputMode="decimal"
              className="w-full px-3 py-2.5 rounded-xl border border-paper-400 text-sm font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm bg-white pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans font-semibold text-amber-warm pointer-events-none">lbs</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input {...register('bodyFatPercent', { valueAsNumber: true })} type="number" label="Body Fat %" placeholder="15" inputMode="decimal" />
        <Input {...register('chestCm', { valueAsNumber: true })} type="number" label="Chest (cm)" placeholder="" inputMode="decimal" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input {...register('waistCm', { valueAsNumber: true })} type="number" label="Waist (cm)" placeholder="" inputMode="decimal" />
        <Input {...register('leftArmCm', { valueAsNumber: true })} type="number" label="Left Arm (cm)" placeholder="" inputMode="decimal" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input {...register('rightArmCm', { valueAsNumber: true })} type="number" label="Right Arm (cm)" placeholder="" inputMode="decimal" />
        <div />
      </div>
      <Button fullWidth type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Metrics'}</Button>
    </form>
  )
}
