'use client'
import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { logWater } from '@/lib/db/health'
import { toDateString } from '@/lib/utils/date'
import { Droplets, Plus, Minus } from 'lucide-react'

export function WaterTracker() {
  const today = toDateString()
  const waterLog = useLiveQuery(() => db.waterLogs.where('date').equals(today).first(), [today])

  const glasses = waterLog?.glasses ?? 0
  const goal = waterLog?.goalGlasses ?? 8
  const progress = Math.min(glasses / goal, 1)

  const add = () => logWater(today, Math.min(glasses + 1, goal + 4))
  const remove = () => { if (glasses > 0) logWater(today, glasses - 1) }

  return (
    <div className="bg-blue-50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-blue-500" />
          <span className="font-sans font-semibold text-blue-700">Water Intake</span>
        </div>
        <span className="text-sm font-sans text-blue-600">{glasses}/{goal} glasses</span>
      </div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {Array.from({ length: goal }).map((_, i) => (
          <div
            key={i}
            className={`w-7 h-8 rounded-lg transition-colors ${i < glasses ? 'bg-blue-400' : 'bg-blue-100 border border-blue-200'}`}
          />
        ))}
      </div>
      <div className="w-full h-2 bg-blue-100 rounded-full mb-3">
        <div
          className="h-2 bg-blue-400 rounded-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex gap-3">
        <button onClick={remove} disabled={glasses === 0}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-100 text-blue-600 disabled:opacity-40">
          <Minus size={14} /> Remove
        </button>
        <button onClick={add} disabled={glasses >= goal + 4}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-500 text-white disabled:opacity-40">
          <Plus size={14} /> Add Glass
        </button>
      </div>
    </div>
  )
}
