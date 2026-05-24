import Dexie, { type Table } from 'dexie'
import type {
  DiaryEntry, DiaryPhoto, DiaryAsset, EntryContent, EntrySticker, DiaryTemplate,
  WorkEntry,
  GTDInboxItem, GTDProject, GTDNextAction, GTDWaitingFor, GTDSomedayMaybe, GTDWeeklyReview,
  Exercise, WorkoutTemplate, WorkoutLog, WorkoutSet, BodyMetric, PersonalRecord,
  AppSettings,
  Habit, HabitLog,
  HealthLog, SleepLog, WaterLog, Supplement, SupplementLog,
  Goal, GoalMilestone, DailyAffirmation,
  CalendarEvent, Decision,
  Tag, TagCategory,
  Article, ArticleHighlight,
} from '@/types'

export interface GTDLog {
  id?: number
  date: string       // 'YYYY-MM-DD'
  action: 'created' | 'completed' | 'deleted' | 'processed'
  area: string       // 'inbox' | 'next-actions' | 'projects' | 'waiting-for' | 'someday'
  itemTitle: string
  createdAt: number
}
import { DEFAULT_SETTINGS } from '@/types/settings'
import { SEED_EXERCISES, SEED_TEMPLATES } from '@/lib/constants/gym'

export class DiaryProDB extends Dexie {
  // v1 tables
  diaryEntries!: Table<DiaryEntry>
  diaryPhotos!: Table<DiaryPhoto>   // OLD — kept for backward compat; data migrated to diaryAssets in v4
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
  // v4 tables
  tags!: Table<Tag>
  tagCategories!: Table<TagCategory>
  entryStickers!: Table<EntrySticker>
  entryContents!: Table<EntryContent>
  diaryTemplates!: Table<DiaryTemplate>
  diaryAssets!: Table<DiaryAsset>
  // v5 tables
  gtdLogs!: Table<GTDLog>
  // v6 tables
  articles!: Table<Article>
  articleHighlights!: Table<ArticleHighlight>

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

