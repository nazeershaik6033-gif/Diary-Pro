'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { HeaderProvider, useHeader } from '@/app/contexts/HeaderContext'
import { ActiveWorkoutProvider } from '@/app/contexts/ActiveWorkoutContext'
import { DrawerNav, useSidebarState, getSidebarWidth } from '@/components/layout/DrawerNav'
import { FloatingActionButton } from '@/components/layout/FloatingActionButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useEffect } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'
import Link from 'next/link'
import { Search, Plus } from 'lucide-react'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function AppShell({ children }: { children: React.ReactNode }) {
  useTheme()
  const { collapsed, toggle } = useSidebarState()
  const { isVerified, pinEnabled } = useAuth()
  const { rightSlot } = useHeader()
  const router = useRouter()

  useEffect(() => {
    if (pinEnabled && !isVerified) {
      router.replace('/pin')
    }
  }, [pinEnabled, isVerified, router])

  const sideWidth = getSidebarWidth(collapsed)

  return (
    <div className="min-h-screen bg-paper">
      <DrawerNav collapsed={collapsed} onToggle={toggle} />

      {/* Main content shifts right of sidebar */}
      <div
        style={{ marginLeft: sideWidth, transition: 'margin-left 0.2s ease' }}
        className="flex flex-col min-h-screen"
      >
        <header
          className="flex items-center gap-2 px-3 sticky top-0 bg-paper z-10 border-b border-paper-300"
          style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(56px + env(safe-area-inset-top))' }}
        >
          {/* Logo + name — left-aligned */}
          <Link href="/diary" className="flex items-center gap-2 flex-shrink-0">
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

          {/* Global actions — visible on all pages */}
          <Link href="/diary/new">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 text-ink-300 transition-colors"
              aria-label="New diary entry"
            >
              <Plus size={18} />
            </button>
          </Link>
          <Link href="/diary/search">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 text-ink-300 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </Link>
          <ThemeToggle />

          {/* Page-specific right actions (injected by individual pages) */}
          {rightSlot}
        </header>

        <main className="pb-24 flex-1">
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
