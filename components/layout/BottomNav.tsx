'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, ListChecks, CheckSquare, BookMarked, Plus } from 'lucide-react'
import { useState } from 'react'
import { QuickCaptureModal } from '@/components/shared/QuickCaptureModal'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/diary',    label: 'Home',     icon: BookOpen    },
  { href: '/gtd',      label: 'GTD',      icon: ListChecks  },
  null,
  { href: '/tasks',    label: 'To Do',    icon: CheckSquare },
  { href: '/articles', label: 'Articles', icon: BookMarked  },
] as const

export function BottomNav() {
  const [captureOpen, setCaptureOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden z-20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-3 mb-3 rounded-[1.75rem] flex items-center justify-around px-2 py-2 bg-[#181818] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]">
          {NAV_ITEMS.map((item, i) => {
            if (!item) {
              return (
                <button
                  key="capture"
                  onClick={() => setCaptureOpen(true)}
                  className="w-14 h-14 rounded-full bg-[#141414] flex items-center justify-center -mt-7 shadow-[0_4px_20px_rgba(196,147,63,0.35),0_2px_8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] border border-[#c4933f]/25 active:scale-90 transition-transform duration-100"
                  aria-label="Quick capture"
                >
                  <Plus size={26} className="text-[#c4933f]" />
                </button>
              )
            }
            const active = item.href === '/diary'
              ? pathname === '/diary'
              : pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-4 py-1 min-w-0"
              >
                <Icon
                  size={22}
                  className={cn(
                    'transition-colors',
                    active ? 'text-[#c4933f]' : 'text-[#555]'
                  )}
                />
                <span className={cn(
                  'text-[10px] font-sans transition-colors',
                  active ? 'text-[#c4933f] font-semibold' : 'text-[#555]'
                )}>
                  {item.label}
                </span>
                {active && (
                  <div className="w-1 h-1 rounded-full bg-[#c4933f]" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <QuickCaptureModal open={captureOpen} onClose={() => setCaptureOpen(false)} />
    </>
  )
}
