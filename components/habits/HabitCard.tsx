'use client'
import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { HabitRing } from './HabitRing'
import { logHabit, computeStreak } from '@/lib/db/habits'
import type { Habit } from '@/types'
import { HABIT_COLORS } from '@/types'
import { toDateString } from '@/lib/utils/date'
import { Flame, Plus, Minus, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface HabitCardProps {
  habit: Habit
}

export function HabitCard({ habit }: HabitCardProps) {
  const [streak, setStreak] = useState(0)
  const today = toDateString()
  const cfg = HABIT_COLORS[habit.color]

  const todayLog = useLiveQuery(
    () => db.habitLogs.where({ habitId: habit.id!, date: today }).first(),
    [habit.id, today]
  )

  useEffect(() => {
    if (habit.id) computeStreak(habit.id).then(s => setStreak(s.current))
  }, [habit.id, todayLog])

  const count = todayLog?.count ?? 0
  const progress = Math.min(count / habit.targetCount, 1)
  const done = count >= habit.targetCount

  const increment = async () => {
    if (!habit.id) return
    const next = Math.min(count + 1, habit.targetCount)
    await logHabit(habit.id, next)
  }

  const decrement = async () => {
    if (!habit.id || count === 0) return
    await logHabit(habit.id, count - 1)
  }

  return (
    <motion.div
      layout
      className={cn('bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4 flex items-center gap-4', done && 'bg-opacity-80')}
    >
      <HabitRing color={habit.color} progress={progress} size={56}>
        {done
          ? <CheckCircle size={20} style={{ color: HABIT_COLORS[habit.color].ring }} />
          : <span className="text-xs font-sans font-semibold" style={{ color: HABIT_COLORS[habit.color].ring }}>
              {habit.targetCount === 1 ? '!' : `${count}/${habit.targetCount}`}
            </span>
        }
      </HabitRing>

      <div className="flex-1 min-w-0">
        <p className="font-sans font-medium text-ink truncate">{habit.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {streak > 0 && (
            <div className="flex items-center gap-0.5">
              <Flame size={11} className="text-orange-400" />
              <span className="text-xs font-sans text-ink-300">{streak}d</span>
            </div>
          )}
          {habit.unit && (
            <span className="text-xs font-sans text-ink-200">
              {count}/{habit.targetCount} {habit.unit}
            </span>
          )}
        </div>
      </div>

      {habit.targetCount === 1 ? (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={done ? decrement : increment}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
            done ? 'bg-sage text-white' : `${cfg.bg} border-2 border-dashed`,
          )}
          style={{ borderColor: done ? undefined : cfg.ring }}
        >
          {done ? <CheckCircle size={18} /> : <Plus size={16} style={{ color: cfg.ring }} />}
        </motion.button>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={decrement} disabled={count === 0}
            className="w-7 h-7 rounded-full bg-paper-300 flex items-center justify-center disabled:opacity-40">
            <Minus size={12} className="text-ink-400" />
          </button>
          <button onClick={increment} disabled={done}
            className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-40"
            style={{ backgroundColor: HABIT_COLORS[habit.color].ring + '20' }}>
            <Plus size={12} style={{ color: HABIT_COLORS[habit.color].ring }} />
          </button>
        </div>
      )}
    </motion.div>
  )
}
