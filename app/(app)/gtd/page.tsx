'use client'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { GTDStats } from '@/components/gtd/GTDStats'
import { Card } from '@/components/ui/Card'
import { Inbox, CheckSquare, Clock, Star, FolderOpen, CalendarCheck, ChevronRight, ClipboardList } from 'lucide-react'
import { motion } from 'framer-motion'
import { getWeekStart, formatDisplay } from '@/lib/utils/date'
import { parseISO, addDays } from 'date-fns'

const LINKS = [
  { href: '/gtd/inbox', label: 'Inbox', icon: Inbox, desc: 'Quick captures to process', color: 'text-orange-500', bg: 'bg-orange-50' },
  { href: '/gtd/next-actions', label: 'Next Actions', icon: CheckSquare, desc: 'What to do next', color: 'text-sage', bg: 'bg-sage/10' },
  { href: '/gtd/projects', label: 'Projects', icon: FolderOpen, desc: 'Multi-step outcomes', color: 'text-blue-500', bg: 'bg-blue-50' },
  { href: '/gtd/waiting-for', label: 'Waiting For', icon: Clock, desc: 'Delegated items', color: 'text-purple-500', bg: 'bg-purple-50' },
  { href: '/gtd/someday', label: 'Someday Maybe', icon: Star, desc: 'Future ideas', color: 'text-amber-warm', bg: 'bg-amber-faint' },
  { href: '/gtd/weekly-review', label: 'Weekly Review', icon: CalendarCheck, desc: 'Review and reflect', color: 'text-blush', bg: 'bg-blush/10' },
  { href: '/gtd/logs', label: 'Activity Logs', icon: ClipboardList, desc: 'History of all GTD actions', color: 'text-ink-300', bg: 'bg-paper-300' },
]

export default function GTDPage() {
  const lastReview = useLiveQuery(() => db.gtdWeeklyReviews.orderBy('weekStartDate').last(), [])
  const weekStart = getWeekStart()
  const reviewDue = !lastReview || lastReview.weekStartDate < weekStart

  return (
    <div className="px-4 pb-4">
      <div className="pt-2 pb-4">
        <h2 className="text-2xl font-serif font-bold text-ink">Getting Things Done</h2>
        <p className="text-sm font-sans text-ink-300">Trusted system for all your commitments</p>
      </div>

      <div className="mb-4">
        <GTDStats />
      </div>

      {reviewDue && (
        <Link href="/gtd/weekly-review">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blush/10 border border-blush/30 rounded-2xl p-4 mb-4 flex items-center justify-between"
          >
            <div>
              <p className="font-serif font-semibold text-ink">Weekly Review due</p>
              <p className="text-xs font-sans text-ink-300 mt-0.5">Keep your system current</p>
            </div>
            <ChevronRight size={18} className="text-ink-300" />
          </motion.div>
        </Link>
      )}

      <div className="space-y-2">
        {LINKS.map((link, i) => (
          <motion.div key={link.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={link.href}>
              <Card className="p-4 flex items-center gap-4 hover:shadow-warm-md transition-shadow active:scale-[0.99]">
                <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center flex-shrink-0`}>
                  <link.icon size={18} className={link.color} />
                </div>
                <div className="flex-1">
                  <p className="font-sans font-medium text-ink">{link.label}</p>
                  <p className="text-xs font-sans text-ink-300">{link.desc}</p>
                </div>
                <ChevronRight size={16} className="text-ink-200" />
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
