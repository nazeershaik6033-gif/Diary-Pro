export interface NotificationSettings {
  diaryPromptEnabled: boolean
  diaryPromptTime: string // 'HH:MM'
  gtdReviewEnabled: boolean
  gtdReviewTime: string
  workoutEnabled: boolean
  workoutTime: string
}

export type AppTheme = 'warm' | 'dark' | 'ocean' | 'forest' | 'midnight'
export type FontStyle = 'sans' | 'serif' | 'mono'
export type FontSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AppSettings {
  id: 'singleton'
  pinHash?: string // SHA-256 hex of PIN
  pinEnabled: boolean
  theme: AppTheme
  fontStyle: FontStyle
  fontSize: FontSize
  notifications: NotificationSettings
  diaryGratitudePrompts: [string, string, string]
  lastBackupAt?: number
  firstLaunch: boolean
  createdAt: number
  securityQuestions?: Array<{ questionIndex: number; answerHash: string }>
  anthropicApiKey?: string
  sidebarOrder?: string[]
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'singleton',
  pinEnabled: false,
  theme: 'warm',
  fontStyle: 'sans',
  fontSize: 'md',
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
