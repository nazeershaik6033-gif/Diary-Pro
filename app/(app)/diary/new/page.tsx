'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MoodPicker } from '@/components/diary/MoodPicker'
import { GratitudeSection } from '@/components/diary/GratitudeSection'
import { TagInput } from '@/components/diary/TagInput'
import { RichTextEditor } from '@/components/diary/RichTextEditor'
import { PhotoAttachment } from '@/components/diary/PhotoAttachment'
import { addDiaryEntry, addDiaryPhoto } from '@/lib/db/diary'
import { useToast } from '@/app/contexts/ToastContext'
import { toDateString } from '@/lib/utils/date'
import type { DiaryEntry, MoodLevel } from '@/types'

interface FormValues {
  title: string
  content: string
  mood: MoodLevel
  gratitude: [string, string, string]
  tags: string[]
  photos: { data: string; mimeType: string }[]
}

export default function NewDiaryEntryPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      title: '',
      content: '',
      mood: 3,
      gratitude: ['', '', ''],
      tags: [],
      photos: [],
    },
  })

  const photos = watch('photos')
  const tags = watch('tags')
  const mood = watch('mood')

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const now = Date.now()
      const entry: Omit<DiaryEntry, 'id'> = {
        date: toDateString(),
        title: data.title,
        content: data.content,
        mood: data.mood,
        gratitude: data.gratitude,
        tags: data.tags,
        hasPhotos: data.photos.length > 0,
        createdAt: now,
        updatedAt: now,
      }
      const id = await addDiaryEntry(entry)
      for (let i = 0; i < data.photos.length; i++) {
        await addDiaryPhoto({ entryId: id, data: data.photos[i].data, mimeType: data.photos[i].mimeType, order: i })
      }
      showToast('Entry saved')
      router.push(`/diary/${toDateString()}`)
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="New Entry" rightAction={
        <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      } />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-5 pb-8">
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Entry title (optional)" />
          )}
        />

        <div>
          <p className="text-sm font-medium font-sans text-ink-400 mb-2">How are you feeling?</p>
          <MoodPicker value={mood} onChange={v => setValue('mood', v)} />
        </div>

        <div>
          <p className="text-sm font-medium font-sans text-ink-400 mb-2">Today's thoughts</p>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <GratitudeSection control={control as any} />

        <TagInput value={tags} onChange={v => setValue('tags', v)} />

        <PhotoAttachment photos={photos} onChange={v => setValue('photos', v)} />
      </form>
    </div>
  )
}
