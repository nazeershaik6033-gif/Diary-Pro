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

const SESSION_KEY = 'diary_pin_verified'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise from sessionStorage so refreshes don't re-trigger the PIN gate.
  // sessionStorage is cleared automatically when the tab/PWA is closed.
  const [isVerified, setIsVerified] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(SESSION_KEY) === '1'
    }
    return false
  })

  const settings = useLiveQuery(() => db.settings.get('singleton'))

  // `settings` is `undefined` while Dexie is loading, then the actual value (or null)
  const loaded = settings !== undefined
  const pinEnabled = settings?.pinEnabled ?? false

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      navigator.storage.persist()
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    if (!pinEnabled) {
      setIsVerified(true)
      sessionStorage.setItem(SESSION_KEY, '1')
    }
  }, [pinEnabled, loaded])

  const verify = useCallback(() => {
    setIsVerified(true)
    sessionStorage.setItem(SESSION_KEY, '1')
  }, [])

  const lock = useCallback(() => {
    if (pinEnabled) {
      setIsVerified(false)
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [pinEnabled])

  return (
    <AuthContext.Provider value={{ isVerified, pinEnabled, loaded, verify, lock }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
