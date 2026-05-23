'use client'
import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { HabitCard } from '@/components/habits/HabitCard'
import { HabitHeatmap } from '@/components/habits/HabitHeatmap'
import { EmptyState } from '@/components/shared/EmptyState'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { addHabit, seedHabitsIfEmpty } from '@/lib/db/habits'
import type { HabitColor, HabitIcon } from '@/types'
import { HABIT_COLORS } from '@/types'
import { CheckSquare, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDisplay, toDateString } from '@/lib/utils/date'
import { motion, AnimatePresence } from 'framer-motion'

export default function HabitsPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [expandedHabit, setExpandedHabit] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState<HabitColor>('amber')
  const [targetCount, setTargetCount] = useState('1')
  const [unit, setUnit] = useState('')

  const habits = useLiveQuery(() => db.habits.filter(h => !!h.active).toArray(), [])

  useEffect(() => { seedHabitsIfEmpty() }, [])

  const today = toDateString()
  const todayLogs = useLiveQuery(
    () => db.habitLogs.where('date').equals(today).toArray(),
    [today]
  )

  const completedToday = (todayLogs ?? []).reduce((acc, log) => {
    const habit = habits?.find(h => h.id === log.habitId)
    return habit && log.count >= habit.targetCount ? acc + 1 : acc
  }, 0)

  const handleAdd = async () => {
    if (!name.trim()) return
    await addHabit({
      name: name.trim(),
      color,
      icon: 'check',
      targetCount: Number(targetCount) || 1,
      unit: unit.trim() || undefined,
      active: true,
      createdAt: Date.now(),
    })
    setName(''); setUnit(''); setTargetCount('1')
    setAddOpen(false)
  }

  return (
    <div className="px-4 pb-4">
      <div className="pt-2 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink">Habits</h2>
          <p className="text-sm font-sans text-ink-300">{formatDisplay(today)}</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} /> Add</Button>
      </div>

      {habits && habits.length > 0 && (
        <div className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="font-sans text-ink-300 text-sm">Today's progress</p>
            <p className="text-2xl font-serif font-bold text-amber-warm">
              {completedToday}/{habits.length}
            </p>
          </div>
          <div className="w-16 h-16">
            <svg viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#f5f0e8" strokeWidth="6" />
              <circle
                cx="28" cy="28" r="22" fill="none" stroke="#C4933F" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - (habits.length ? completedToday / habits.length : 0))}
                transform="rotate(-90 28 28)"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
          </div>
        </div>
      )}

      {habits === undefined ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-paper-300 animate-pulse" />)}
        </div>
      ) : habits.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No habits yet" description="Build daily habits that compound over time." action={
          <Button onClick={() => setAddOpen(true)}><Plus size={16} /> Add Habit</Button>
        } />
      ) : (
        <div className="space-y-3">
          {habits.map((habit, i) => (
            <motion.div key={habit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <HabitCard habit={habit} />
              <button
                onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : (habit.id ?? null))}
                className="flex items-center gap-1 text-xs font-sans text-ink-200 mt-1 ml-2"
              >
                {expandedHabit === habit.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expandedHabit === habit.id ? 'Hide history' : 'View history'}
              </button>
              <AnimatePresence>
                {expandedHabit === habit.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Card className="p-4 mt-1">
                      <p className="text-xs font-sans text-ink-300 mb-3">Last 13 weeks</p>
                      <HabitHeatmap habit={habit} />
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="New Habit">
        <div className="space-y-4">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Habit name" />
          <div>
            <p className="text-sm font-medium font-sans text-ink-400 mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(HABIT_COLORS) as [HabitColor, typeof HABIT_COLORS[HabitColor]][]).map(([c, cfg]) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: cfg.ring + '40',
                    borderColor: color === c ? cfg.ring : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              value={targetCount}
              onChange={e => setTargetCount(e.target.value)}
              type="number"
              label="Daily target"
              placeholder="1"
              inputMode="numeric"
            />
            <Input
              value={unit}
              onChange={e => setUnit(e.target.value)}
              label="Unit (optional)"
              placeholder="glasses, pages…"
            />
          </div>
          <Button fullWidth onClick={handleAdd} disabled={!name.trim()}>Add Habit</Button>
        </div>
      </Sheet>
    </div>
  )
}
