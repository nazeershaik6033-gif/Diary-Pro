'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { HeaderProvider, useHeader } from '@/app/contexts/HeaderContext'
import { ActiveWorkoutProvider } from '@/app/contexts/ActiveWorkoutContext'
import { DrawerNav } from '@/components/layout/DrawerNav'
import { FloatingActionButton } from '@/components/layout/FloatingActionButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
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

  useEffect(() => {
    if (!loaded) return // wait until DB settings are read
    if (pinEnabled && !isVerified) {
      router.replace('/pin')
    }
  }, [pinEnabled, isVerified, router, loaded])

  // Show nothing while DB loads — prevents flash of content before PIN redirect
  if (!loaded) return null

  const handleLogoClick = () => {
    // Dispatch reset event so DiaryPage clears its local state
    window.dispatchEvent(new Event('diary:reset'))
    if (pathname !== '/diary') {
      router.push('/diary')
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <DrawerNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main content — desktop always has 220px left margin, mobile has none */}
      <div className="md:ml-[220px] flex flex-col min-h-screen">
        <header
          className="flex items-center gap-2 px-3 sticky top-0 bg-paper z-10 border-b border-paper-300"
          style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(56px + env(safe-area-inset-top))' }}
        >
          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 text-ink-300 transition-colors"
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
            <span className="font-serif font-bold text-ink text-[15px] leading-none">My Journal</span>
          </button>

          <div className="flex-1" />

          {/* Global actions */}
          <Link href="/diary/new">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 text-ink-300 transition-colors font-serif font-bold text-base" aria-label="New diary entry">
              N
            </button>
          </Link>
          <Link href="/calendar">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 text-ink-300 transition-colors" aria-label="Calendar">
              <CalendarDays size={18} />
            </button>
          </Link>
          <Link href="/diary/search">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 text-ink-300 transition-colors" aria-label="Search">
              <Search size={18} />
            </button>
          </Link>
          <ThemeToggle />

          {/* Page-specific right slot */}
          {rightSlot}
        </header>

        <main className="pb-fab flex-1">
          {children}
        </main>
      </div>

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
