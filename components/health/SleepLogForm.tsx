'use client'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { logSleep, computeSleepDuration } from '@/lib/db/health'
import { useToast } from '@/app/contexts/ToastContext'
import { toDateString } from '@/lib/utils/date'

interface FormValues {
  date: string
  bedTime: string
  wakeTime: string
  quality: number
  notes: string
}

interface SleepLogFormProps {
  onDone: () => void
}

export function SleepLogForm({ onDone }: SleepLogFormProps) {
  const { showToast } = useToast()
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: { date: toDateString(), bedTime: '23:00', wakeTime: '07:00', quality: 3, notes: '' },
  })

  const bedTime = watch('bedTime')
  const wakeTime = watch('wakeTime')
  const duration = bedTime && wakeTime ? computeSleepDuration(bedTime, wakeTime) : null

  const onSubmit = async (data: FormValues) => {
    await logSleep({
      date: data.date,
      bedTime: data.bedTime,
      wakeTime: data.wakeTime,
      durationHours: computeSleepDuration(data.bedTime, data.wakeTime),
      quality: Number(data.quality) as 1 | 2 | 3 | 4 | 5,
      notes: data.notes || undefined,
      createdAt: Date.now(),
    })
    showToast('Sleep logged')
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input {...register('bedTime')} type="time" label="Bed time" />
        <Input {...register('wakeTime')} type="time" label="Wake time" />
      </div>
      {duration && (
        <div className="text-center py-2 bg-purple-50 rounded-xl">
          <span className="text-lg font-serif font-bold text-purple-700">{duration}h</span>
          <span className="text-sm font-sans text-purple-500 ml-1">sleep duration</span>
        </div>
      )}
      <div>
        <label className="text-sm font-medium font-sans text-ink-400 block mb-1">Quality (1-5)</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(n => (
            <label key={n} className="flex-1">
              <input type="radio" {...register('quality')} value={n} className="sr-only" />
              <div className="text-center py-2 rounded-xl border border-paper-400 cursor-pointer text-sm font-sans hover:bg-amber-faint transition-colors">
                {['😴','😕','😐','🙂','😄'][n-1]}
              </div>
            </label>
          ))}
        </div>
      </div>
      <Input {...register('notes')} placeholder="Any notes…" />
      <Button fullWidth type="submit">Log Sleep</Button>
    </form>
  )
}
