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
import { formatDisplay, formatDay } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { Bell } from 'lucide-react'
import { TasksTab, type TodoItem } from '@/components/diary/TasksTab'

interface FormValues {
  title: string
  content: string
  learnings: string
  stickerIds: string[]
  gratitude: [string, string, string]
  tagIds: number[]
  photos: { data: string; mimeType: string }[]
}

const TABS = ['Write', 'Tasks', 'Mood', 'Gratitude', 'Learnings', 'Photos', 'Reminder'] as const
type Tab = typeof TABS[number]

async function scheduleReminder(reminderAt: number, title: string) {
  if (reminderAt <= Date.now()) return
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return
  }
  const delay = reminderAt - Date.now()
  setTimeout(() => {
    new Notification('My Journal reminder', {
      body: title || 'You have a diary reminder',
      icon: '/logo.svg',
    })
  }, delay)
}

function EditDiaryContent() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') ?? ''
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [entryId, setEntryId] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('Write')
  const [reminderDatetime, setReminderDatetime] = useState('')  // 'YYYY-MM-DDTHH:mm'
  const [todos, setTodos] = useState<TodoItem[]>([])

  const { control, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
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

      let content = ''
      if (entry.latestContentId) {
        const ec = await db.entryContents.get(entry.latestContentId)
        content = ec?.pages?.[0]?.content ?? ''
      }

      const stickers = await db.entryStickers.where('entryId').equals(entry.id).toArray()

      const dbPhotos = await db.diaryPhotos.where('entryId').equals(entry.id).toArray()
      const assets = await db.diaryAssets.where('entryId').equals(entry.id).filter(a => a.type === 'photo').sortBy('order')
      const allPhotos = [
        ...dbPhotos.map(p => ({ data: p.data, mimeType: p.mimeType })),
        ...assets.map(a => ({ data: a.data, mimeType: a.mimeType })),
      ]

      if (entry.todos && entry.todos.length > 0) {
        setTodos(entry.todos)
      }

      if (entry.reminderAt && entry.reminderAt > Date.now()) {
        const d = new Date(entry.reminderAt)
        const pad = (n: number) => String(n).padStart(2, '0')
        setReminderDatetime(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`)
      }

      reset({
        title: entry.title ?? '',
        content,
        learnings: entry.learnings ?? '',
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

      const reminderAt = reminderDatetime ? new Date(reminderDatetime).getTime() : undefined

      await updateDiaryEntry(entryId, {
        title: data.title,
        content: data.content,
        learnings: data.learnings || undefined,
        gratitude: data.gratitude,
        tagIds: data.tagIds,
        hasPhotos: data.photos.length > 0,
        todos: todos.length > 0 ? todos : undefined,
        reminderAt,
        updatedAt: now,
      })

      if (reminderAt && reminderAt > Date.now()) {
        await scheduleReminder(reminderAt, data.title)
      }

      const existing = await db.entryStickers.where('entryId').equals(entryId).toArray()
      for (const s of existing) {
        await removeEntrySticker(entryId, s.stickerId)
      }
      for (const stickerId of data.stickerIds) {
        await addEntrySticker(entryId, stickerId)
      }

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

      <div className="px-4 pb-8 space-y-4">
        {/* Date display (read-only in edit mode) */}
        <div className="rounded-xl border border-paper-400 bg-paper-200 px-4 py-2.5">
          <p className="text-sm font-sans text-ink-300">{formatDisplay(date)} · {formatDay(date)}</p>
        </div>

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
              {tab === 'Tasks' && todos.length > 0 && (
                <span className="ml-1 text-xs bg-amber-warm text-white rounded-full px-1.5">{todos.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'Write' && (
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Write your thoughts…" />
            )}
          />
        )}

        {activeTab === 'Tasks' && (
          <TasksTab todos={todos} onChange={setTodos} />
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

        {activeTab === 'Reminder' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={16} className="text-amber-warm" />
              <p className="text-sm font-sans font-semibold text-ink">Set a reminder</p>
            </div>
            <p className="text-xs font-sans text-ink-300">You'll get a notification at the chosen time.</p>
            <input
              type="datetime-local"
              value={reminderDatetime}
              onChange={e => setReminderDatetime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-xl border border-paper-400 px-3 py-2.5 text-sm font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm bg-white"
            />
            {reminderDatetime && (
              <button
                type="button"
                onClick={() => setReminderDatetime('')}
                className="text-xs font-sans text-red-400 hover:underline"
              >
                Clear reminder
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function EditDiaryPage() {
  return <Suspense fallback={<div className="flex justify-center pt-20"><Spinner /></div>}><EditDiaryContent /></Suspense>
}
