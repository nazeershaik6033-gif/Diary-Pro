'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen, Briefcase, ListChecks, Dumbbell, Settings, X, Flame,
  CheckSquare, Heart, Target, CalendarDays, Scale, PartyPopper,
  RotateCcw, Images, Search
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useStreak } from '@/lib/hooks/useStreak'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const NAV_ITEMS = [
  { href: '/diary',           label: 'Diary',      icon: BookOpen,     color: 'text-amber-warm' },
  { href: '/diary/throwback', label: 'On This Day', icon: RotateCcw,    color: 'text-rose-400' },
  { href: '/calendar',        label: 'Calendar',   icon: CalendarDays, color: 'text-blue-400' },
  { href: '/events',          label: 'Events',     icon: PartyPopper,  color: 'text-purple-400' },
  { href: '/library',         label: 'Library',    icon: Images,       color: 'text-indigo-400' },
  { href: '/work',      label: 'Work Log',  icon: Briefcase,    color: 'text-blue-500' },
  { href: '/gtd',       label: 'GTD',       icon: ListChecks,   color: 'text-sage' },
  { href: '/gym',       label: 'Gym',       icon: Dumbbell,     color: 'text-orange-500' },
  { href: '/habits',    label: 'Habits',    icon: CheckSquare,  color: 'text-purple-500' },
  { href: '/health',    label: 'Health',    icon: Heart,        color: 'text-blush' },
  { href: '/goals',     label: 'Goals',     icon: Target,       color: 'text-amber-dark' },
  { href: '/decisions', label: 'Decisions', icon: Scale,        color: 'text-green-500' },
]

interface DrawerNavProps {
  open: boolean
  onClose: () => void
}

export function DrawerNav({ open, onClose }: DrawerNavProps) {
  const pathname = usePathname()
  const streak = useStreak()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-30"
            onClick={onClose}
          />
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-paper shadow-warm-lg z-40 flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-paper-400">
              {/* Logo + brand */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden bg-paper-300 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${basePath}/logo.svg`} alt="" className="w-9 h-9 object-contain" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-serif font-bold text-ink leading-none">My Journal</h2>
                  {streak > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Flame size={12} className="text-orange-400" />
                      <span className="text-xs font-sans text-ink-300">{streak} day streak</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side: search + close */}
              <div className="flex items-center gap-1">
                <Link
                  href="/diary/search"
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-paper-300 transition-colors"
                  aria-label="Search"
                >
                  <Search size={18} className="text-ink-300" />
                </Link>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-paper-300 transition-colors">
                  <X size={18} className="text-ink-300" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {NAV_ITEMS.map(item => {
                const active = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-4 px-6 py-3 mx-3 rounded-xl transition-colors',
                      active ? 'bg-amber-warm text-white' : 'text-ink hover:bg-paper-300'
                    )}
                  >
                    <item.icon size={20} className={active ? 'text-white' : item.color} />
                    <span className="font-sans font-medium text-base">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-paper-400 py-4">
              <Link
                href="/settings"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-4 px-6 py-3 mx-3 rounded-xl transition-colors',
                  pathname.startsWith('/settings') ? 'bg-amber-warm text-white' : 'text-ink hover:bg-paper-300'
                )}
              >
                <Settings size={20} className={pathname.startsWith('/settings') ? 'text-white' : 'text-ink-300'} />
                <span className="font-sans font-medium text-base">Settings</span>
              </Link>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}
