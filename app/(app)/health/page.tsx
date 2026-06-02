'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { WaterTracker } from '@/components/health/WaterTracker'
import { EnergyMoodLog } from '@/components/health/EnergyMoodLog'
import { SupplementChecklist } from '@/components/health/SupplementChecklist'
import { SleepLogForm } from '@/components/health/SleepLogForm'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ENERGY_CONFIG, type EnergyLevel } from '@/types'
import { formatDisplay, toDateString, formatShort } from '@/lib/utils/date'
import { Moon, Plus, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HealthPage() {
  const [sleepOpen, setSleepOpen] = useState(false)
  const today = toDateString()

  const todaySleep = useLiveQuery(() => db.sleepLogs.where('date').equals(today).first(), [today])
  const recentEnergy = useLiveQuery(
    () => db.healthLogs.orderBy('createdAt').reverse().limit(7).toArray(),
    []
  )

  return (
    <div className="px-4 pb-4">
      <div className="pt-2 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink">Health & Wellness</h2>
          <p className="text-sm font-sans text-ink-300">{formatDisplay(today)}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setSleepOpen(true)}>
          <Moon size={14} /> Sleep
        </Button>
      </div>

      <div className="space-y-4">
        {todaySleep ? (
          <Card className="p-4 bg-purple-50 border-purple-100">
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-purple-500" />
              <div>
                <p className="font-sans font-semibold text-purple-700">Last Night</p>
                <p className="text-sm font-sans text-purple-600">
                  {todaySleep.durationHours}h · {todaySleep.bedTime}–{todaySleep.wakeTime}
                  {' '}· {'😴😕😐🙂😄'[todaySleep.quality - 1]}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <button onClick={() => setSleepOpen(true)}
            className="w-full flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-4 text-left">
            <Moon size={20} className="text-purple-400" />
            <div>
              <p className="font-sans font-semibold text-purple-700">Log last night's sleep</p>
              <p className="text-xs font-sans text-purple-400 mt-0.5">Track your sleep quality and duration</p>
            </div>
            <Plus size={16} className="text-purple-400 ml-auto" />
          </button>
        )}

        <WaterTracker />
        <EnergyMoodLog />
        <SupplementChecklist />

        {recentEnergy && recentEnergy.length > 0 && (
          <div>
            <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wide mb-2">Recent Energy</p>
            <div className="space-y-2">
              {recentEnergy.map((log, i) => {
                const cfg = log.energyLevel ? ENERGY_CONFIG[log.energyLevel as EnergyLevel] : null
                return (
                  <motion.div key={log.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="p-3 flex items-center gap-3">
                      <span className="text-lg">{cfg?.emoji ?? '😐'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-sans text-ink capitalize">{cfg?.label ?? 'Unknown'}</p>
                        {log.notes && <p className="text-xs font-sans text-ink-300 truncate">{log.notes}</p>}
                      </div>
                      <p className="text-xs font-sans text-ink-200">{log.time}</p>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Sheet open={sleepOpen} onClose={() => setSleepOpen(false)} title="Log Sleep">
        <SleepLogForm onDone={() => setSleepOpen(false)} />
      </Sheet>
    </div>
  )
}
