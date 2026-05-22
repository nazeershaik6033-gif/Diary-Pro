'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { computeStreak } from '@/lib/utils/date'

export function useStreak(): number {
  const dates = useLiveQuery(
    () => db.diaryEntries.orderBy('date').keys(),
    []
  ) as string[] | undefined

  if (!dates) return 0
  return computeStreak(dates)
}
