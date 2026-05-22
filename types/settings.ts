export interface NotificationSettings {
  diaryPromptEnabled: boolean
  diaryPromptTime: string // 'HH:MM'
  gtdReviewEnabled: boolean
  gtdReviewTime: string
  workoutEnabled: boolean
  workoutTime: string
}

export interface AppSettings {
  id: 'singleton'
  pinHash?: string // SHA-256 hex of PIN
  pinEnabled: boolean
  theme: 'warm'
  notifications: NotificationSettings
  diaryGratitudePrompts: [string, string, string]
  lastBackupAt?: number
  firstLaunch: boolean
  createdAt: number
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'singleton',
  pinEnabled: false,
  theme: 'warm',
  notifications: {
    diaryPromptEnabled: false,
    diaryPromptTime: '21:00',
    gtdReviewEnabled: false,
    gtdReviewTime: '09:00',
    workoutEnabled: false,
    workoutTime: '07:00',
  },
  diaryGratitudePrompts: [
    'What are you grateful for today?',
    'Who made your day better?',
    'What small moment brought you joy?',
  ],
  firstLaunch: true,
  createdAt: Date.now(),
}
