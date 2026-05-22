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

// ---------------------------------------------------------------------------
// Markdown export helpers
// ---------------------------------------------------------------------------

/**
 * Converts a subset of HTML to Markdown.
 * Handles: bold, italic, headings h1–h3, unordered lists, ordered lists.
 * Strips all other HTML tags.
 */
export function htmlToMarkdown(html: string): string {
  let md = html

  // Block-level replacements first (order matters)
  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, inner) => `# ${stripTags(inner)}\n\n`)
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, inner) => `## ${stripTags(inner)}\n\n`)
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, inner) => `### ${stripTags(inner)}\n\n`)

  // Paragraphs
  md = md.replace(/<\/p>/gi, '\n\n')
  md = md.replace(/<p[^>]*>/gi, '')

  // Lists — process <li> inside <ul> vs <ol>
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
    return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, item: string) => `- ${stripTags(item).trim()}\n`)
  })

  let olCounter = 0
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
    olCounter = 0
    return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, item: string) => {
      olCounter++
      return `${olCounter}. ${stripTags(item).trim()}\n`
    })
  })

  // Inline replacements
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, (_, _tag, inner) => `**${stripTags(inner)}**`)
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, (_, _tag, inner) => `*${stripTags(inner)}*`)

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n')

  // Strip remaining tags
  md = stripTags(md)

  // Normalize whitespace: collapse 3+ consecutive newlines to 2
  md = md.replace(/\n{3,}/g, '\n\n').trim()

  return md
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export interface MarkdownFile {
  filename: string
  content: string
}

/**
 * Converts a single diary entry + its content into a Markdown string
 * with YAML front-matter.
 */
export async function exportEntryAsMarkdown(
  entry: DiaryEntry,
  content: EntryContent | undefined
): Promise<string> {
  // Resolve sticker IDs to labels
  const stickerRecords = await db.entryStickers.where('entryId').equals(entry.id!).toArray()
  const stickerIds = stickerRecords.map(s => s.stickerId)

  // Resolve tag names
  let tagNames: string[] = []
  if (entry.tagIds && entry.tagIds.length > 0) {
    const tags = await db.tags.bulkGet(entry.tagIds)
    tagNames = tags.filter(Boolean).map(t => t!.name)
  }

  // Build YAML front-matter
  const frontMatter = [
    '---',
    `title: ${JSON.stringify(entry.title || '')}`,
    `date: ${JSON.stringify(entry.date)}`,
    stickerIds.length > 0
      ? `stickers: [${stickerIds.map(id => JSON.stringify(id)).join(', ')}]`
      : 'stickers: []',
    tagNames.length > 0
      ? `tags: [${tagNames.map(t => JSON.stringify(t)).join(', ')}]`
      : 'tags: []',
    `starred: ${entry.starred ?? false}`,
    `pinned: ${entry.pinned ?? false}`,
    entry.colorTone ? `colorTone: ${JSON.stringify(entry.colorTone)}` : null,
    '---',
  ]
    .filter(line => line !== null)
    .join('\n')

  // Build page content
  const pages = content?.pages ?? []
  const pageBlocks = pages.map(page => {
    const heading = page.title ? `# ${page.title}\n\n` : ''
    const body = htmlToMarkdown(page.content)
    return `${heading}${body}`
  })

  const body = pageBlocks.join('\n\n---\n\n')

  return `${frontMatter}\n\n${body}\n`
}

/**
 * Exports all non-deleted diary entries as an array of {filename, content} objects.
 * Callers can zip these or download them individually.
 */
export async function exportAllAsMarkdown(): Promise<MarkdownFile[]> {
  const entries = await db.diaryEntries
    .filter(e => !e.deletedAt)
    .sortBy('date')

  const files: MarkdownFile[] = []

  for (const entry of entries) {
    let content: EntryContent | undefined
    if (entry.latestContentId) {
      content = await db.entryContents.get(entry.latestContentId)
    }
    if (!content) {
      const versions = await db.entryContents
        .where('entryId')
        .equals(entry.id!)
        .sortBy('createdAt')
      content = versions[versions.length - 1]
    }

    const md = await exportEntryAsMarkdown(entry, content)

    // Build a safe filename
    const safeName = (entry.title || 'Untitled')
      .replace(/[/\\:*?"<>|]/g, '_')
      .slice(0, 60)
      .trim()
    const filename = `${entry.date}_${safeName}.md`

    files.push({ filename, content: md })
  }

  return files
}
