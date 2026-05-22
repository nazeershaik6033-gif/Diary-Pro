'use client'
import { use, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Decision, ProsConsData, JournalData, MatrixData, ProConItem, MatrixCriterion } from '@/types/decisions'

// ── Pros & Cons ───────────────────────────────────────────────────
function ProsConsView({ decision }: { decision: Decision }) {
  const data = decision.data as ProsConsData
  const opt = data.options[0] ?? { name: '', pros: [], cons: [] }
  const [newPro, setNewPro] = useState('')
  const [newCon, setNewCon] = useState('')

  const totalPros = opt.pros.reduce((s, p) => s + p.weight, 0)
  const totalCons = opt.cons.reduce((s, c) => s + c.weight, 0)
  const score = totalPros - totalCons
  const rec = score > 2 ? 'Lean YES' : score < -2 ? 'Lean NO' : 'Neutral'

  const addItem = async (side: 'pros' | 'cons', text: string) => {
    const item: ProConItem = { id: crypto.randomUUID(), text, weight: 2 }
    const updated = { ...opt, [side]: [...opt[side], item] }
    await db.decisions.update(decision.id!, { data: { options: [updated] }, updatedAt: Date.now() })
  }

  const removeItem = async (side: 'pros' | 'cons', id: string) => {
    const updated = { ...opt, [side]: opt[side].filter(i => i.id !== id) }
    await db.decisions.update(decision.id!, { data: { options: [updated] }, updatedAt: Date.now() })
  }

  const updateWeight = async (side: 'pros' | 'cons', id: string, weight: 1 | 2 | 3) => {
    const updated = { ...opt, [side]: opt[side].map(i => i.id === id ? { ...i, weight } : i) }
    await db.decisions.update(decision.id!, { data: { options: [updated] }, updatedAt: Date.now() })
  }

  const submit = (side: 'pros' | 'cons') => {
    const val = side === 'pros' ? newPro : newCon
    if (!val.trim()) return
    addItem(side, val.trim())
    side === 'pros' ? setNewPro('') : setNewCon('')
  }

  return (
    <div className="space-y-4">
      <div className={cn('rounded-2xl p-4 text-center', score > 0 ? 'bg-green-50' : score < 0 ? 'bg-red-50' : 'bg-paper-300')}>
        <p className="text-xs font-sans text-ink-300 uppercase tracking-wider">Weighted score</p>
        <p className={cn('text-2xl font-serif font-bold mt-1', score > 0 ? 'text-green-700' : score < 0 ? 'text-red-600' : 'text-ink')}>
          {score > 0 ? '+' : ''}{score}
        </p>
        <p className="text-sm font-sans text-ink-300">{rec}</p>
      </div>

      {(['pros', 'cons'] as const).map(side => (
        <div key={side} className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-3">
          <p className={cn('text-xs font-sans font-semibold uppercase tracking-wider', side === 'pros' ? 'text-green-600' : 'text-red-500')}>
            {side === 'pros' ? `✓ Pros (${totalPros} pts)` : `✕ Cons (${totalCons} pts)`}
          </p>
          {opt[side].map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {([1, 2, 3] as const).map(w => (
                  <button key={w} onClick={() => updateWeight(side, item.id, w)}
                    className={cn('w-3.5 h-3.5 rounded-sm transition-colors',
                      item.weight >= w ? (side === 'pros' ? 'bg-green-400' : 'bg-red-400') : 'bg-paper-300'
                    )} />
                ))}
              </div>
              <p className="flex-1 text-sm font-sans text-ink">{item.text}</p>
              <button onClick={() => removeItem(side, item.id)}><Trash2 size={13} className="text-ink-300" /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={side === 'pros' ? newPro : newCon}
              onChange={e => side === 'pros' ? setNewPro(e.target.value) : setNewCon(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(side) } }}
              placeholder={`Add ${side === 'pros' ? 'pro' : 'con'}…`}
              className="flex-1 rounded-xl border border-paper-400 px-3 py-2 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm"
            />
            <button type="button" onClick={() => submit(side)} className="px-3 py-2 rounded-xl bg-paper-300">
              <Plus size={16} className="text-ink" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Decision Journal ──────────────────────────────────────────────
function JournalView({ decision }: { decision: Decision }) {
  const data = decision.data as JournalData
  const [form, setForm] = useState(data)

  const save = () => db.decisions.update(decision.id!, { data: form, updatedAt: Date.now() })

  const fields: { key: keyof JournalData; label: string; placeholder: string }[] = [
    { key: 'situation',       label: 'Situation / Context',  placeholder: 'Describe the decision context…' },
    { key: 'reasoning',       label: 'Your Reasoning',       placeholder: 'Why are you leaning this way…' },
    { key: 'expectedOutcome', label: 'Expected Outcome',     placeholder: 'What do you expect to happen…' },
  ]

  return (
    <div className="space-y-4">
      {fields.map(f => (
        <div key={f.key} className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-2">
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">{f.label}</p>
          <textarea
            value={(form[f.key] as string) ?? ''}
            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
            onBlur={save}
            placeholder={f.placeholder}
            rows={3}
            className="w-full rounded-xl border border-paper-400 px-3 py-2 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm resize-none"
          />
        </div>
      ))}

      {decision.status === 'reviewing' && (
        <>
          {[
            { key: 'actualOutcome' as const,   label: 'Actual Outcome',   placeholder: 'What actually happened…' },
            { key: 'lessonsLearned' as const,   label: 'Lessons Learned',  placeholder: 'What would you do differently…' },
          ].map(f => (
            <div key={f.key} className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-2">
              <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">{f.label}</p>
              <textarea
                value={(form[f.key] as string) ?? ''}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                onBlur={save}
                placeholder={f.placeholder}
                rows={3}
                className="w-full rounded-xl border border-paper-400 px-3 py-2 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm resize-none"
              />
            </div>
          ))}
        </>
      )}

      <Button onClick={save} fullWidth>Save Notes</Button>
    </div>
  )
}

// ── Criteria Matrix ───────────────────────────────────────────────
function MatrixView({ decision }: { decision: Decision }) {
  const data = decision.data as MatrixData
  const [newOption, setNewOption] = useState('')
  const [newCriterion, setNewCriterion] = useState('')

  const addOption = async () => {
    if (!newOption.trim()) return
    await db.decisions.update(decision.id!, { data: { ...data, options: [...data.options, newOption.trim()] }, updatedAt: Date.now() })
    setNewOption('')
  }

  const addCriterion = async () => {
    if (!newCriterion.trim()) return
    const c: MatrixCriterion = { id: crypto.randomUUID(), name: newCriterion.trim(), weight: 2 }
    await db.decisions.update(decision.id!, { data: { ...data, criteria: [...data.criteria, c] }, updatedAt: Date.now() })
    setNewCriterion('')
  }

  const setScore = async (option: string, criterionId: string, score: number) => {
    const scores = { ...data.scores, [option]: { ...(data.scores[option] ?? {}), [criterionId]: score } }
    await db.decisions.update(decision.id!, { data: { ...data, scores }, updatedAt: Date.now() })
  }

  const setCriterionWeight = async (id: string, weight: 1 | 2 | 3) => {
    const criteria = data.criteria.map(c => c.id === id ? { ...c, weight } : c)
    await db.decisions.update(decision.id!, { data: { ...data, criteria }, updatedAt: Date.now() })
  }

  const totals = data.options.map(opt => ({
    opt,
    score: data.criteria.reduce((s, c) => s + (data.scores[opt]?.[c.id] ?? 0) * c.weight, 0),
  })).sort((a, b) => b.score - a.score)

  const maxScore = totals[0]?.score ?? 0

  return (
    <div className="space-y-4">
      {totals.length > 0 && maxScore > 0 && (
        <div className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-3">
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Ranking</p>
          {totals.map(({ opt, score }, i) => (
            <div key={opt} className="flex items-center gap-3">
              <span className="text-xs font-sans text-ink-300 w-4 text-center">{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-sans text-ink">{opt}</span>
                  <span className="text-sm font-sans font-medium text-ink-300">{score}</span>
                </div>
                <div className="h-2 bg-paper-300 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-warm rounded-full transition-all duration-300"
                    style={{ width: `${(score / maxScore) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-2">
        <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Options to compare</p>
        {data.options.map(opt => <p key={opt} className="text-sm font-sans text-ink py-0.5">• {opt}</p>)}
        <div className="flex gap-2 mt-1">
          <input value={newOption} onChange={e => setNewOption(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption())}
            placeholder="Add option…"
            className="flex-1 rounded-xl border border-paper-400 px-3 py-2 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm" />
          <button onClick={addOption} className="px-3 py-2 rounded-xl bg-paper-300"><Plus size={16} className="text-ink" /></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-paper-300 shadow-warm-sm p-4 space-y-3">
        <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Criteria & Scores</p>
        {data.criteria.map(c => (
          <div key={c.id} className="space-y-2 pb-3 border-b border-paper-300 last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
              <p className="flex-1 text-sm font-sans font-medium text-ink">{c.name}</p>
              <span className="text-xs font-sans text-ink-300">Weight:</span>
              <div className="flex gap-0.5">
                {([1, 2, 3] as const).map(w => (
                  <button key={w} onClick={() => setCriterionWeight(c.id, w)}
                    className={cn('w-4 h-4 rounded transition-colors', c.weight >= w ? 'bg-amber-warm' : 'bg-paper-300')} />
                ))}
              </div>
            </div>
            {data.options.map(opt => (
              <div key={opt} className="flex items-center gap-2 pl-2">
                <span className="text-xs font-sans text-ink-300 w-16 truncate">{opt}:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setScore(opt, c.id, s)}
                      className={cn('w-6 h-6 rounded-lg text-xs font-sans font-semibold transition-colors',
                        (data.scores[opt]?.[c.id] ?? 0) >= s ? 'bg-amber-warm text-white' : 'bg-paper-300 text-ink-300'
                      )}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="flex gap-2">
          <input value={newCriterion} onChange={e => setNewCriterion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCriterion())}
            placeholder="Add criterion…"
            className="flex-1 rounded-xl border border-paper-400 px-3 py-2 text-[16px] font-sans text-ink bg-paper-50 focus:outline-none focus:ring-2 focus:ring-amber-warm" />
          <button onClick={addCriterion} className="px-3 py-2 rounded-xl bg-paper-300"><Plus size={16} className="text-ink" /></button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
const STATUS_OPTIONS = ['exploring', 'decided', 'reviewing', 'archived'] as const

export default function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const decision = useLiveQuery(() => db.decisions.get(Number(id)), [id])

  if (!decision) return null

  const updateStatus = (status: string) =>
    db.decisions.update(decision.id!, { status: status as Decision['status'], updatedAt: Date.now() })

  const handleDelete = async () => {
    if (confirm('Delete this decision?')) {
      await db.decisions.delete(decision.id!)
      router.back()
    }
  }

  return (
    <div>
      <PageHeader title={decision.title} showBack />
      <div className="px-4 space-y-4 pb-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => updateStatus(s)}
              className={cn('px-3 py-1.5 rounded-full text-sm font-sans flex-shrink-0 capitalize transition-colors',
                decision.status === s ? 'bg-amber-warm text-white' : 'bg-paper-300 text-ink-300'
              )}>{s}</button>
          ))}
        </div>

        {decision.type === 'proscons' && <ProsConsView decision={decision} />}
        {decision.type === 'journal'  && <JournalView  decision={decision} />}
        {decision.type === 'matrix'   && <MatrixView   decision={decision} />}

        {decision.status === 'decided' && !decision.chosenOption && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-sm font-sans font-semibold text-green-700 mb-2">Record your choice</p>
            <div className="flex gap-2">
              <input
                placeholder="What did you decide?"
                onBlur={e => { if (e.target.value) db.decisions.update(decision.id!, { chosenOption: e.target.value, updatedAt: Date.now() }) }}
                className="flex-1 rounded-xl border border-green-200 px-3 py-2 text-[16px] font-sans text-ink bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <CheckCircle size={20} className="text-green-400 my-auto flex-shrink-0" />
            </div>
          </div>
        )}

        {decision.chosenOption && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
            <p className="text-sm font-sans text-green-700">
              <span className="font-semibold">Decision: </span>{decision.chosenOption}
            </p>
          </div>
        )}

        <button onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-red-500 border border-red-200 font-sans text-sm font-medium">
          <Trash2 size={16} /> Delete Decision
        </button>
      </div>
    </div>
  )
}
