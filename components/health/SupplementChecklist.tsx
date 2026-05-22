'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { logSupplementTaken, addSupplement } from '@/lib/db/health'
import { toDateString } from '@/lib/utils/date'
import { CheckCircle, Circle, Plus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'

export function SupplementChecklist() {
  const today = toDateString()
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')

  const supplements = useLiveQuery(() => db.supplements.where('active').equals(1).toArray(), [])
  const logs = useLiveQuery(() => db.supplementLogs.where('date').equals(today).toArray(), [today])

  const isTaken = (suppId: number) => logs?.some(l => l.supplementId === suppId && l.taken) ?? false

  const handleAdd = async () => {
    if (!name.trim()) return
    await addSupplement({ name: name.trim(), dosage: dosage || undefined, timing: 'morning', active: true, createdAt: Date.now() })
    setName(''); setDosage(''); setAddOpen(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans font-semibold text-ink">Supplements</span>
        <button onClick={() => setAddOpen(true)} className="w-7 h-7 rounded-lg bg-paper-300 flex items-center justify-center">
          <Plus size={14} className="text-ink-400" />
        </button>
      </div>

      {!supplements?.length ? (
        <p className="text-sm font-sans text-ink-200 text-center py-2">No supplements added</p>
      ) : (
        <div className="space-y-2">
          {supplements.map(supp => (
            <button
              key={supp.id}
              onClick={() => supp.id && logSupplementTaken(today, supp.id, !isTaken(supp.id))}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-paper-50 transition-colors"
            >
              {isTaken(supp.id!)
                ? <CheckCircle size={18} className="text-sage flex-shrink-0" />
                : <Circle size={18} className="text-ink-200 flex-shrink-0" />
              }
              <div className="flex-1 text-left">
                <p className="text-sm font-sans text-ink">{supp.name}</p>
                {supp.dosage && <p className="text-xs font-sans text-ink-300">{supp.dosage}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add Supplement">
        <div className="space-y-3">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Supplement name" />
          <Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosage (optional)" />
          <Button fullWidth onClick={handleAdd} disabled={!name.trim()}>Add</Button>
        </div>
      </Sheet>
    </div>
  )
}
