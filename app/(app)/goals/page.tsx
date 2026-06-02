'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { GoalCard } from '@/components/goals/GoalCard'
import { AffirmationCard } from '@/components/goals/AffirmationCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { addGoal, addAffirmation } from '@/lib/db/goals'
import type { GoalTier } from '@/types'
import { GOAL_TIER_CONFIG } from '@/types'
import { Target, Plus, Sparkles } from 'lucide-react'
import { useToast } from '@/app/contexts/ToastContext'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

const TIERS: GoalTier[] = ['1year', '5year', 'life']

export default function GoalsPage() {
  const { showToast } = useToast()
  const [addOpen, setAddOpen] = useState(false)
  const [affirmOpen, setAffirmOpen] = useState(false)
  const [activeTier, setActiveTier] = useState<GoalTier>('1year')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tier, setTier] = useState<GoalTier>('1year')
  const [affirmation, setAffirmation] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [affirmText, setAffirmText] = useState('')

  const goals = useLiveQuery(() => db.goals.orderBy('createdAt').reverse().toArray(), [])

  const filteredGoals = (goals ?? []).filter(g => g.tier === activeTier)

  const handleAddGoal = async () => {
    if (!title.trim()) return
    const now = Date.now()
    await addGoal({ title: title.trim(), description, tier, affirmation: affirmation || undefined, photos, createdAt: now, updatedAt: now })
    setTitle(''); setDescription(''); setAffirmation(''); setPhotos([])
    setAddOpen(false)
    showToast('Goal added')
  }

  const handleAddAffirmation = async () => {
    if (!affirmText.trim()) return
    await addAffirmation(affirmText.trim())
    setAffirmText('')
    setAffirmOpen(false)
    showToast('Affirmation added')
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const data = ev.target?.result as string
      setPhotos(p => [...p, data])
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="px-4 pb-4">
      <div className="pt-2 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink">Goals & Vision</h2>
          <p className="text-sm font-sans text-ink-300">Your aspirations across time</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setAffirmOpen(true)}>
            <Sparkles size={14} />
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Goal
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <AffirmationCard />
      </div>

      <div className="flex gap-2 mb-4">
        {TIERS.map(t => {
          const cfg = GOAL_TIER_CONFIG[t]
          return (
            <button
              key={t}
              onClick={() => setActiveTier(t)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-sans font-medium transition-colors',
                activeTier === t ? 'bg-ink text-white' : `${cfg.bg} ${cfg.color}`
              )}
            >
              {t === '1year' ? '1 Year' : t === '5year' ? '5 Years' : 'Lifetime'}
            </button>
          )
        })}
      </div>

      {goals === undefined ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-40 rounded-2xl bg-paper-300 animate-pulse" />)}
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={`No ${GOAL_TIER_CONFIG[activeTier].label}s yet`}
          description="Define what you want to achieve and break it into milestones."
          action={<Button onClick={() => { setTier(activeTier); setAddOpen(true) }}><Plus size={16} /> Add Goal</Button>}
        />
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal, i) => (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GoalCard goal={goal} />
            </motion.div>
          ))}
        </div>
      )}

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="New Goal">
        <div className="space-y-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title" />
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this goal…" rows={3} />
          <div>
            <p className="text-sm font-medium font-sans text-ink-400 mb-2">Time horizon</p>
            <div className="flex gap-2">
              {TIERS.map(t => {
                const cfg = GOAL_TIER_CONFIG[t]
                return (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs font-sans font-medium border transition-colors',
                      tier === t ? 'bg-ink text-white border-ink' : `${cfg.bg} ${cfg.color} border-transparent`
                    )}
                  >
                    {t === '1year' ? '1 Year' : t === '5year' ? '5 Years' : 'Lifetime'}
                  </button>
                )
              })}
            </div>
          </div>
          <Input value={affirmation} onChange={e => setAffirmation(e.target.value)} placeholder="Affirmation (e.g. I am becoming…)" />
          <div>
            <p className="text-sm font-medium font-sans text-ink-400 mb-2">Inspiration photo (optional)</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-full py-2.5 rounded-xl border border-dashed border-paper-400 text-center text-sm font-sans text-ink-300">
                {photos.length > 0 ? `${photos.length} photo(s) added` : 'Tap to add photo'}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
          <Button fullWidth onClick={handleAddGoal} disabled={!title.trim()}>Add Goal</Button>
        </div>
      </Sheet>

      <Sheet open={affirmOpen} onClose={() => setAffirmOpen(false)} title="Add Affirmation">
        <div className="space-y-3">
          <Textarea value={affirmText} onChange={e => setAffirmText(e.target.value)} placeholder="I am confident, capable, and growing every day…" rows={3} />
          <Button fullWidth onClick={handleAddAffirmation} disabled={!affirmText.trim()}>Add Affirmation</Button>
        </div>
      </Sheet>
    </div>
  )
}
