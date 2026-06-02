'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const settings = useLiveQuery(() => db.settings.get('singleton'))
  const isDark = settings?.theme === 'dark' || settings?.theme === 'midnight'

  const toggle = async () => {
    await db.settings.update('singleton', { theme: isDark ? 'warm' : 'dark' })
  }

  return (
    <button
      onClick={toggle}
      className={cn('w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 transition-colors', className)}
      aria-label="Toggle dark mode"
    >
      {isDark
        ? <Sun size={18} className="text-amber-400" />
        : <Moon size={18} className="text-ink-300" />}
    </button>
  )
}
