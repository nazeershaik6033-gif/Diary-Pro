import { db } from '@/lib/db'
import type { DiaryEntry, EntryContent } from '@/types'
import { STICKER_MAP } from '@/types/stickers'

export interface ExportData {
  version: number
  exportedAt: number
  diaryEntries: unknown[]
  diaryPhotos: unknown[]
  workEntries: unknown[]
  gtdInbox: unknown[]
  gtdProjects: unknown[]
  gtdNextActions: unknown[]
  gtdWaitingFor: unknown[]
  gtdSomedayMaybe: unknown[]
  gtdWeeklyReviews: unknown[]
  exercises: unknown[]
  workoutTemplates: unknown[]
  workoutLogs: unknown[]
  workoutSets: unknown[]
  bodyMetrics: unknown[]
  personalRecords: unknown[]
  settings: unknown[]
  habits: unknown[]
  habitLogs: unknown[]
  healthLogs: unknown[]
  sleepLogs: unknown[]
  waterLogs: unknown[]
  supplements: unknown[]
  supplementLogs: unknown[]
  goals: unknown[]
  goalMilestones: unknown[]
  dailyAffirmations: unknown[]
  events: unknown[]
  decisions: unknown[]
}

export async function exportAll(): Promise<void> {
  const data: ExportData = {
    version: 2,
    exportedAt: Date.now(),
    diaryEntries: await db.diaryEntries.toArray(),
    diaryPhotos: await db.diaryPhotos.toArray(),
    workEntries: await db.workEntries.toArray(),
    gtdInbox: await db.gtdInbox.toArray(),
    gtdProjects: await db.gtdProjects.toArray(),
    gtdNextActions: await db.gtdNextActions.toArray(),
    gtdWaitingFor: await db.gtdWaitingFor.toArray(),
    gtdSomedayMaybe: await db.gtdSomedayMaybe.toArray(),
    gtdWeeklyReviews: await db.gtdWeeklyReviews.toArray(),
    exercises: await db.exercises.toArray(),
    workoutTemplates: await db.workoutTemplates.toArray(),
    workoutLogs: await db.workoutLogs.toArray(),
    workoutSets: await db.workoutSets.toArray(),
    bodyMetrics: await db.bodyMetrics.toArray(),
    personalRecords: await db.personalRecords.toArray(),
    settings: await db.settings.toArray(),
    habits: await db.habits.toArray(),
    habitLogs: await db.habitLogs.toArray(),
    healthLogs: await db.healthLogs.toArray(),
    sleepLogs: await db.sleepLogs.toArray(),
    waterLogs: await db.waterLogs.toArray(),
    supplements: await db.supplements.toArray(),
    supplementLogs: await db.supplementLogs.toArray(),
    goals: await db.goals.toArray(),
    goalMilestones: await db.goalMilestones.toArray(),
    dailyAffirmations: await db.dailyAffirmations.toArray(),
    events: await db.events.toArray(),
    decisions: await db.decisions.toArray(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `diary-pro-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  await db.settings.update('singleton', { lastBackupAt: Date.now() })
}

export async function importAll(file: File): Promise<void> {
  const text = await file.text()
  const data: ExportData = JSON.parse(text)

  if (!data.version || !data.exportedAt) {
    throw new Error('Invalid backup file')
  }

  await db.transaction('rw', [
    db.diaryEntries, db.diaryPhotos, db.workEntries,
    db.gtdInbox, db.gtdProjects, db.gtdNextActions, db.gtdWaitingFor,
    db.gtdSomedayMaybe, db.gtdWeeklyReviews,
    db.exercises, db.workoutTemplates, db.workoutLogs, db.workoutSets,
    db.bodyMetrics, db.personalRecords, db.settings,
    db.habits, db.habitLogs,
    db.healthLogs, db.sleepLogs, db.waterLogs, db.supplements, db.supplementLogs,
    db.goals, db.goalMilestones, db.dailyAffirmations,
  ], async () => {
    await db.diaryEntries.clear(); await db.diaryEntries.bulkAdd(data.diaryEntries as never[])
    await db.diaryPhotos.clear(); await db.diaryPhotos.bulkAdd(data.diaryPhotos as never[])
    await db.workEntries.clear(); await db.workEntries.bulkAdd(data.workEntries as never[])
    await db.gtdInbox.clear(); await db.gtdInbox.bulkAdd(data.gtdInbox as never[])
    await db.gtdProjects.clear(); await db.gtdProjects.bulkAdd(data.gtdProjects as never[])
    await db.gtdNextActions.clear(); await db.gtdNextActions.bulkAdd(data.gtdNextActions as never[])
    await db.gtdWaitingFor.clear(); await db.gtdWaitingFor.bulkAdd(data.gtdWaitingFor as never[])
    await db.gtdSomedayMaybe.clear(); await db.gtdSomedayMaybe.bulkAdd(data.gtdSomedayMaybe as never[])
    await db.gtdWeeklyReviews.clear(); await db.gtdWeeklyReviews.bulkAdd(data.gtdWeeklyReviews as never[])
    await db.exercises.clear(); await db.exercises.bulkAdd(data.exercises as never[])
    await db.workoutTemplates.clear(); await db.workoutTemplates.bulkAdd(data.workoutTemplates as never[])
    await db.workoutLogs.clear(); await db.workoutLogs.bulkAdd(data.workoutLogs as never[])
    await db.workoutSets.clear(); await db.workoutSets.bulkAdd(data.workoutSets as never[])
    await db.bodyMetrics.clear(); await db.bodyMetrics.bulkAdd(data.bodyMetrics as never[])
    await db.personalRecords.clear(); await db.personalRecords.bulkAdd(data.personalRecords as never[])
    await db.settings.clear(); await db.settings.bulkAdd(data.settings as never[])
    if (data.habits) { await db.habits.clear(); await db.habits.bulkAdd(data.habits as never[]) }
    if (data.habitLogs) { await db.habitLogs.clear(); await db.habitLogs.bulkAdd(data.habitLogs as never[]) }
    if (data.healthLogs) { await db.healthLogs.clear(); await db.healthLogs.bulkAdd(data.healthLogs as never[]) }
    if (data.sleepLogs) { await db.sleepLogs.clear(); await db.sleepLogs.bulkAdd(data.sleepLogs as never[]) }
    if (data.waterLogs) { await db.waterLogs.clear(); await db.waterLogs.bulkAdd(data.waterLogs as never[]) }
    if (data.supplements) { await db.supplements.clear(); await db.supplements.bulkAdd(data.supplements as never[]) }
    if (data.supplementLogs) { await db.supplementLogs.clear(); await db.supplementLogs.bulkAdd(data.supplementLogs as never[]) }
    if (data.goals) { await db.goals.clear(); await db.goals.bulkAdd(data.goals as never[]) }
    if (data.goalMilestones) { await db.goalMilestones.clear(); await db.goalMilestones.bulkAdd(data.goalMilestones as never[]) }
    if (data.dailyAffirmations) { await db.dailyAffirmations.clear(); await db.dailyAffirmations.bulkAdd(data.dailyAffirmations as never[]) }
    if (data.events) { await db.events.clear(); await db.events.bulkAdd(data.events as never[]) }
    if (data.decisions) { await db.decisions.clear(); await db.decisions.bulkAdd(data.decisions as never[]) }
  })
}
