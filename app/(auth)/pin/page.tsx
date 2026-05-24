'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useAuth } from '@/app/contexts/AuthContext'
import { PINPad } from '@/components/shared/PINPad'
import { verifyPIN } from '@/lib/utils/hash'

export default function PinPage() {
  const router = useRouter()
  const { verify } = useAuth()
  const [error, setError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  useEffect(() => {
    if (settings && !settings.pinEnabled) {
      router.replace('/diary')
    }
  }, [settings, router])

  const handlePIN = async (pin: string) => {
    if (!settings?.pinHash) return
    const valid = await verifyPIN(pin, settings.pinHash)
    if (valid) {
      setError(false)
      verify()
      router.replace('/diary')
    } else {
      setError(true)
      setAttempts(a => a + 1)
      setTimeout(() => setError(false), 600)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 pt-safe pb-safe"
      style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)' }}
    >
      <div className="flex flex-col items-center gap-10 w-full max-w-xs">
        <div className="text-center space-y-2">
          <p className="text-white text-2xl font-light tracking-wide">Enter Passcode</p>
          {attempts >= 3 && (
            <p className="text-red-400 text-sm font-sans">Incorrect PIN — try again</p>
          )}
        </div>

        <PINPad variant="lock" onComplete={handlePIN} error={error} />
      </div>
    </div>
  )
}
