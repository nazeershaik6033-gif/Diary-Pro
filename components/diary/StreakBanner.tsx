import { Flame } from 'lucide-react'
import { useStreak } from '@/lib/hooks/useStreak'

export function StreakBanner() {
  const streak = useStreak()
  if (streak === 0) return null

  return (
    <div className="flex items-center gap-3 neu-card rounded-2xl px-4 py-3 mb-3">
      <div className="neu-icon-pit w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
        <Flame size={18} className="text-[#6b82c8]" />
      </div>
      <span className="text-sm font-sans font-medium text-slate-200">
        {streak} day{streak !== 1 ? 's' : ''} in a row — keep it going!
      </span>
    </div>
  )
}
