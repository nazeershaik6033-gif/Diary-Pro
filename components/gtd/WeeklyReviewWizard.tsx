'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/db'
import { saveWeeklyReview } from '@/lib/db/gtd'
import { getWeekStart } from '@/lib/utils/date'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { CheckCircle, Circle, ChevronRight } from 'lucide-react'
import { useToast } from '@/app/contexts/ToastContext'
import type { GTDWeeklyReview } from '@/types'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    key: 'collect' as const,
    title: 'Collect',
    subtitle: 'Clear your head',
    description: 'Capture everything that has your attention. Any loose papers, notes, voicemails, tasks rattling around in your head.',
    emoji: '📥',
  },
  {
    key: 'process' as const,
    title: 'Process',
    subtitle: 'Empty the inbox',
    description: 'Go through every item in your inbox. Decide what each one means and what (if anything) to do about it.',
    emoji: '⚙️',
  },
  {
    key: 'organize' as const,
    title: 'Organize',
    subtitle: 'Review your lists',
    description: "Review your Projects, Next Actions, Waiting For, and Someday/Maybe lists. Update anything that's changed.",
    emoji: '📋',
  },
  {
    key: 'reflect' as const,
    title: 'Reflect',
    subtitle: 'Get the big picture',
    description: 'Review your goals and long-term horizons. What matters most? What are you moving toward?',
    emoji: '🔭',
  },
  {
    key: 'engage' as const,
    title: 'Engage',
    subtitle: 'Set your priorities',
    description: "You're ready. Choose your top 3 priorities for the coming week.",
    emoji: '🎯',
  },
]

export function WeeklyReviewWizard() {
  const router = useRouter()
  const { showToast } = useToast()
  const [step, setStep] = useState(0)
  const [steps, setSteps] = useState({ collect: false, process: false, organize: false, reflect: false, engage: false })
  const [reflection, setReflection] = useState('')
  const [priorities, setPriorities] = useState<[string, string, string]>(['', '', ''])
  const [saving, setSaving] = useState(false)

  const inboxCount = useLiveQuery(() => db.gtdInbox.where('processed').equals(0).count(), [])
  const actionsCount = useLiveQuery(() => db.gtdNextActions.where('completed').equals(0).count(), [])

  const current = STEPS[step]

  const markStep = (done: boolean) => {
    setSteps(s => ({ ...s, [current.key]: done }))
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      await saveWeeklyReview({
        weekStartDate: getWeekStart(),
        steps,
        reflectionNotes: reflection,
        topPriorities: priorities,
        completedAt: Date.now(),
        createdAt: Date.now(),
      })
      showToast('Weekly review complete! 🎉')
      router.push('/gtd')
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4">
      <div className="flex gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s.key} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-amber-warm' : 'bg-paper-400'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="text-center py-4">
            <span className="text-5xl mb-3 block">{current.emoji}</span>
            <p className="text-sm font-sans text-ink-300 uppercase tracking-wide">{current.subtitle}</p>
            <h2 className="text-2xl font-serif font-bold text-ink">{current.title}</h2>
          </div>

          <div className="bg-amber-faint rounded-2xl p-4">
            <p className="font-sans text-ink-400 text-sm leading-relaxed">{current.description}</p>

            {current.key === 'collect' && (
              <p className="text-sm font-sans text-amber-dark mt-2 font-medium">
                Inbox: {inboxCount ?? 0} unprocessed items
              </p>
            )}
            {current.key === 'organize' && (
              <p className="text-sm font-sans text-amber-dark mt-2 font-medium">
                {actionsCount ?? 0} open next actions
              </p>
            )}
          </div>

          {current.key === 'reflect' && (
            <Textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="What worked well this week? What do you want to change? What are you proud of?"
              rows={5}
            />
          )}

          {current.key === 'engage' && (
            <div className="space-y-3">
              {priorities.map((p, i) => (
                <input
                  key={i}
                  type="text"
                  value={p}
                  onChange={e => {
                    const next = [...priorities] as [string, string, string]
                    next[i] = e.target.value
                    setPriorities(next)
                  }}
                  placeholder={`Priority ${i + 1}…`}
                  className="w-full rounded-xl border border-paper-400 bg-white px-4 py-3 text-[16px] font-sans text-ink placeholder:text-ink-200 focus:outline-none focus:ring-2 focus:ring-amber-warm"
                />
              ))}
            </div>
          )}

          <button
            onClick={() => markStep(!steps[current.key as keyof typeof steps])}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-paper-400 hover:border-sage transition-colors"
          >
            {steps[current.key as keyof typeof steps]
              ? <CheckCircle size={20} className="text-sage flex-shrink-0" />
              : <Circle size={20} className="text-ink-200 flex-shrink-0" />
            }
            <span className="font-sans text-ink">Mark "{current.title}" as done</span>
          </button>

          <div className="flex gap-3 pt-2">
            {step > 0 && <Button variant="secondary" fullWidth onClick={() => setStep(s => s - 1)}>Back</Button>}
            {step < STEPS.length - 1 ? (
              <Button fullWidth onClick={() => setStep(s => s + 1)}>
                Next <ChevronRight size={16} />
              </Button>
            ) : (
              <Button fullWidth onClick={handleFinish} disabled={saving}>
                {saving ? 'Saving…' : 'Complete Review 🎉'}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
