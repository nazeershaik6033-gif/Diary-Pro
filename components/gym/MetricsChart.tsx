'use client'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { BodyMetric } from '@/types'
import { formatShort } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'

interface MetricsChartProps {
  metrics: BodyMetric[]
}

type ChartKey = 'bodyWeight' | 'bodyFatPercent' | 'waistCm'

const TABS: { key: ChartKey; label: string; unit: string; color: string }[] = [
  { key: 'bodyWeight', label: 'Weight', unit: 'kg', color: '#C4933F' },
  { key: 'bodyFatPercent', label: 'Body Fat', unit: '%', color: '#c4857a' },
  { key: 'waistCm', label: 'Waist', unit: 'cm', color: '#7a9e7e' },
]

export function MetricsChart({ metrics }: MetricsChartProps) {
  const [activeTab, setActiveTab] = useState<ChartKey>('bodyWeight')
  const tab = TABS.find(t => t.key === activeTab)!

  const data = metrics
    .filter(m => m[activeTab] != null)
    .map(m => ({ date: formatShort(m.date), value: m[activeTab] }))
    .slice(-20)

  if (data.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center">
        <p className="text-sm font-sans text-ink-300">Log at least 2 entries to see a chart.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              'flex-1 py-1.5 text-xs font-sans font-medium rounded-xl transition-colors',
              activeTab === t.key ? 'bg-ink text-white' : 'bg-paper-300 text-ink-400'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ede3d0" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9a7060' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9a7060' }} />
          <Tooltip
            formatter={(v: number) => [`${v} ${tab.unit}`, tab.label]}
            contentStyle={{ borderRadius: '12px', border: '1px solid #ede3d0', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="value" stroke={tab.color} strokeWidth={2} dot={{ r: 3, fill: tab.color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
