'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useAuth } from '@/app/contexts/AuthContext'
import { PINPad } from '@/components/shared/PINPad'
import { verifyPIN } from '@/lib/utils/hash'
import { Lock } from 'lucide-react'

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
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 pt-safe pb-safe">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-faint flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-amber-warm" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-ink">Diary Pro</h1>
        <p className="text-sm font-sans text-ink-300 mt-1">Enter your PIN to continue</p>
        {attempts >= 3 && (
          <p className="text-xs text-red-400 mt-2">Incorrect PIN. Try again.</p>
        )}
      </div>
      <PINPad onComplete={handlePIN} error={error} />
    </div>
  )
}