    this.version(4).stores({
      diaryEntries:   '++id, date, *tagIds, starred, pinned, deletedAt, createdAt, updatedAt',
      diaryPhotos:    '++id, entryId',
      diaryAssets:    '++id, entryId, type, createdAt',
      tags:           '++id, name, categoryId, createdAt',
      tagCategories:  '++id, order',
      entryStickers:  '++id, entryId, stickerId',
      entryContents:  '++id, entryId, createdAt',
      diaryTemplates: '++id, name, category, isUserCreated, createdAt',
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
      events:    '++id, startDate, category, createdAt',
      decisions: '++id, type, status, createdAt',
    }).upgrade(async tx => {
      // 1. Create default tag categories
      const categories = [
        { name: 'Feeling', emoji: '😊', order: 0 },
        { name: 'Activity', emoji: '🏃', order: 1 },
        { name: 'People', emoji: '👥', order: 2 },
        { name: 'Place', emoji: '📍', order: 3 },
        { name: 'Topic', emoji: '💬', order: 4 },
        { name: 'Custom', emoji: '🏷️', order: 5 },
      ]
      const catIds = await Promise.all(categories.map(c => tx.table('tagCategories').add(c)))
      const _customCatId = catIds[5]

      // 2. Migrate tags: collect unique tags from all entries, create Tag objects
      const entries = await tx.table('diaryEntries').toArray()
      const tagMap = new Map<string, number>() // name → new id
      const allTags = Array.from(new Set<string>(entries.flatMap((e: any) => e.tags ?? [])))
      for (const name of allTags) {
        const id = await tx.table('tags').add({ name, categoryId: 'custom', createdAt: Date.now() })
        tagMap.set(name as string, id as number)
      }

      // 3. For each entry: migrate content → entryContents, tags → tagIds, mood → sticker, add new fields
      const MOOD_TO_STICKER: Record<number, string> = {
        1: 'feel_sad',
        2: 'feel_confused',
        3: 'feel_okay',
        4: 'feel_happy',
        5: 'feel_great',
      }

      for (const entry of entries) {
        // Create EntryContent with single page
        const page = { id: crypto.randomUUID(), content: entry.content ?? '', title: undefined }
        const contentId = await tx.table('entryContents').add({
          entryId: entry.id,
          pages: [page],
          createdAt: entry.createdAt ?? Date.now(),
        })

        // Migrate mood → sticker
        if (entry.mood && MOOD_TO_STICKER[entry.mood]) {
          await tx.table('entryStickers').add({
            entryId: entry.id,
            stickerId: MOOD_TO_STICKER[entry.mood],
            createdAt: entry.createdAt ?? Date.now(),
          })
        }

        // Compute plain text
        const plainText = (entry.content ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

        // Update entry
        await tx.table('diaryEntries').update(entry.id, {
          tagIds: (entry.tags ?? []).map((t: string) => tagMap.get(t)).filter(Boolean),
          latestContentId: contentId,
          plainText,
          starred: false,
          pinned: false,
          deletedAt: undefined,
          colorTone: undefined,
          // Note: old fields (mood, content, tags) remain on the object harmlessly
        })
      }

      // 4. Migrate diaryPhotos → diaryAssets
      const photos = await tx.table('diaryPhotos').toArray()
      for (const photo of photos) {
        await tx.table('diaryAssets').add({
          entryId: photo.entryId,
          data: photo.data,
          mimeType: photo.mimeType ?? 'image/jpeg',
          type: 'photo',
          order: photo.order ?? 0,
          createdAt: photo.createdAt ?? Date.now(),
        })
      }

      // 5. Seed default templates
      const templates = [
        {
          name: 'Daily Reflection',
          category: 'reflection',
          description: 'Review your day',
          pages: [{
            id: crypto.randomUUID(),
            title: 'My Day',
            content: '<p><strong>What happened today?</strong></p><p></p><p><strong>What went well?</strong></p><p></p><p><strong>What could be better?</strong></p><p></p>'
          }],
          isUserCreated: false,
          createdAt: Date.now(),
        },
        {
          name: 'Gratitude Journal',
          category: 'gratitude',
          description: 'Three things to be grateful for',
          pages: [{
            id: crypto.randomUUID(),
            title: 'Gratitude',
            content: '<p><strong>I am grateful for…</strong></p><p>1. </p><p>2. </p><p>3. </p><p></p><p><strong>Why does this matter to me?</strong></p><p></p>'
          }],
          isUserCreated: false,
          createdAt: Date.now(),
        },
        {
          name: 'Morning Pages',
          category: 'daily',
          description: 'Stream-of-consciousness morning writing',
          pages: [{
            id: crypto.randomUUID(),
            title: 'Morning',
            content: '<p><em>Write freely for 10 minutes without stopping. Do not edit yourself.</em></p><p></p>'
          }],
          isUserCreated: false,
          createdAt: Date.now(),
        },
        {
          name: 'Weekly Review',
          category: 'review',
          description: 'Review your week',
          pages: [
            { id: crypto.randomUUID(), title: 'Wins', content: '<p><strong>This week\'s wins:</strong></p><p></p>' },
            { id: crypto.randomUUID(), title: 'Challenges', content: '<p><strong>Challenges I faced:</strong></p><p></p>' },
            { id: crypto.randomUUID(), title: 'Next Week', content: '<p><strong>My focus for next week:</strong></p><p></p>' },
          ],
          isUserCreated: false,
          createdAt: Date.now(),
        },
        {
          name: 'Goal Setting',
          category: 'goal',
          description: 'Define and plan a goal',
          pages: [{
            id: crypto.randomUUID(),
            title: 'Goal',
            content: '<p><strong>The goal:</strong></p><p></p><p><strong>Why it matters:</strong></p><p></p><p><strong>First step:</strong></p><p></p>'
          }],
          isUserCreated: false,
          createdAt: Date.now(),
        },
        {
          name: 'Travel Log',
          category: 'travel',
          description: 'Document your travels',
          pages: [
            { id: crypto.randomUUID(), title: 'Day Summary', content: '<p><strong>Where I went:</strong></p><p></p><p><strong>What I saw:</strong></p><p></p>' },
            { id: crypto.randomUUID(), title: 'Highlights', content: '<p><strong>Best moment:</strong></p><p></p><p><strong>Would I recommend?</strong></p><p></p>' },
          ],
          isUserCreated: false,
          createdAt: Date.now(),
        },
      ]
      for (const t of templates) {
        await tx.table('diaryTemplates').add(t)
      }
    })

    this.version(5).stores({
      diaryEntries:   '++id, date, *tagIds, starred, pinned, deletedAt, createdAt, updatedAt',
      diaryPhotos:    '++id, entryId',
      diaryAssets:    '++id, entryId, type, createdAt',
      tags:           '++id, name, categoryId, createdAt',
      tagCategories:  '++id, order',
      entryStickers:  '++id, entryId, stickerId',
      entryContents:  '++id, entryId, createdAt',
      diaryTemplates: '++id, name, category, isUserCreated, createdAt',
      workEntries:     '++id, date, category, priority, createdAt',
      gtdInbox:        '++id, createdAt',
      gtdProjects:     '++id, status, createdAt',
      gtdNextActions:  '++id, projectId, context, dueDate, createdAt',
      gtdWaitingFor:   '++id, delegatedTo, dueDate, createdAt',
      gtdSomedayMaybe: '++id, category, createdAt',
      gtdWeeklyReviews:'++id, weekStartDate, completedAt',
      gtdLogs:         '++id, date, area, createdAt',
      exercises:       '++id, name, muscleGroup, isCustom',
      workoutTemplates:'++id, name, type, createdAt',
      workoutLogs:     '++id, templateId, date, completedAt',
      workoutSets:     '++id, workoutLogId, exerciseId, setNumber',
      bodyMetrics:     '++id, date',
      personalRecords: '++id, exerciseId, date',
      settings:        'id',
      habits:             '++id, name, createdAt',
      habitLogs:          '++id, habitId, date',
      healthLogs:         '++id, date, energyLevel, createdAt',
      sleepLogs:          '++id, date, quality',
      waterLogs:          '++id, date',
      supplements:        '++id, timing, createdAt',
      supplementLogs:     '++id, date, supplementId',
      goals:              '++id, tier, createdAt, updatedAt',
      goalMilestones:     '++id, goalId, order',
      dailyAffirmations:  '++id, createdAt',
      events:    '++id, startDate, category, createdAt',
      decisions: '++id, type, status, createdAt',
    })
    // Note: v5 removes boolean index fields (processed, completed, active) that caused
    // cross-browser issues with boolean vs number comparisons in IndexedDB.
    // All queries now use .filter() instead of .where().equals(bool/0/1).

    this.version(6).stores({
      diaryEntries:   '++id, date, *tagIds, starred, pinned, deletedAt, createdAt, updatedAt',
      diaryPhotos:    '++id, entryId',
      diaryAssets:    '++id, entryId, type, createdAt',
      tags:           '++id, name, categoryId, createdAt',
      tagCategories:  '++id, order',
      entryStickers:  '++id, entryId, stickerId',
      entryContents:  '++id, entryId, createdAt',
      diaryTemplates: '++id, name, category, isUserCreated, createdAt',
      workEntries:     '++id, date, category, priority, createdAt',
      gtdInbox:        '++id, createdAt',
      gtdProjects:     '++id, status, createdAt',
      gtdNextActions:  '++id, projectId, context, dueDate, createdAt',
      gtdWaitingFor:   '++id, delegatedTo, dueDate, createdAt',
      gtdSomedayMaybe: '++id, category, createdAt',
      gtdWeeklyReviews:'++id, weekStartDate, completedAt',
      gtdLogs:         '++id, date, area, createdAt',
      exercises:       '++id, name, muscleGroup, isCustom',
      workoutTemplates:'++id, name, type, createdAt',
      workoutLogs:     '++id, templateId, date, completedAt',
      workoutSets:     '++id, workoutLogId, exerciseId, setNumber',
      bodyMetrics:     '++id, date',
      personalRecords: '++id, exerciseId, date',
      settings:        'id',
      habits:             '++id, name, createdAt',
      habitLogs:          '++id, habitId, date',
      healthLogs:         '++id, date, energyLevel, createdAt',
      sleepLogs:          '++id, date, quality',
      waterLogs:          '++id, date',
      supplements:        '++id, timing, createdAt',
      supplementLogs:     '++id, date, supplementId',
      goals:              '++id, tier, createdAt, updatedAt',
      goalMilestones:     '++id, goalId, order',
      dailyAffirmations:  '++id, createdAt',
      events:    '++id, startDate, category, createdAt',
      decisions: '++id, type, status, createdAt',
      // v6
      articles:           '++id, section, folder, createdAt, updatedAt',
      articleHighlights:  '++id, articleId, createdAt',
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
