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

const BOTTOM_ITEMS = [
  { href: '/diary/search', label: 'Search',   icon: Search,   color: 'text-ink-300' },
  { href: '/settings',     label: 'Settings', icon: Settings, color: 'text-ink-300' },
]

const SIDEBAR_KEY = 'sidebar-collapsed'
const SIDEBAR_WIDTH_EXPANDED = 220
const SIDEBAR_WIDTH_COLLAPSED = 60

export interface SidebarState {
  collapsed: boolean
  toggle: () => void
}

export function useSidebarState(): SidebarState {
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY)
      if (saved !== null) setCollapsed(saved === 'true')
    } catch { /* localStorage unavailable */ }
  }, [])

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem(SIDEBAR_KEY, String(next)) } catch { /* ignore */ }
      return next
    })
  }

  return { collapsed, toggle }
}

export function getSidebarWidth(collapsed: boolean) {
  return collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED
}

interface DrawerNavProps {
  collapsed: boolean
  onToggle: () => void
}

export function DrawerNav({ collapsed, onToggle }: DrawerNavProps) {
  const pathname = usePathname()
  const streak = useStreak()

  const width = getSidebarWidth(collapsed)

  return (
    <aside
      style={{
        width,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        transition: 'width 0.2s ease',
      }}
      className="fixed top-0 left-0 bottom-0 bg-paper border-r border-paper-300 z-20 flex flex-col overflow-hidden"
    >
      {/* Sidebar header */}
      <div
        className="flex items-center border-b border-paper-300 flex-shrink-0 h-14"
        style={{ justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '0' : '0 12px' }}
      >
        {!collapsed && (
          <Link href="/diary" className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
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
          </Link>
        )}
        <button
          type="button"
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {NAV_ITEMS.map(item => {
          const active = item.href === '/diary'
            ? pathname === '/diary' || pathname.startsWith('/diary/')
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <NavItem key={item.href} {...item} active={active} collapsed={collapsed} />
          )
        })}
      </div>

      {/* Bottom items */}
      <div className="border-t border-paper-300 py-2 flex-shrink-0">
        {BOTTOM_ITEMS.map(item => {
          const active = pathname.startsWith(item.href)
          return <NavItem key={item.href} {...item} active={active} collapsed={collapsed} />
        })}
      </div>
    </aside>
  )
}

function NavItem({
  href, label, icon: Icon, color, active, collapsed,
}: {
  href: string; label: string; icon: React.ElementType; color: string; active: boolean; collapsed: boolean
}) {
  return (
    <div className="relative group mx-2 my-0.5">
      <Link
        href={href}
        style={{ justifyContent: collapsed ? 'center' : undefined }}
        className={cn(
          'flex items-center rounded-xl transition-colors',
          collapsed ? 'w-11 h-11 mx-auto' : 'gap-3 px-3 py-2.5',
          active ? 'bg-amber-warm' : 'hover:bg-paper-300'
        )}
      >
        <Icon size={18} className={cn('flex-shrink-0', active ? 'text-white' : color)} />
        {!collapsed && (
          <span className={cn('font-sans font-medium text-[13px] whitespace-nowrap', active ? 'text-white' : 'text-ink')}>
            {label}
          </span>
        )}
      </Link>
      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-ink text-white text-xs font-sans rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
          {label}
        </div>
      )}
    </div>
  )
}
