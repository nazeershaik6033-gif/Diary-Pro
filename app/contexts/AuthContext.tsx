'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

interface AuthContextValue {
  isVerified: boolean
  pinEnabled: boolean
  loaded: boolean
  verify: () => void
  lock: () => void
}

const AuthContext = createContext<AuthContextValue>({
  isVerified: false,
  pinEnabled: false,
  loaded: false,
  verify: () => {},
  lock: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false)
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  // `settings` is `undefined` while Dexie is loading, then the actual value (or null)
  const loaded = settings !== undefined
  const pinEnabled = settings?.pinEnabled ?? false

  useEffect(() => {
    // Wait until DB has loaded before deciding verified state.
    // Without this guard, pinEnabled defaults to false while loading,
    // causing setIsVerified(true) before we know whether PIN is actually enabled.
    if (!loaded) return
    if (!pinEnabled) setIsVerified(true)
  }, [pinEnabled, loaded])

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
    <AuthContext.Provider value={{ isVerified, pinEnabled, loaded, verify, lock }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
