'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

interface AuthContextValue {
  isVerified: boolean
  pinEnabled: boolean
  verify: () => void
  lock: () => void
}

const AuthContext = createContext<AuthContextValue>({
  isVerified: false,
  pinEnabled: false,
  verify: () => {},
  lock: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false)
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  const pinEnabled = settings?.pinEnabled ?? false

  useEffect(() => {
    if (!pinEnabled) setIsVerified(true)
  }, [pinEnabled])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && pinEnabled) setIsVerified(false)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [pinEnabled])

  const verify = useCallback(() => setIsVerified(true), [])
  const lock = useCallback(() => { if (pinEnabled) setIsVerified(false) }, [pinEnabled])

  return (
    <AuthContext.Provider value={{ isVerified, pinEnabled, verify, lock }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
