'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen, Briefcase, ListChecks, Dumbbell, Settings,
  CheckSquare, Heart, Target, CalendarDays, Scale, PartyPopper,
  RotateCcw, Images, Flame, Search, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useStreak } from '@/lib/hooks/useStreak'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const NAV_ITEMS = [
  { href: '/diary',           label: 'Diary',       icon: BookOpen,    color: 'text-amber-warm' },
  { href: '/diary/throwback', label: 'On This Day',  icon: RotateCcw,   color: 'text-rose-400' },
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
]

const SIDEBAR_KEY = 'sidebar-collapsed'

interface DrawerNavProps {
  collapsed: boolean
  onToggle: () => void
}

export function DrawerNav({ collapsed, onToggle }: DrawerNavProps) {
  const pathname = usePathname()
  const streak = useStreak()

  const W = collapsed ? 'w-[60px]' : 'w-[220px]'

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 bottom-0 bg-paper border-r border-paper-300 z-20 flex flex-col transition-[width] duration-200 ease-in-out overflow-hidden',
        W
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Sidebar header */}
      <div
        className={cn(
          'flex items-center border-b border-paper-300 flex-shrink-0',
          collapsed ? 'justify-center h-14' : 'justify-between px-3 h-14'
        )}
      >
        {!collapsed && (
          <Link href="/diary" className="flex items-center gap-2 min-w-0 flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${basePath}/logo.svg`} alt="" className="w-7 h-7 flex-shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="font-serif font-bold text-ink text-[14px] leading-none truncate">My Journal</p>
              {streak > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Flame size={10} className="text-orange-400" />
                  <span className="text-[10px] font-sans text-ink-300">{streak}d streak</span>
                </div>
              )}
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 transition-colors flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <PanelLeftOpen size={17} className="text-ink-300" />
            : <PanelLeftClose size={17} className="text-ink-300" />}
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-2 overflow-x-hidden">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/diary' && pathname.startsWith(item.href))
          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  'flex items-center transition-colors rounded-xl mx-2 my-0.5',
                  collapsed ? 'justify-center w-11 h-11 mx-auto' : 'gap-3 px-3 py-2.5',
                  active
                    ? 'bg-amber-warm text-white'
                    : 'hover:bg-paper-300 text-ink'
                )}
              >
                <item.icon
                  size={18}
                  className={cn('flex-shrink-0', active ? 'text-white' : item.color)}
                />
                {!collapsed && (
                  <span className="font-sans font-medium text-[13px] whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </Link>
              {/* Tooltip — only when collapsed */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-ink text-white text-xs font-sans rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Search + Settings at bottom */}
      <div className="border-t border-paper-300 py-2 flex-shrink-0">
        {[
          { href: '/diary/search', label: 'Search',   icon: Search,   color: 'text-ink-300' },
          { href: '/settings',     label: 'Settings', icon: Settings, color: 'text-ink-300' },
        ].map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  'flex items-center transition-colors rounded-xl mx-2 my-0.5',
                  collapsed ? 'justify-center w-11 h-11 mx-auto' : 'gap-3 px-3 py-2.5',
                  active ? 'bg-amber-warm text-white' : 'hover:bg-paper-300 text-ink'
                )}
              >
                <item.icon size={18} className={cn('flex-shrink-0', active ? 'text-white' : item.color)} />
                {!collapsed && (
                  <span className="font-sans font-medium text-[13px] whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </Link>
              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-ink text-white text-xs font-sans rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    if (saved !== null) setCollapsed(saved === 'true')
  }, [])

  const toggle = () => {
    setCollapsed(v => {
      const next = !v
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return next
    })
  }

  return { collapsed, toggle }
}
