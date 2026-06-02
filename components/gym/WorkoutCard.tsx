'use client'
import { type WorkoutLog } from '@/types'
import { Card } from '@/components/ui/Card'
import { formatDisplay } from '@/lib/utils/date'
import { Dumbbell, Clock } from 'lucide-react'

interface WorkoutCardProps {
  log: WorkoutLog
  setCount?: number
}

export function WorkoutCard({ log, setCount }: WorkoutCardProps) {
  const duration = log.completedAt
    ? Math.round((log.completedAt - log.startedAt) / 60000)
    : null

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans font-semibold text-ink">{log.templateName}</p>
          <p className="text-xs font-sans text-ink-300 mt-0.5">{formatDisplay(log.date)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {duration && (
            <div className="flex items-center gap-1 text-ink-300">
              <Clock size={11} />
              <span className="text-xs font-sans">{duration}m</span>
            </div>
          )}
          {setCount !== undefined && (
            <div className="flex items-center gap-1 text-ink-300">
              <Dumbbell size={11} />
              <span className="text-xs font-sans">{setCount} sets</span>
            </div>
          )}
        </div>
      </div>
      {log.totalVolume && (
        <p className="text-xs font-sans text-amber-dark mt-2">
          Total volume: {(log.totalVolume / 1000).toFixed(1)}t
        </p>
      )}
    </Card>
  )
}
