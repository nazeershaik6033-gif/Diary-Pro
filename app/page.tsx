'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useAuth } from '@/app/contexts/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

export default function RootPage() {
  const router = useRouter()
  const { isVerified, pinEnabled } = useAuth()
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  useEffect(() => {
    if (settings === undefined) return
    if (!settings) return

    if (pinEnabled && !isVerified) {
      router.replace('/pin')
    } else {
      router.replace('/diary')
    }
  }, [settings, pinEnabled, isVerified, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-paper">
      <Spinner className="w-8 h-8" />
    </div>
  )
}
