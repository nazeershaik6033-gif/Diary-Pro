'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { InboxItem } from '@/components/gtd/InboxItem'
import { ProcessCard } from '@/components/gtd/ProcessCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Sheet } from '@/components/ui/Sheet'
import type { GTDInboxItem } from '@/types'
import { Inbox } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

export default function InboxPage() {
  const [processing, setProcessing] = useState<GTDInboxItem | null>(null)

  const items = useLiveQuery(
    () => db.gtdInbox.where('processed').equals(0).reverse().sortBy('createdAt'),
    []
  )

  return (
    <div>
      <PageHeader title={`Inbox (${items?.length ?? 0})`} />
      <div className="px-4 space-y-3">
        {items === undefined ? (
          <div className="h-24 rounded-2xl bg-paper-300 animate-pulse" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Inbox is clear"
            description="Use the + button to capture anything on your mind."
          />
        ) : (
          <AnimatePresence>
            {items.map(item => (
              <InboxItem key={item.id} item={item} onProcess={setProcessing} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <Sheet open={!!processing} onClose={() => setProcessing(null)} title="Process Item">
        {processing && <ProcessCard item={processing} onDone={() => setProcessing(null)} />}
      </Sheet>
    </div>
  )
}
