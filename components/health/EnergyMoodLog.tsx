'use client'
import { useState } from 'react'
import { ENERGY_CONFIG, type EnergyLevel } from '@/types'
import { logHealth } from '@/lib/db/health'
import { toDateString } from '@/lib/utils/date'
import { useToast } from '@/app/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'

export function EnergyMoodLog() {
  const { showToast } = useToast()
  const [energy, setEnergy] = useState<EnergyLevel>(3)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const handleLog = async () => {
    const now = new Date()
    await logHealth({
      date: toDateString(),
      time: now.toTimeString().slice(0, 5),
      energyLevel: energy,
      notes: notes || undefined,
      createdAt: Date.now(),
    })
    showToast('Energy logged')
    setNotes('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4">
      <p className="font-sans font-semibold text-ink mb-3">Energy Level</p>
      <div className="flex gap-2 justify-between mb-4">
        {(Object.entries(ENERGY_CONFIG) as [string, typeof ENERGY_CONFIG[EnergyLevel]][]).map(([level, cfg]) => {
          const lvl = Number(level) as EnergyLevel
          return (
            <motion.button
              key={level}
              whileTap={{ scale: 0.9 }}
              onClick={() => setEnergy(lvl)}
              className={cn(
                'flex-1 py-2 rounded-xl text-center transition-all',
                energy === lvl ? 'bg-amber-faint ring-2 ring-amber-warm' : 'bg-paper-50 border border-paper-400'
              )}
            >
              <span className="text-xl block">{cfg.emoji}</span>
              <span className="text-xs font-sans text-ink-300 capitalize">{cfg.label}</span>
            </motion.button>
          )
        })}
      </div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="How do you feel? (optional)"
        rows={2}
        className="w-full rounded-xl border border-paper-400 bg-paper-50 px-3 py-2 text-[16px] font-sans text-ink placeholder:text-ink-200 focus:outline-none focus:ring-2 focus:ring-amber-warm resize-none mb-3"
      />
      <Button fullWidth onClick={handleLog}>
        {saved ? '✓ Logged!' : 'Log Energy'}
      </Button>
    </div>
  )
}
