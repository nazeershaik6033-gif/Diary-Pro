'use client'
import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'

interface WorkoutTimerProps {
  startedAt: number
}

export function WorkoutTimer({ startedAt }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60

  const display = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  return (
    <div className="flex items-center gap-1.5 text-amber-warm">
      <Timer size={14} />
      <span className="font-sans font-semibold text-sm tabular-nums">{display}</span>
    </div>
  )
}
