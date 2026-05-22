'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { addBodyMetric } from '@/lib/db/gym'
import { toDateString } from '@/lib/utils/date'
import { useToast } from '@/app/contexts/ToastContext'
import type { BodyMetric } from '@/types'

interface BodyMetricsFormProps {
  onDone: () => void
}

export function BodyMetricsForm({ onDone }: BodyMetricsFormProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit } = useForm<Partial<BodyMetric>>({
    defaultValues: { date: toDateString() },
  })

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
      <div className="grid grid-cols-2 gap-3">
        <Input {...register('bodyWeight', { valueAsNumber: true })} type="number" label="Weight (kg)" placeholder="70" inputMode="decimal" />
        <Input {...register('bodyFatPercent', { valueAsNumber: true })} type="number" label="Body Fat %" placeholder="15" inputMode="decimal" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input {...register('chestCm', { valueAsNumber: true })} type="number" label="Chest (cm)" placeholder="" inputMode="decimal" />
        <Input {...register('waistCm', { valueAsNumber: true })} type="number" label="Waist (cm)" placeholder="" inputMode="decimal" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input {...register('leftArmCm', { valueAsNumber: true })} type="number" label="Left Arm (cm)" placeholder="" inputMode="decimal" />
        <Input {...register('rightArmCm', { valueAsNumber: true })} type="number" label="Right Arm (cm)" placeholder="" inputMode="decimal" />
      </div>
      <Button fullWidth type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Metrics'}</Button>
    </form>
  )
}
