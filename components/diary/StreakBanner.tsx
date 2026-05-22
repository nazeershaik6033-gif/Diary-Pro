import { Flame } from 'lucide-react'
import { useStreak } from '@/lib/hooks/useStreak'

export function StreakBanner() {
  const streak = useStreak()
  if (streak === 0) return null

  return (
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 mx-4 mb-3">
      <Flame size={18} className="text-orange-400" />
      <span className="text-sm font-sans font-medium text-orange-700">
        {streak} day{streak !== 1 ? 's' : ''} in a row — keep it going!
      </span>
    </div>
  )
}
