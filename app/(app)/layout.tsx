'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { HeaderProvider, useHeader } from '@/app/contexts/HeaderContext'
import { ActiveWorkoutProvider } from '@/app/contexts/ActiveWorkoutContext'
import { DrawerNav } from '@/components/layout/DrawerNav'
import { FloatingActionButton } from '@/components/layout/FloatingActionButton'
import { Menu } from 'lucide-react'
import { useEffect } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'
import Link from 'next/link'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function AppShell({ children }: { children: React.ReactNode }) {
  useTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isVerified, pinEnabled } = useAuth()
  const { rightSlot } = useHeader()
  const router = useRouter()

  useEffect(() => {
    if (pinEnabled && !isVerified) {
      router.replace('/pin')
    }
  }, [pinEnabled, isVerified, router])

  return (
    <div className="min-h-screen bg-paper">
      <header
        className="flex items-center gap-2 px-3 sticky top-0 bg-paper z-10 border-b border-paper-300"
        style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(56px + env(safe-area-inset-top))' }}
      >
        {/* Hamburger — left */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={22} className="text-ink" />
        </button>

        {/* Logo + name — centered absolutely so it's always mid-header */}
        <Link
          href="/diary"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}/logo.svg`}
            alt="My Journal logo"
            className="w-7 h-7 object-contain"
          />
          <span className="font-serif font-bold text-ink text-[15px] leading-none">
            My Journal
          </span>
        </Link>

        <div className="flex-1" />

        {/* Page-injected right actions (e.g. calendar + search on diary page) */}
        {rightSlot}
      </header>

      <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="pb-24">
        {children}
      </main>

      <FloatingActionButton />
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActiveWorkoutProvider>
      <HeaderProvider>
        <AppShell>{children}</AppShell>
      </HeaderProvider>
    </ActiveWorkoutProvider>
  )
}
