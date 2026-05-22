'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { ChevronRight, Lock, Bell, Download, Info, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { formatDisplay, toDateString } from '@/lib/utils/date'
import { motion } from 'framer-motion'

const SETTINGS_LINKS = [
  { href: '/settings/security', label: 'Security & PIN', icon: Lock, desc: 'Set up PIN lock' },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell, desc: 'Reminders and prompts' },
  { href: '/settings/backup', label: 'Backup & Export', icon: Download, desc: 'JSON and PDF export' },
]

export default function SettingsPage() {
  const { lock, pinEnabled } = useAuth()
  const settings = useLiveQuery(() => db.settings.get('singleton'))

  const lastBackup = settings?.lastBackupAt
    ? formatDisplay(toDateString(new Date(settings.lastBackupAt)))
    : 'Never'

  return (
    <div className="px-4 pb-4">
      <div className="pt-2 pb-4">
        <h2 className="text-2xl font-serif font-bold text-ink">Settings</h2>
      </div>

      <div className="space-y-2 mb-6">
        {SETTINGS_LINKS.map((link, i) => (
          <motion.div key={link.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={link.href}>
              <Card className="p-4 flex items-center gap-3 hover:shadow-warm-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-paper-300 flex items-center justify-center flex-shrink-0">
                  <link.icon size={18} className="text-ink-400" />
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

      {pinEnabled && (
        <button
          onClick={lock}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-paper-300 hover:bg-paper-400 transition-colors"
        >
          <LogOut size={18} className="text-ink-400" />
          <span className="font-sans font-medium text-ink">Lock App</span>
        </button>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs font-sans text-ink-200">Diary Pro · v0.1.0</p>
        <p className="text-xs font-sans text-ink-200 mt-1">All data stored locally on your device</p>
        <p className="text-xs font-sans text-ink-200 mt-0.5">Last backup: {lastBackup}</p>
      </div>
    </div>
  )
}
