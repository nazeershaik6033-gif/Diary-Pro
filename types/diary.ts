export interface DiaryPage {
  id: string       // nanoid or crypto.randomUUID()
  title?: string
  content: string  // HTML from Tiptap
}

export interface EntryContent {
  id?: number
  entryId: number
  pages: DiaryPage[]
  createdAt: number
}

export interface DiaryTemplate {
  id?: number
  name: string
  category: string   // 'daily' | 'gratitude' | 'reflection' | 'goal' | 'custom' etc.
  description?: string
  pages: DiaryPage[]
  isUserCreated: boolean
  createdAt: number
}

export interface DiaryAsset {
  id?: number
  entryId: number
  data: string        // base64
  mimeType: string    // 'image/jpeg', 'audio/webm', 'audio/mp4' etc.
  type: 'photo' | 'audio'
  duration?: number   // for audio, in seconds
  order: number
  createdAt: number
}

export interface EntrySticker {
  id?: number
  entryId: number
  stickerId: string   // references STICKER_MAP key
  createdAt: number
}

export interface DiaryEntry {
  id?: number
  date: string            // 'YYYY-MM-DD'
  title: string
  gratitude: [string, string, string]
  tagIds: number[]
  hasPhotos: boolean
  starred: boolean
  pinned: boolean
  deletedAt?: number
  colorTone?: string      // theme key like 'warm','ocean','forest','dark','midnight'
  latestContentId?: number
  plainText?: string
  createdAt: number
  updatedAt: number
}

// DiaryPhoto kept for backward compat (data migrated to DiaryAsset in v4)
export interface DiaryPhoto {
  id?: number
  entryId: number
  data: string // base64 data URL
  mimeType: string
  caption?: string
  order: number
}
