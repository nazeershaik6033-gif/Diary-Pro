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
    // settings === null means new user (no record yet) → go to diary
    if (pinEnabled && !isVerified) {
      router.replace('/pin')
    } else {
      router.replace('/diary')
    }
  }, [settings, pinEnabled, isVerified, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0e0e0e]">
      <div className="w-8 h-8 rounded-full border-2 border-[#c4933f]/30 border-t-[#c4933f] animate-spin" />
    </div>
  )
}
