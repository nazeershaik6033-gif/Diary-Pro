'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { HeaderProvider, useHeader } from '@/app/contexts/HeaderContext'
import { ActiveWorkoutProvider } from '@/app/contexts/ActiveWorkoutContext'
import { DrawerNav } from '@/components/layout/DrawerNav'
import { BottomNav } from '@/components/layout/BottomNav'
import { useEffect } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'
import Link from 'next/link'
import { Search, Menu, CalendarDays } from 'lucide-react'
import { usePathname } from 'next/navigation'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function AppShell({ children }: { children: React.ReactNode }) {
  useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isVerified, pinEnabled, loaded } = useAuth()
  const { rightSlot } = useHeader()
  const router = useRouter()
  const pathname = usePathname()
  const [forceShow, setForceShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setForceShow(true), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!loaded) return
    if (pinEnabled && !isVerified) {
      router.replace('/pin')
    }
  }, [pinEnabled, isVerified, router, loaded])

  if (!loaded && !forceShow) return (
    <div className="min-h-screen bg-[#0e0e0e]" />
  )

  const handleLogoClick = () => {
    // Dispatch reset event so DiaryPage clears its local state
    window.dispatchEvent(new Event('diary:reset'))
    if (pathname !== '/diary') {
      router.push('/diary')
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e]">
      <DrawerNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main content — desktop always has 220px left margin, mobile has none */}
      <div className="md:ml-[220px] flex flex-col min-h-screen">
        <header
          className="flex items-center gap-2 px-3 sticky top-0 bg-[#0e0e0e] z-10 border-b border-paper-400"
          style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(44px + env(safe-area-inset-top))' }}
        >
          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-400 text-[#c4933f] transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo + name — left-aligned, click resets diary state */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${basePath}/logo.svg`} alt="My Journal logo" className="w-7 h-7 object-contain" />
            <span className="font-serif font-bold text-[#c4933f] text-[15px] leading-none">My Journal</span>
          </button>

          <div className="flex-1" />

          {/* Global actions */}
          <Link href="/diary/new">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-400 text-ink-300 transition-colors font-serif font-bold text-base" aria-label="New diary entry">
              N
            </button>
          </Link>
          <Link href="/calendar">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-400 text-ink-300 transition-colors" aria-label="Calendar">
              <CalendarDays size={18} />
            </button>
          </Link>
          <Link href="/diary/search">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-400 text-ink-300 transition-colors" aria-label="Search">
              <Search size={18} />
            </button>
          </Link>
          {/* Page-specific right slot */}
          {rightSlot}
        </header>

        <main className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-fab flex-1">
          {children}
        </main>
      </div>

      <BottomNav />
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
