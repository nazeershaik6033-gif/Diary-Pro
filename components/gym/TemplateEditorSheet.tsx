'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Search, Dumbbell } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { saveTemplate, updateTemplate, addExercise as createExercise } from '@/lib/db/gym'
import type { WorkoutTemplate, WorkoutTemplateExercise, WorkoutType } from '@/types'
import { WORKOUT_TYPE_CONFIG } from '@/types'
import { cn } from '@/lib/utils/cn'

const WORKOUT_TYPES: WorkoutType[] = ['push', 'pull', 'legs', 'full-body', 'upper', 'lower', 'custom']

interface ExerciseRow {
  key: string
  exerciseId: number | null
  exerciseName: string
  sets: number
  repsTarget: string
  weightTarget: string
  order: number
}

interface TemplateEditorSheetProps {
  template?: WorkoutTemplate
  onClose: () => void
  showToast: (msg: string, type: 'success' | 'error') => void
}

// ---------------------------------------------------------------------------
// Exercise picker overlay
// ---------------------------------------------------------------------------
function ExercisePicker({ onPick, onClose }: {
  onPick: (id: number | null, name: string) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [customName, setCustomName] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const allExercises = useLiveQuery(() => db.exercises.orderBy('name').toArray(), [])
  const filtered = (allExercises ?? []).filter(e =>
    !search.trim() || e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/50 flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="w-full bg-white rounded-t-3xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        <div className="w-10 h-1 bg-paper-400 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <p className="font-sans font-semibold text-ink text-sm">Add Exercise</p>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-paper-300">
              <X size={18} className="text-ink-300" />
            </button>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-paper-300 text-sm font-sans text-ink outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {!showCustom ? (
            <button onClick={() => setShowCustom(true)}
              className="flex items-center gap-2 w-full px-3 py-3 rounded-xl hover:bg-paper-200 mb-1">
              <Plus size={15} className="text-amber-warm flex-shrink-0" />
              <span className="text-sm font-sans text-amber-warm font-medium">Add custom exercise name</span>
            </button>
          ) : (
            <div className="flex gap-2 mb-3 items-center">
              <input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Exercise name…"
                className="flex-1 px-3 py-2 rounded-xl bg-paper-300 text-sm font-sans text-ink outline-none"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && customName.trim()) {
                    onPick(null, customName.trim())
                    onClose()
                  }
                }}
              />
              <button
                onClick={() => { if (customName.trim()) { onPick(null, customName.trim()); onClose() } }}
                disabled={!customName.trim()}
                className="px-3 py-2 rounded-xl bg-amber-warm text-white text-sm font-sans font-medium disabled:opacity-40">
                Add
              </button>
              <button onClick={() => setShowCustom(false)} className="p-2 rounded-xl hover:bg-paper-300">
                <X size={15} className="text-ink-300" />
              </button>
            </div>
          )}

          {filtered.map(ex => (
            <button key={ex.id} onClick={() => { onPick(ex.id!, ex.name); onClose() }}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-paper-200 text-left">
              <Dumbbell size={14} className="text-ink-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans font-medium text-ink">{ex.name}</p>
                <p className="text-xs font-sans text-ink-300 capitalize">{ex.muscleGroup}</p>
              </div>
              {ex.isCustom && <span className="text-xs font-sans text-ink-300">Custom</span>}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main editor sheet
// ---------------------------------------------------------------------------
export function TemplateEditorSheet({ template, onClose, showToast }: TemplateEditorSheetProps) {
  const [name, setName] = useState(template?.name ?? '')
  const [type, setType] = useState<WorkoutType>(template?.type ?? 'custom')
  const [exercises, setExercises] = useState<ExerciseRow[]>(() =>
    (template?.exercises ?? []).map((ex, i) => ({
      key: `e-${i}`,
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: ex.sets,
      repsTarget: ex.repsTarget?.toString() ?? '',
      weightTarget: ex.weightTarget?.toString() ?? '',
      order: ex.order ?? i,
    }))
  )
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  function addRow(id: number | null, exName: string) {
    setExercises(prev => [...prev, {
      key: `e-${Date.now()}`,
      exerciseId: id,
      exerciseName: exName,
      sets: 3,
      repsTarget: '',
      weightTarget: '',
      order: prev.length,
    }])
  }

  function removeRow(key: string) {
    setExercises(prev => prev.filter(e => e.key !== key))
  }

  function updateRow(key: string, field: Partial<ExerciseRow>) {
    setExercises(prev => prev.map(e => e.key === key ? { ...e, ...field } : e))
  }

  async function handleSave() {
    if (!name.trim()) { showToast('Template name is required', 'error'); return }
    if (exercises.length === 0) { showToast('Add at least one exercise', 'error'); return }

    setSaving(true)
    try {
      const resolved: WorkoutTemplateExercise[] = await Promise.all(
        exercises.map(async (ex, i) => {
          let id = ex.exerciseId
          if (!id) {
            const existing = await db.exercises
              .filter(e => e.name.toLowerCase() === ex.exerciseName.toLowerCase())
              .first()
            id = existing?.id ?? await createExercise({ name: ex.exerciseName, muscleGroup: 'full-body', isCustom: true })
          }
          return {
            exerciseId: id!,
            exerciseName: ex.exerciseName,
            sets: Math.max(1, Number(ex.sets) || 1),
            repsTarget: ex.repsTarget !== '' ? Number(ex.repsTarget) : undefined,
            weightTarget: ex.weightTarget !== '' ? Number(ex.weightTarget) : undefined,
            order: i,
          }
        })
      )

      const now = Date.now()
      if (template?.id) {
        await updateTemplate(template.id, { name: name.trim(), type, exercises: resolved })
        showToast('Template updated', 'success')
      } else {
        await saveTemplate({ name: name.trim(), type, exercises: resolved, createdAt: now, updatedAt: now })
        showToast('Template created', 'success')
      }
      onClose()
    } catch {
      showToast('Failed to save template', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="w-full bg-white rounded-t-3xl max-h-[92vh] flex flex-col"
          onClick={e => e.stopPropagation()}>

          <div className="w-10 h-1 bg-paper-400 rounded-full mx-auto mt-3 flex-shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-paper-200 flex-shrink-0">
            <button onClick={onClose} className="text-sm font-sans text-ink-300 hover:text-ink w-16">Cancel</button>
            <p className="font-sans font-semibold text-ink text-sm">
              {template ? 'Edit Template' : 'New Template'}
            </p>
            <button onClick={handleSave} disabled={saving}
              className="text-sm font-sans font-semibold text-amber-warm disabled:opacity-40 w-16 text-right">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 pb-8">
            {/* Name */}
            <div>
              <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2 block">
                Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Push Day A"
                className="w-full px-4 py-3 rounded-2xl bg-paper-300 text-sm font-sans text-ink outline-none focus:ring-2 focus:ring-amber-warm/30"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-2 block">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {WORKOUT_TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors',
                      type === t
                        ? cn(WORKOUT_TYPE_CONFIG[t].color, 'ring-2 ring-offset-1 ring-current')
                        : 'bg-paper-300 text-ink-300'
                    )}>
                    {WORKOUT_TYPE_CONFIG[t].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">
                  Exercises ({exercises.length})
                </label>
                <button onClick={() => setShowPicker(true)}
                  className="flex items-center gap-1 text-xs font-sans font-semibold text-amber-warm">
                  <Plus size={13} /> Add
                </button>
              </div>

              {exercises.length === 0 ? (
                <button onClick={() => setShowPicker(true)}
                  className="w-full py-8 rounded-2xl border-2 border-dashed border-paper-400 flex flex-col items-center gap-2 text-ink-300 hover:bg-paper-200 transition-colors">
                  <Dumbbell size={22} />
                  <span className="text-sm font-sans">Tap to add exercises</span>
                </button>
              ) : (
                <div className="space-y-2">
                  {exercises.map((ex, idx) => (
                    <div key={ex.key} className="bg-paper-200 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-xs font-sans font-bold text-ink-300 w-5 text-center">{idx + 1}</span>
                        <p className="flex-1 font-sans font-medium text-sm text-ink truncate">{ex.exerciseName}</p>
                        <button onClick={() => removeRow(ex.key)} className="p-1 rounded-lg hover:bg-paper-300">
                          <Trash2 size={13} className="text-ink-300" />
                        </button>
                      </div>
                      <div className="flex gap-2 pl-7">
                        <div className="flex-1 text-center">
                          <p className="text-[10px] font-sans text-ink-300 mb-1">Sets</p>
                          <input
                            type="number" min="1" max="20"
                            value={ex.sets}
                            onChange={e => updateRow(ex.key, { sets: Number(e.target.value) || 1 })}
                            className="w-full px-2 py-1.5 rounded-xl bg-white text-sm font-sans text-center outline-none border border-paper-300 focus:border-amber-warm"
                          />
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-[10px] font-sans text-ink-300 mb-1">Reps</p>
                          <input
                            type="number" min="1"
                            value={ex.repsTarget}
                            onChange={e => updateRow(ex.key, { repsTarget: e.target.value })}
                            placeholder="—"
                            className="w-full px-2 py-1.5 rounded-xl bg-white text-sm font-sans text-center outline-none border border-paper-300 focus:border-amber-warm"
                          />
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-[10px] font-sans text-ink-300 mb-1">kg</p>
                          <input
                            type="number" min="0"
                            value={ex.weightTarget}
                            onChange={e => updateRow(ex.key, { weightTarget: e.target.value })}
                            placeholder="—"
                            className="w-full px-2 py-1.5 rounded-xl bg-white text-sm font-sans text-center outline-none border border-paper-300 focus:border-amber-warm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showPicker && (
          <ExercisePicker
            onPick={(id, exName) => addRow(id, exName)}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
