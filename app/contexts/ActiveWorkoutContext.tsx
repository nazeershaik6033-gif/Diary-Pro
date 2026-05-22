'use client'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { WorkoutLog, WorkoutSet, PersonalRecord } from '@/types'
import { db } from '@/lib/db'
import { logSet, finishWorkout } from '@/lib/db/gym'
import { checkAndSavePR } from '@/lib/utils/pr-detector'
import { toDateString } from '@/lib/utils/date'

interface ActiveWorkoutContextValue {
  activeLog: WorkoutLog | null
  sets: WorkoutSet[]
  lastPR: PersonalRecord | null
  startWorkout: (log: Omit<WorkoutLog, 'id'>) => Promise<number>
  addSet: (set: Omit<WorkoutSet, 'id' | 'workoutLogId'>) => Promise<void>
  removeSet: (id: number) => Promise<void>
  completeWorkout: () => Promise<void>
  cancelWorkout: () => Promise<void>
  clearPR: () => void
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextValue>({} as ActiveWorkoutContextValue)

export function ActiveWorkoutProvider({ children }: { children: ReactNode }) {
  const [activeLog, setActiveLog] = useState<WorkoutLog | null>(null)
  const [sets, setSets] = useState<WorkoutSet[]>([])
  const [lastPR, setLastPR] = useState<PersonalRecord | null>(null)

  const startWorkout = useCallback(async (log: Omit<WorkoutLog, 'id'>) => {
    const id = await db.workoutLogs.add(log)
    setActiveLog({ ...log, id })
    setSets([])
    return id
  }, [])

  const addSet = useCallback(async (setData: Omit<WorkoutSet, 'id' | 'workoutLogId'>) => {
    if (!activeLog?.id) return
    const fullSet: Omit<WorkoutSet, 'id'> = { ...setData, workoutLogId: activeLog.id }
    const id = await logSet(fullSet)
    const saved = { ...fullSet, id }
    setSets(prev => [...prev, saved])
    const pr = await checkAndSavePR(saved, activeLog.id, toDateString())
    if (pr) setLastPR(pr)
  }, [activeLog])

  const removeSet = useCallback(async (id: number) => {
    await db.workoutSets.delete(id)
    setSets(prev => prev.filter(s => s.id !== id))
  }, [])

  const completeWorkout = useCallback(async () => {
    if (!activeLog?.id) return
    await finishWorkout(activeLog.id)
    setActiveLog(null)
    setSets([])
  }, [activeLog])

  const cancelWorkout = useCallback(async () => {
    if (!activeLog?.id) return
    await db.workoutSets.where('workoutLogId').equals(activeLog.id).delete()
    await db.workoutLogs.delete(activeLog.id)
    setActiveLog(null)
    setSets([])
  }, [activeLog])

  const clearPR = useCallback(() => setLastPR(null), [])

  return (
    <ActiveWorkoutContext.Provider value={{
      activeLog, sets, lastPR,
      startWorkout, addSet, removeSet, completeWorkout, cancelWorkout, clearPR,
    }}>
      {children}
    </ActiveWorkoutContext.Provider>
  )
}

export const useActiveWorkout = () => useContext(ActiveWorkoutContext)
