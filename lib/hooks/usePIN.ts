'use client'
import { useState, useCallback } from 'react'
import { db } from '@/lib/db'
import { hashPIN, verifyPIN } from '@/lib/utils/hash'

export function usePIN() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setupPIN = useCallback(async (pin: string) => {
    setLoading(true)
    setError(null)
    try {
      const hash = await hashPIN(pin)
      await db.settings.update('singleton', { pinHash: hash, pinEnabled: true })
    } catch {
      setError('Failed to set PIN')
    } finally {
      setLoading(false)
    }
  }, [])

  const removePIN = useCallback(async () => {
    await db.settings.update('singleton', { pinHash: undefined, pinEnabled: false })
  }, [])

  const check = useCallback(async (pin: string, storedHash: string): Promise<boolean> => {
    return verifyPIN(pin, storedHash)
  }, [])

  return { setupPIN, removePIN, check, loading, error }
}
