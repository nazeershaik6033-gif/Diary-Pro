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
import { cn } from '@/lib/utils/cn'

interface FormValues {
  date: string
  title: string
  content: string
  learnings: string
  stickerIds: string[]
  gratitude: [string, string, string]
  tagIds: number[]
  photos: { data: string; mimeType: string }[]
}

const TABS = ['Write', 'Mood', 'Gratitude', 'Learnings', 'Photos'] as const
type Tab = typeof TABS[number]

export default function NewDiaryEntryPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('Write')

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      date: toDateString(),
      title: '',
      content: '',
      learnings: '',
      stickerIds: [],
      gratitude: ['', '', ''],
      tagIds: [],
      photos: [],
    },
  })

  const photos = watch('photos')
  const tagIds = watch('tagIds')
  const stickerIds = watch('stickerIds')
  const entryDate = watch('date')

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const now = Date.now()
      const entryId = await createDiaryEntry({
        date: data.date,
        title: data.title,
        content: data.content,
        learnings: data.learnings || undefined,
        gratitude: data.gratitude,
        tagIds: data.tagIds,
        hasPhotos: data.photos.length > 0,
        starred: false,
        pinned: false,
        createdAt: now,
        updatedAt: now,
      })

      for (const stickerId of data.stickerIds) {
        await addEntrySticker(entryId, stickerId)
      }

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
      router.push(`/diary/entry?date=${data.date}`)
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

      <div className="px-4 pb-8 space-y-4">
        {/* Editable date */}
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <input
              type="date"
              {...field}
              className="w-full rounded-xl border border-paper-400 bg-white px-4 py-2.5 text-[16px] font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm"
            />
          )}
        />

        {/* Title */}
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Entry title (optional)" />
          )}
        />

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-paper-400 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-2 px-3 text-sm font-sans font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0',
                activeTab === tab
                  ? 'border-amber-warm text-amber-warm'
                  : 'border-transparent text-ink-300 hover:text-ink'
              )}
            >
              {tab}
              {tab === 'Photos' && photos.length > 0 && (
                <span className="ml-1 text-xs bg-amber-warm text-white rounded-full px-1.5">{photos.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Write' && (
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Write your thoughts…" />
            )}
          />
        )}

        {activeTab === 'Mood' && (
          <div>
            <p className="text-sm font-medium font-sans text-ink-400 mb-3">How are you feeling?</p>
            <MoodPicker value={stickerIds} onChange={v => setValue('stickerIds', v)} />
            <div className="mt-4">
              <TypedTagPicker selectedTagIds={tagIds} onChange={v => setValue('tagIds', v)} />
            </div>
          </div>
        )}

        {activeTab === 'Gratitude' && (
          <GratitudeSection control={control as any} />
        )}

        {activeTab === 'Learnings' && (
          <div>
            <p className="text-sm font-medium font-sans text-ink-400 mb-2">What did you learn today?</p>
            <Controller
              name="learnings"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Key insights, lessons learned, things to remember…"
                />
              )}
            />
          </div>
        )}

        {activeTab === 'Photos' && (
          <PhotoAttachment photos={photos} onChange={v => setValue('photos', v)} />
        )}
      </div>
    </div>
  )
}
