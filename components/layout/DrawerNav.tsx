'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen, Briefcase, ListChecks, Dumbbell, Settings,
  CheckSquare, Heart, Target, CalendarDays, Scale, PartyPopper,
  RotateCcw, Images, Flame, Search, Sparkles, BookMarked,
  GripVertical, Pencil, X,
} from 'lucide-react'
import { Reorder, useDragControls } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { cn } from '@/lib/utils/cn'
import { useStreak } from '@/lib/hooks/useStreak'
import { db } from '@/lib/db'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const DEFAULT_NAV_ITEMS = [
  { href: '/diary',           label: 'Diary',          icon: BookOpen,    color: 'text-amber-warm' },
  { href: '/diary/throwback', label: 'On This Day',    icon: RotateCcw,   color: 'text-rose-400' },
  { href: '/diary/digest',    label: 'AI Digest',      icon: Sparkles,    color: 'text-violet-400' },
  { href: '/calendar',        label: 'Calendar',       icon: CalendarDays, color: 'text-blue-400' },
  { href: '/events',          label: 'Events',         icon: PartyPopper, color: 'text-purple-400' },
  { href: '/library',         label: 'Library',        icon: Images,      color: 'text-indigo-400' },
  { href: '/work',            label: 'Work Log',       icon: Briefcase,   color: 'text-blue-500' },
  { href: '/gtd',             label: 'GTD',            icon: ListChecks,  color: 'text-sage' },
  { href: '/gym',             label: 'Exercise & Calories', icon: Dumbbell, color: 'text-orange-500' },
  { href: '/habits',          label: 'Habits',         icon: CheckSquare, color: 'text-purple-500' },
  { href: '/health',          label: 'Health',         icon: Heart,       color: 'text-blush' },
  { href: '/goals',           label: 'Goals',          icon: Target,      color: 'text-amber-dark' },
  { href: '/decisions',       label: 'Decisions',      icon: Scale,       color: 'text-green-500' },
  { href: '/articles',        label: 'Article Reader', icon: BookMarked,  color: 'text-teal-500' },
  { href: '/diary/search',    label: 'Search',         icon: Search,      color: 'text-sky-500' },
  { href: '/settings',        label: 'Settings',       icon: Settings,    color: 'text-slate-500' },
]

const NAV_MAP = Object.fromEntries(DEFAULT_NAV_ITEMS.map(item => [item.href, item]))

interface DrawerNavProps {
  open: boolean
  onClose: () => void
}

export function DrawerNav({ open, onClose }: DrawerNavProps) {
  const pathname = usePathname()
  const streak = useStreak()
  const [editing, setEditing] = useState(false)

  const settings = useLiveQuery(() => db.settings.get('singleton'))
  const savedOrder: string[] | undefined = settings?.sidebarOrder

  const orderedItems = useMemo(() => {
    if (!savedOrder || savedOrder.length === 0) return DEFAULT_NAV_ITEMS
    const ordered = savedOrder.map(href => NAV_MAP[href]).filter(Boolean)
    // Append any items not yet in saved order (newly added nav items)
    const extras = DEFAULT_NAV_ITEMS.filter(item => !savedOrder.includes(item.href))
    return [...ordered, ...extras]
  }, [savedOrder])

  const [localOrder, setLocalOrder] = useState<string[]>([])
  const displayItems = useMemo(() => {
    if (!editing) return orderedItems
    if (localOrder.length === 0) return orderedItems
    return localOrder.map(href => NAV_MAP[href]).filter(Boolean)
  }, [editing, orderedItems, localOrder])

  function startEditing() {
    setLocalOrder(orderedItems.map(i => i.href))
    setEditing(true)
  }

  async function saveOrder() {
    const order = localOrder.length > 0 ? localOrder : orderedItems.map(i => i.href)
    await db.settings.update('singleton', { sidebarOrder: order })
    setEditing(false)
  }

  function cancelEditing() {
    setLocalOrder([])
    setEditing(false)
  }

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
          open ? 'translate-x-0' : '-translate-x-full',
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
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="font-serif font-bold text-ink text-[14px] leading-none truncate">My Journal</p>
            {streak > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Flame size={10} className="text-orange-400" />
                <span className="text-[10px] font-sans text-ink-300">{streak}d streak</span>
              </div>
            )}
          </div>
          {editing ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={saveOrder}
                className="text-[10px] font-sans font-semibold text-amber-warm px-2 py-1 rounded-lg hover:bg-paper-300"
                aria-label="Save order"
              >
                Done
              </button>
              <button
                onClick={cancelEditing}
                className="p-1 rounded-lg hover:bg-paper-300 text-ink-300"
                aria-label="Cancel editing"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-paper-300 text-ink-300"
              aria-label="Reorder sidebar"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {editing ? (
            <Reorder.Group
              axis="y"
              values={localOrder}
              onReorder={setLocalOrder}
              className="list-none p-0 m-0"
            >
              {displayItems.map(item => (
                <ReorderNavItem key={item.href} item={item} />
              ))}
            </Reorder.Group>
          ) : (
            orderedItems.map(item => {
              const active = item.href === '/diary'
                ? pathname === '/diary' || (pathname.startsWith('/diary/') && !DEFAULT_NAV_ITEMS.slice(1).some(n => n.href !== '/diary' && n.href.startsWith('/diary/') && pathname.startsWith(n.href)))
                : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <NavItem key={item.href} {...item} active={active} onClose={onClose} />
              )
            })
          )}
        </div>
      </aside>
    </>
  )
}

function ReorderNavItem({ item }: { item: typeof DEFAULT_NAV_ITEMS[number] }) {
  const controls = useDragControls()
  const Icon = item.icon
  return (
    <Reorder.Item value={item.href} dragListener={false} dragControls={controls}>
      <div className="mx-2 my-0.5 flex items-center gap-1 px-3 py-2.5 rounded-xl bg-paper-300/40">
        <div
          className="touch-none cursor-grab active:cursor-grabbing text-ink-200 flex-shrink-0"
          onPointerDown={e => controls.start(e)}
        >
          <GripVertical size={15} />
        </div>
        <Icon size={18} className={cn('flex-shrink-0 ml-1', item.color)} />
        <span className="font-sans font-medium text-[13px] whitespace-nowrap text-ink ml-1">
          {item.label}
        </span>
      </div>
    </Reorder.Item>
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
