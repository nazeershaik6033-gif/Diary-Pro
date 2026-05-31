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
        className="fixed bottom-0 left-0 right-0 md:hidden z-20 bg-[#131313] border-t border-[#222] rounded-t-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {NAV_ITEMS.map((item, i) => {
            if (!item) {
              return (
                <button
                  key="capture"
                  onClick={() => setCaptureOpen(true)}
                  className="w-12 h-12 rounded-full bg-[#0e0e0e] flex items-center justify-center -mt-5 shadow-[0_4px_20px_rgba(196,147,63,0.3),0_2px_8px_rgba(0,0,0,0.6)] border border-[#c4933f]/30 active:scale-90 transition-transform duration-100"
                  aria-label="Quick capture"
                >
                  <Plus size={22} className="text-[#c4933f]" />
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
                className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-0"
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
