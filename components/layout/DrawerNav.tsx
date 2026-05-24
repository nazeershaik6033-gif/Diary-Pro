'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen, Briefcase, ListChecks, Dumbbell, Settings,
  CheckSquare, Heart, Target, CalendarDays, Scale, PartyPopper,
  RotateCcw, Images, Flame, Search, Sparkles, BookMarked,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useStreak } from '@/lib/hooks/useStreak'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const NAV_ITEMS = [
  { href: '/diary',           label: 'Diary',       icon: BookOpen,    color: 'text-amber-warm' },
  { href: '/diary/throwback', label: 'On This Day',  icon: RotateCcw,   color: 'text-rose-400' },
  { href: '/diary/digest',    label: 'AI Digest',   icon: Sparkles,    color: 'text-violet-400' },
  { href: '/calendar',        label: 'Calendar',    icon: CalendarDays, color: 'text-blue-400' },
  { href: '/events',          label: 'Events',      icon: PartyPopper, color: 'text-purple-400' },
  { href: '/library',         label: 'Library',     icon: Images,      color: 'text-indigo-400' },
  { href: '/work',            label: 'Work Log',    icon: Briefcase,   color: 'text-blue-500' },
  { href: '/gtd',             label: 'GTD',         icon: ListChecks,  color: 'text-sage' },
  { href: '/gym',             label: 'Gym',         icon: Dumbbell,    color: 'text-orange-500' },
  { href: '/habits',          label: 'Habits',      icon: CheckSquare, color: 'text-purple-500' },
  { href: '/health',          label: 'Health',      icon: Heart,       color: 'text-blush' },
  { href: '/goals',           label: 'Goals',       icon: Target,      color: 'text-amber-dark' },
  { href: '/decisions',       label: 'Decisions',   icon: Scale,       color: 'text-green-500' },
  { href: '/articles',        label: 'Article Reader', icon: BookMarked, color: 'text-teal-500' },
  { href: '/diary/search',    label: 'Search',         icon: Search,     color: 'text-sky-500' },
  { href: '/settings',        label: 'Settings',       icon: Settings,   color: 'text-slate-500' },
]

interface DrawerNavProps {
  open: boolean
  onClose: () => void
}

export function DrawerNav({ open, onClose }: DrawerNavProps) {
  const pathname = usePathname()
  const streak = useStreak()

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-[220px] bg-paper border-r border-paper-300 z-30 flex flex-col',
          'transition-transform duration-200',
          // Mobile: hidden by default, slide in when open
          open ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible regardless of open state
          'md:translate-x-0',
        )}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-2.5 px-4 border-b border-paper-300 flex-shrink-0 h-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${basePath}/logo.svg`} alt="" className="w-7 h-7 flex-shrink-0 object-contain" />
          <div className="min-w-0 overflow-hidden">
            <p className="font-serif font-bold text-ink text-[14px] leading-none truncate">My Journal</p>
            {streak > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Flame size={10} className="text-orange-400" />
                <span className="text-[10px] font-sans text-ink-300">{streak}d streak</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {NAV_ITEMS.map(item => {
            const active = item.href === '/diary'
              ? pathname === '/diary' || (pathname.startsWith('/diary/') && !NAV_ITEMS.slice(1).some(n => n.href !== '/diary' && n.href.startsWith('/diary/') && pathname.startsWith(n.href)))
              : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <NavItem key={item.href} {...item} active={active} onClose={onClose} />
            )
          })}
        </div>

      </aside>
    </>
  )
}

function NavItem({
  href, label, icon: Icon, color, active, onClose,
}: {
  href: string; label: string; icon: React.ElementType; color: string; active: boolean; onClose: () => void
}) {
  return (
    <div className="mx-2 my-0.5">
      <Link
        href={href}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
          active ? 'bg-amber-warm' : 'hover:bg-paper-300'
        )}
      >
        <Icon size={18} className={cn('flex-shrink-0', active ? 'text-white' : color)} />
        <span className={cn('font-sans font-medium text-[13px] whitespace-nowrap', active ? 'text-white' : 'text-ink')}>
          {label}
        </span>
      </Link>
    </div>
  )
}
