'use client'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { addWorkEntry } from '@/lib/db/work'
import { useToast } from '@/app/contexts/ToastContext'
import { toDateString } from '@/lib/utils/date'
import type { WorkCategory, Priority } from '@/types'

interface FormValues {
  title: string
  content: string
  category: WorkCategory
  priority: Priority
}

interface WorkEntryFormProps {
  onDone: () => void
  date?: string
}

export function WorkEntryForm({ onDone, date }: WorkEntryFormProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { title: '', content: '', category: 'task', priority: 'medium' },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const now = Date.now()
      await addWorkEntry({ ...data, date: date ?? toDateString(), createdAt: now, updatedAt: now })
      showToast('Entry saved')
      onDone()
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register('title', { required: true })} placeholder="Entry title" error={errors.title ? 'Required' : undefined} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium font-sans text-ink-400 block mb-1">Category</label>
          <select
            {...register('category')}
            className="w-full rounded-xl border border-paper-400 px-3 py-2.5 text-[16px] font-sans text-ink bg-white focus:outline-none focus:ring-2 focus:ring-amber-warm"
          >
            <option value="task">Task</option>
            <option value="meeting">Meeting</option>
            <option value="win">Win</option>
            <option value="blocker">Blocker</option>
            <option value="note">Note</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium font-sans text-ink-400 block mb-1">Priority</label>
          <select
            {...register('priority')}
            className="w-full rounded-xl border border-paper-400 px-3 py-2.5 text-[16px] font-sans text-ink bg-white focus:outline-none focus:ring-2 focus:ring-amber-warm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <Textarea {...register('content')} placeholder="Notes, details, context…" rows={4} />

      <Button fullWidth type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Entry'}</Button>
    </form>
  )
}
