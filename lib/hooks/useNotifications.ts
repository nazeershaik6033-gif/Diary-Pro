'use client'
import { useCallback } from 'react'
import { db } from '@/lib/db'

export function useNotifications() {
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  const isGranted = useCallback((): boolean => {
    if (!('Notification' in window)) return false
    return Notification.permission === 'granted'
  }, [])

  const scheduleReminder = useCallback((title: string, body: string, timeStr: string) => {
    if (!isGranted()) return
    const [hours, minutes] = timeStr.split(':').map(Number)
    const now = new Date()
    const target = new Date()
    target.setHours(hours, minutes, 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1)
    const delay = target.getTime() - now.getTime()
    setTimeout(() => {
      new Notification(title, { body, icon: '/icons/icon-192x192.png' })
    }, delay)
  }, [isGranted])

  const updateSettings = useCallback(async (settings: Record<string, unknown>) => {
    await db.settings.update('singleton', { notifications: settings as never })
  }, [])

  return { requestPermission, isGranted, scheduleReminder, updateSettings }
}
