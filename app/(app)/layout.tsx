'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { ActiveWorkoutProvider } from '@/app/contexts/ActiveWorkoutContext'
import { DrawerNav } from '@/components/layout/DrawerNav'
import { FloatingActionButton } from '@/components/layout/FloatingActionButton'
import { Menu } from 'lucide-react'
import { useEffect } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isVerified, pinEnabled } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (pinEnabled && !isVerified) {
      router.replace('/pin')
    }
  }, [pinEnabled, isVerified, router])

  return (
    <ActiveWorkoutProvider>
      <div className="min-h-screen bg-paper">
        <header className="flex items-center px-4 sticky top-0 bg-paper z-10 border-b border-paper-300"
          style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(56px + env(safe-area-inset-top))' }}>
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-ink" />
          </button>
          <div className="flex-1" />
        </header>

        <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        <main className="pb-24">
          {children}
        </main>

        <FloatingActionButton />
      </div>
    </ActiveWorkoutProvider>
  )
}
