'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { HeaderProvider, useHeader } from '@/app/contexts/HeaderContext'
import { ActiveWorkoutProvider } from '@/app/contexts/ActiveWorkoutContext'
import { DrawerNav, useSidebarState } from '@/components/layout/DrawerNav'
import { FloatingActionButton } from '@/components/layout/FloatingActionButton'
import { useEffect } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

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

  const sideW = collapsed ? 'ml-[60px]' : 'ml-[220px]'

  return (
    <div className="min-h-screen bg-paper">
      <DrawerNav collapsed={collapsed} onToggle={toggle} />

      {/* All content sits to the right of the sidebar */}
      <div className={cn('flex flex-col transition-[margin-left] duration-200 ease-in-out', sideW)}>
        <header
          className="flex items-center gap-2 px-3 sticky top-0 bg-paper z-10 border-b border-paper-300"
          style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(56px + env(safe-area-inset-top))' }}
        >
          {/* Logo + name — centered */}
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

          {/* Page-injected right actions */}
          {rightSlot}
        </header>

        <main className="pb-24">
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
