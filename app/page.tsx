'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useAuth } from '@/app/contexts/AuthContext'

export default function RootPage() {
  const router = useRouter()
  const { isVerified, pinEnabled } = useAuth()
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  // Clear stale page caches so old broken SW cache never blocks fresh HTML
  useEffect(() => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.filter(n => n === 'pages' || n === 'start-url').forEach(n => caches.delete(n))
      })
    }
  }, [])

  useEffect(() => {
    if (settings === undefined) return
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
