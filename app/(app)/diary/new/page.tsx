'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MoodPicker } from '@/components/diary/MoodPicker'
import { GratitudeSection } from '@/components/diary/GratitudeSection'
import { TypedTagPicker } from '@/components/diary/TypedTagPicker'
import { RichTextEditor } from '@/components/diary/RichTextEditor'
import { PhotoAttachment } from '@/components/diary/PhotoAttachment'
import { createDiaryEntry, addDiaryAsset, addEntrySticker } from '@/lib/db/diary'
import { useToast } from '@/app/contexts/ToastContext'
import { toDateString } from '@/lib/utils/date'

interface FormValues {
  title: string
  content: string
  stickerIds: string[]
  gratitude: [string, string, string]
  tagIds: number[]
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
      stickerIds: [],
      gratitude: ['', '', ''],
      tagIds: [],
      photos: [],
    },
  })

  const photos = watch('photos')
  const tagIds = watch('tagIds')
  const stickerIds = watch('stickerIds')

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const now = Date.now()
      const entryId = await createDiaryEntry({
        date: toDateString(),
        title: data.title,
        content: data.content,
        gratitude: data.gratitude,
        tagIds: data.tagIds,
        hasPhotos: data.photos.length > 0,
        starred: false,
        pinned: false,
        createdAt: now,
        updatedAt: now,
      })

      // Save stickers
      for (const stickerId of data.stickerIds) {
        await addEntrySticker(entryId, stickerId)
      }

      // Save photo assets
      for (let i = 0; i < data.photos.length; i++) {
        await addDiaryAsset({
          entryId,
          data: data.photos[i].data,
          mimeType: data.photos[i].mimeType,
          type: 'photo',
          order: i,
          createdAt: now,
        })
      }

      showToast('Entry saved')
      router.push(`/diary/entry?date=${toDateString()}`)
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
          <MoodPicker value={stickerIds} onChange={v => setValue('stickerIds', v)} />
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

        <TypedTagPicker selectedTagIds={tagIds} onChange={v => setValue('tagIds', v)} />

        <PhotoAttachment photos={photos} onChange={v => setValue('photos', v)} />
      </form>
    </div>
  )
}
