import Dexie, { type Table } from 'dexie'
import type {
  DiaryEntry, DiaryPhoto,
  WorkEntry,
  GTDInboxItem, GTDProject, GTDNextAction, GTDWaitingFor, GTDSomedayMaybe, GTDWeeklyReview,
  Exercise, WorkoutTemplate, WorkoutLog, WorkoutSet, BodyMetric, PersonalRecord,
  AppSettings,
  Habit, HabitLog,
  HealthLog, SleepLog, WaterLog, Supplement, SupplementLog,
  Goal, GoalMilestone, DailyAffirmation,
  CalendarEvent, Decision,
} from '@/types'
import { DEFAULT_SETTINGS } from '@/types/settings'
import { SEED_EXERCISES, SEED_TEMPLATES } from '@/lib/constants/gym'

export class DiaryProDB extends Dexie {
  // v1 tables
  diaryEntries!: Table<DiaryEntry>
  diaryPhotos!: Table<DiaryPhoto>
  workEntries!: Table<WorkEntry>
  gtdInbox!: Table<GTDInboxItem>
  gtdProjects!: Table<GTDProject>
  gtdNextActions!: Table<GTDNextAction>
  gtdWaitingFor!: Table<GTDWaitingFor>
  gtdSomedayMaybe!: Table<GTDSomedayMaybe>
  gtdWeeklyReviews!: Table<GTDWeeklyReview>
  exercises!: Table<Exercise>
  workoutTemplates!: Table<WorkoutTemplate>
  workoutLogs!: Table<WorkoutLog>
  workoutSets!: Table<WorkoutSet>
  bodyMetrics!: Table<BodyMetric>
  personalRecords!: Table<PersonalRecord>
  settings!: Table<AppSettings>
  // v2 tables
  habits!: Table<Habit>
  habitLogs!: Table<HabitLog>
  healthLogs!: Table<HealthLog>
  sleepLogs!: Table<SleepLog>
  waterLogs!: Table<WaterLog>
  supplements!: Table<Supplement>
  supplementLogs!: Table<SupplementLog>
  goals!: Table<Goal>
  goalMilestones!: Table<GoalMilestone>
  dailyAffirmations!: Table<DailyAffirmation>
  // v3 tables
  events!: Table<CalendarEvent>
  decisions!: Table<Decision>

  constructor() {
    super('DiaryProDB')
    this.version(1).stores({
      diaryEntries:    '++id, date, mood, *tags, createdAt, updatedAt',
      diaryPhotos:     '++id, entryId',
      workEntries:     '++id, date, category, priority, createdAt',
      gtdInbox:        '++id, createdAt, processed',
      gtdProjects:     '++id, status, createdAt',
      gtdNextActions:  '++id, projectId, context, dueDate, completed, createdAt',
      gtdWaitingFor:   '++id, delegatedTo, dueDate, completed, createdAt',
      gtdSomedayMaybe: '++id, category, createdAt',
      gtdWeeklyReviews:'++id, weekStartDate, completedAt',
      exercises:       '++id, name, muscleGroup, isCustom',
      workoutTemplates:'++id, name, type, createdAt',
      workoutLogs:     '++id, templateId, date, completedAt',
      workoutSets:     '++id, workoutLogId, exerciseId, setNumber',
      bodyMetrics:     '++id, date',
      personalRecords: '++id, exerciseId, date',
      settings:        'id',
    })

    this.version(2).stores({
      diaryEntries:    '++id, date, mood, *tags, createdAt, updatedAt',
      diaryPhotos:     '++id, entryId',
      workEntries:     '++id, date, category, priority, createdAt',
      gtdInbox:        '++id, createdAt, processed',
      gtdProjects:     '++id, status, createdAt',
      gtdNextActions:  '++id, projectId, context, dueDate, completed, createdAt',
      gtdWaitingFor:   '++id, delegatedTo, dueDate, completed, createdAt',
      gtdSomedayMaybe: '++id, category, createdAt',
      gtdWeeklyReviews:'++id, weekStartDate, completedAt',
      exercises:       '++id, name, muscleGroup, isCustom',
      workoutTemplates:'++id, name, type, createdAt',
      workoutLogs:     '++id, templateId, date, completedAt',
      workoutSets:     '++id, workoutLogId, exerciseId, setNumber',
      bodyMetrics:     '++id, date',
      personalRecords: '++id, exerciseId, date',
      settings:        'id',
      habits:             '++id, name, active, createdAt',
      habitLogs:          '++id, habitId, date',
      healthLogs:         '++id, date, energyLevel, createdAt',
      sleepLogs:          '++id, date, quality',
      waterLogs:          '++id, date',
      supplements:        '++id, timing, active, createdAt',
      supplementLogs:     '++id, date, supplementId',
      goals:              '++id, tier, createdAt, updatedAt',
      goalMilestones:     '++id, goalId, order',
      dailyAffirmations:  '++id, active, createdAt',
    })

    this.version(3).stores({
      diaryEntries:    '++id, date, mood, *tags, createdAt, updatedAt',
      diaryPhotos:     '++id, entryId',
      workEntries:     '++id, date, category, priority, createdAt',
      gtdInbox:        '++id, createdAt, processed',
      gtdProjects:     '++id, status, createdAt',
      gtdNextActions:  '++id, projectId, context, dueDate, completed, createdAt',
      gtdWaitingFor:   '++id, delegatedTo, dueDate, completed, createdAt',
      gtdSomedayMaybe: '++id, category, createdAt',
      gtdWeeklyReviews:'++id, weekStartDate, completedAt',
      exercises:       '++id, name, muscleGroup, isCustom',
      workoutTemplates:'++id, name, type, createdAt',
      workoutLogs:     '++id, templateId, date, completedAt',
      workoutSets:     '++id, workoutLogId, exerciseId, setNumber',
      bodyMetrics:     '++id, date',
      personalRecords: '++id, exerciseId, date',
      settings:        'id',
      habits:             '++id, name, active, createdAt',
      habitLogs:          '++id, habitId, date',
      healthLogs:         '++id, date, energyLevel, createdAt',
      sleepLogs:          '++id, date, quality',
      waterLogs:          '++id, date',
      supplements:        '++id, timing, active, createdAt',
      supplementLogs:     '++id, date, supplementId',
      goals:              '++id, tier, createdAt, updatedAt',
      goalMilestones:     '++id, goalId, order',
      dailyAffirmations:  '++id, active, createdAt',
      // v3
      events:    '++id, startDate, category, createdAt',
      decisions: '++id, type, status, createdAt',
    })

    this.on('populate', async () => {
      await this.settings.add(DEFAULT_SETTINGS)
      await this.exercises.bulkAdd(SEED_EXERCISES)
      await this.workoutTemplates.bulkAdd(SEED_TEMPLATES)
    })
  }
}

let _db: DiaryProDB | null = null

export function getDB(): DiaryProDB {
  if (!_db) {
    _db = new DiaryProDB()
  }
  return _db
}

export const db = typeof window !== 'undefined' ? getDB() : (null as unknown as DiaryProDB)
