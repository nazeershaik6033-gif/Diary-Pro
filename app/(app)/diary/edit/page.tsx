'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MoodPicker } from '@/components/diary/MoodPicker'
import { GratitudeSection } from '@/components/diary/GratitudeSection'
import { TypedTagPicker } from '@/components/diary/TypedTagPicker'
import { RichTextEditor } from '@/components/diary/RichTextEditor'
import { PhotoAttachment } from '@/components/diary/PhotoAttachment'
import { updateDiaryEntry, addEntrySticker, removeEntrySticker, addDiaryAsset } from '@/lib/db/diary'
import { db } from '@/lib/db'
import { useToast } from '@/app/contexts/ToastContext'
import { Spinner } from '@/components/ui/Spinner'

interface FormValues {
  title: string
  content: string
  stickerIds: string[]
  gratitude: [string, string, string]
  tagIds: number[]
  photos: { data: string; mimeType: string }[]
}

function EditDiaryContent() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') ?? ''
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [entryId, setEntryId] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  const { control, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
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

  // Load existing entry on mount
  useEffect(() => {
    if (!date) return
    ;(async () => {
      const entry = await db.diaryEntries
        .where('date').equals(date)
        .filter(e => !e.deletedAt)
        .first()

      if (!entry?.id) {
        router.replace('/diary')
        return
      }

      setEntryId(entry.id)

      // Load content
      let content = ''
      if (entry.latestContentId) {
        const ec = await db.entryContents.get(entry.latestContentId)
        content = ec?.pages?.[0]?.content ?? ''
      }

      // Load stickers
      const stickers = await db.entryStickers.where('entryId').equals(entry.id).toArray()

      // Load photos
      const dbPhotos = await db.diaryPhotos.where('entryId').equals(entry.id).toArray()
      const assets = await db.diaryAssets.where('entryId').equals(entry.id).toArray()
      const allPhotos = [
        ...dbPhotos.map(p => ({ data: p.data, mimeType: p.mimeType })),
        ...assets.filter(a => a.type === 'photo').map(a => ({ data: a.data, mimeType: a.mimeType })),
      ]

      reset({
        title: entry.title ?? '',
        content,
        stickerIds: stickers.map(s => s.stickerId),
        gratitude: (entry.gratitude ?? ['', '', '']) as [string, string, string],
        tagIds: entry.tagIds ?? [],
        photos: allPhotos,
      })

      setReady(true)
    })()
  }, [date, reset, router])

  const onSubmit = async (data: FormValues) => {
    if (!entryId) return
    setLoading(true)
    try {
      const now = Date.now()

      await updateDiaryEntry(entryId, {
        title: data.title,
        content: data.content,
        gratitude: data.gratitude,
        tagIds: data.tagIds,
        hasPhotos: data.photos.length > 0,
        updatedAt: now,
      })

      // Sync stickers: remove all then re-add
      const existing = await db.entryStickers.where('entryId').equals(entryId).toArray()
      for (const s of existing) {
        await removeEntrySticker(entryId, s.stickerId)
      }
      for (const stickerId of data.stickerIds) {
        await addEntrySticker(entryId, stickerId)
      }

      // Sync photos: replace assets (simple approach — delete old, add new)
      await db.diaryAssets.where('entryId').equals(entryId).delete()
      await db.diaryPhotos.where('entryId').equals(entryId).delete()
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

      showToast('Entry updated')
      router.push(`/diary/entry?date=${date}`)
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return <div className="flex justify-center pt-20"><Spinner /></div>
  }

  return (
    <div>
      <PageHeader title="Edit Entry" rightAction={
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

export default function EditDiaryPage() {
  return <Suspense fallback={<div className="flex justify-center pt-20"><Spinner /></div>}><EditDiaryContent /></Suspense>
}
