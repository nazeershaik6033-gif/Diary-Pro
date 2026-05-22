'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { MetricsChart } from '@/components/gym/MetricsChart'
import { BodyMetricsForm } from '@/components/gym/BodyMetricsForm'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/shared/EmptyState'
import { Activity, Plus } from 'lucide-react'
import { formatShort } from '@/lib/utils/date'
import dynamic from 'next/dynamic'

const MetricsChartClient = dynamic(() => import('@/components/gym/MetricsChart').then(m => m.MetricsChart), { ssr: false })

export default function MetricsPage() {
  const [addOpen, setAddOpen] = useState(false)
  const metrics = useLiveQuery(() => db.bodyMetrics.orderBy('date').toArray(), [])

  const latest = metrics?.[metrics.length - 1]

  return (
    <div>
      <PageHeader title="Body Metrics" rightAction={
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} /> Log</Button>
      } />

      <div className="px-4 space-y-4">
        {metrics === undefined ? (
          <div className="h-40 rounded-2xl bg-paper-300 animate-pulse" />
        ) : metrics.length === 0 ? (
          <EmptyState icon={Activity} title="No metrics yet" description="Start tracking your body measurements." />
        ) : (
          <>
            {latest && (
              <Card className="p-4">
                <p className="text-xs font-sans text-ink-300 mb-3">Latest — {formatShort(latest.date)}</p>
                <div className="grid grid-cols-3 gap-3">
                  {latest.bodyWeight && (
                    <div className="text-center">
                      <p className="text-xl font-serif font-bold text-amber-warm">{latest.bodyWeight}</p>
                      <p className="text-xs font-sans text-ink-300">kg</p>
                    </div>
                  )}
                  {latest.bodyFatPercent && (
                    <div className="text-center">
                      <p className="text-xl font-serif font-bold text-blush">{latest.bodyFatPercent}%</p>
                      <p className="text-xs font-sans text-ink-300">body fat</p>
                    </div>
                  )}
                  {latest.waistCm && (
                    <div className="text-center">
                      <p className="text-xl font-serif font-bold text-sage">{latest.waistCm}</p>
                      <p className="text-xs font-sans text-ink-300">waist cm</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
            <Card className="p-4">
              <MetricsChartClient metrics={metrics} />
            </Card>
          </>
        )}
      </div>

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Log Body Metrics">
        <BodyMetricsForm onDone={() => setAddOpen(false)} />
      </Sheet>
    </div>
  )
}
