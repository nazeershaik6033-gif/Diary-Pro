export type MoodLevel = 1 | 2 | 3 | 4 | 5
export type MoodLabel = 'awful' | 'bad' | 'okay' | 'good' | 'great'

export const MOOD_CONFIG: Record<MoodLevel, { label: MoodLabel; emoji: string; color: string }> = {
  1: { label: 'awful', emoji: '😞', color: 'text-blush-dark' },
  2: { label: 'bad', emoji: '😕', color: 'text-blush' },
  3: { label: 'okay', emoji: '😐', color: 'text-ink-300' },
  4: { label: 'good', emoji: '🙂', color: 'text-sage' },
  5: { label: 'great', emoji: '😄', color: 'text-amber-warm' },
}

export interface DiaryEntry {
  id?: number
  date: string // 'YYYY-MM-DD'
  title: string
  content: string // HTML from Tiptap
  mood: MoodLevel
  gratitude: [string, string, string]
  tags: string[]
  hasPhotos: boolean
  createdAt: number
  updatedAt: number
}

export interface DiaryPhoto {
  id?: number
  entryId: number
  data: string // base64 data URL
  mimeType: string
  caption?: string
  order: number
}
