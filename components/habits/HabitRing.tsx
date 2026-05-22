'use client'
import { HABIT_COLORS, type HabitColor } from '@/types'

interface HabitRingProps {
  color: HabitColor
  progress: number   // 0 to 1
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
}

export function HabitRing({ color, progress, size = 56, strokeWidth = 5, children }: HabitRingProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(progress, 1))
  const cfg = HABIT_COLORS[color]

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f5f0e8"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={cfg.ring}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
