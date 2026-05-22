import { db } from '@/lib/db'
import type { HealthLog, SleepLog, WaterLog, Supplement, SupplementLog } from '@/types'
import { toDateString } from '@/lib/utils/date'

export async function logHealth(entry: Omit<HealthLog, 'id'>): Promise<number> {
  return db.healthLogs.add(entry)
}

export async function logSleep(entry: Omit<SleepLog, 'id'>): Promise<number> {
  const existing = await db.sleepLogs.where('date').equals(entry.date).first()
  if (existing?.id) {
    await db.sleepLogs.update(existing.id, entry)
    return existing.id
  }
  return db.sleepLogs.add(entry)
}

export async function logWater(date: string, glasses: number, goalGlasses = 8): Promise<void> {
  const existing = await db.waterLogs.where('date').equals(date).first()
  if (existing?.id) {
    await db.waterLogs.update(existing.id, { glasses, goalGlasses })
  } else {
    await db.waterLogs.add({ date, glasses, goalGlasses })
  }
}

export async function getTodayWater(): Promise<WaterLog | undefined> {
  return db.waterLogs.where('date').equals(toDateString()).first()
}

export async function addSupplement(supplement: Omit<Supplement, 'id'>): Promise<number> {
  return db.supplements.add(supplement)
}

export async function logSupplementTaken(date: string, supplementId: number, taken: boolean): Promise<void> {
  const existing = await db.supplementLogs.where({ date, supplementId }).first()
  if (existing?.id) {
    await db.supplementLogs.update(existing.id, { taken, takenAt: taken ? Date.now() : undefined })
  } else {
    await db.supplementLogs.add({ date, supplementId, taken, takenAt: taken ? Date.now() : undefined })
  }
}

export function computeSleepDuration(bedTime: string, wakeTime: string): number {
  const [bh, bm] = bedTime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let mins = (wh * 60 + wm) - (bh * 60 + bm)
  if (mins < 0) mins += 24 * 60
  return Math.round(mins / 60 * 10) / 10
}
