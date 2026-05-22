'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, CheckSquare, Clock, Star, Trash2 } from 'lucide-react'
import type { GTDInboxItem, GTDContext } from '@/types'
import { GTD_CONTEXTS } from '@/types'
import { processInboxItem, deleteInboxItem, addNextAction, addProject, addWaitingFor, addSomedayMaybe } from '@/lib/db/gtd'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ProcessCardProps {
  item: GTDInboxItem
  onDone: () => void
}

type ProcessTarget = 'next-action' | 'project' | 'waiting-for' | 'someday-maybe' | null

export function ProcessCard({ item, onDone }: ProcessCardProps) {
  const [target, setTarget] = useState<ProcessTarget>(null)
  const [detail, setDetail] = useState('')
  const [context, setContext] = useState<GTDContext>('@anywhere')
  const [delegatedTo, setDelegatedTo] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!item.id) return
    setSaving(true)
    const now = Date.now()
    try {
      if (target === 'next-action') {
        await addNextAction({
          title: detail || item.content,
          context,
          completed: false,
          energy: 'medium',
          createdAt: now,
          updatedAt: now,
        })
      } else if (target === 'project') {
        await addProject({
          title: detail || item.content,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        })
      } else if (target === 'waiting-for') {
        await addWaitingFor({
          title: detail || item.content,
          delegatedTo,
          completed: false,
          createdAt: now,
        })
      } else if (target === 'someday-maybe') {
        await addSomedayMaybe({
          title: detail || item.content,
          createdAt: now,
        })
      }
      await processInboxItem(item.id)
      onDone()
    } finally {
      setSaving(false)
    }
  }

  const handleTrash = async () => {
    if (!item.id) return
    await deleteInboxItem(item.id)
    onDone()
  }

  const ACTIONS = [
    { id: 'next-action' as const, label: 'Next Action', icon: CheckSquare, color: 'text-sage' },
    { id: 'project' as const, label: 'Project', icon: FolderOpen, color: 'text-blue-500' },
    { id: 'waiting-for' as const, label: 'Waiting For', icon: Clock, color: 'text-purple-500' },
    { id: 'someday-maybe' as const, label: 'Someday Maybe', icon: Star, color: 'text-amber-warm' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-warm-md border border-paper-300 p-5"
    >
      <div className="bg-amber-faint rounded-xl p-3 mb-4">
        <p className="font-sans text-ink leading-relaxed">{item.content}</p>
      </div>

      {!target ? (
        <div className="space-y-2">
          <p className="text-sm font-sans text-ink-400 font-medium mb-3">What is this?</p>
          {ACTIONS.map(action => (
            <button
              key={action.id}
              onClick={() => setTarget(action.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-paper-400 hover:border-amber-warm hover:bg-amber-faint/50 transition-all text-left"
            >
              <action.icon size={18} className={action.color} />
              <span className="font-sans font-medium text-ink">{action.label}</span>
            </button>
          ))}
          <button
            onClick={handleTrash}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-paper-400 hover:border-red-300 hover:bg-red-50 transition-all text-left"
          >
            <Trash2 size={18} className="text-red-400" />
            <span className="font-sans font-medium text-ink">Trash</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-sans text-ink-400">
            Adding as <span className="font-semibold text-amber-dark">{ACTIONS.find(a => a.id === target)?.label}</span>
          </p>
          <Input
            value={detail}
            onChange={e => setDetail(e.target.value)}
            placeholder={item.content}
          />
          {target === 'next-action' && (
            <select
              value={context}
              onChange={e => setContext(e.target.value as GTDContext)}
              className="w-full rounded-xl border border-paper-400 px-4 py-3 text-[16px] font-sans text-ink bg-white focus:outline-none focus:ring-2 focus:ring-amber-warm"
            >
              {GTD_CONTEXTS.map(ctx => <option key={ctx} value={ctx}>{ctx}</option>)}
            </select>
          )}
          {target === 'waiting-for' && (
            <Input
              value={delegatedTo}
              onChange={e => setDelegatedTo(e.target.value)}
              placeholder="Delegated to…"
            />
          )}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setTarget(null)}>Back</Button>
            <Button fullWidth onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
