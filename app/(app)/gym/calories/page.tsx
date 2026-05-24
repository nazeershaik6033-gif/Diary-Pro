'use client'
import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '@/lib/db'
import { useToast } from '@/app/contexts/ToastContext'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  addNutritionLog, deleteNutritionLog,
  saveFoodLibraryItem, deleteFoodLibraryItem,
  getNutritionGoals, saveNutritionGoals,
} from '@/lib/db/nutrition'
import {
  MEAL_TYPES, MEAL_TYPE_CONFIG,
  type MealType, type NutritionLog, type FoodLibraryItem, type NutritionGoals,
} from '@/types/nutrition'
import { DEFAULT_NUTRITION_GOALS } from '@/types/nutrition'
import { WORKOUT_TYPE_CONFIG } from '@/types/gym'
import { toDateString } from '@/lib/utils/date'
import { format, addDays, subDays, parseISO } from 'date-fns'
import {
  ChevronLeft, ChevronRight, Plus, Trash2, X, Flame,
  Target, BookOpen, Settings2, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ── MET estimates per workout type (kcal/kg/hr ÷ 1 = MET) ────────────────────
const WORKOUT_MET: Record<string, number> = {
  push: 5.5, pull: 5.5, legs: 6.0,
  'full-body': 5.5, upper: 5.5, lower: 6.0, custom: 5.0,
}

function estimateBurn(startedAt: number, completedAt: number, type: string, bodyWeightKg: number): number {
  const hours = (completedAt - startedAt) / 3_600_000
  const met = WORKOUT_MET[type] ?? 5.0
  return Math.round(met * bodyWeightKg * hours)
}

// ── Macro progress bar ────────────────────────────────────────────────────────
function MacroBar({ label, value, goal, color }: {
  label: string; value: number; goal: number; color: string
}) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-sans text-ink-300">{label}</span>
        <span className="text-xs font-sans text-ink font-medium">{value}g <span className="text-ink-300">/ {goal}g</span></span>
      </div>
      <div className="h-2 bg-paper-300 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Add-meal bottom sheet ─────────────────────────────────────────────────────
function AddMealSheet({ mealType, date, onClose, showToast }: {
  mealType: MealType
  date: string
  onClose: () => void
  showToast: (m: string, t: 'success' | 'error') => void
}) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [saveToLib, setSaveToLib] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [libSearch, setLibSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const library = useLiveQuery(() => db.foodLibrary.orderBy('name').toArray(), [])

  const filteredLib = (library ?? []).filter(f =>
    !libSearch.trim() || f.name.toLowerCase().includes(libSearch.toLowerCase())
  )

  function fillFromLibrary(item: FoodLibraryItem) {
    setName(item.name)
    setCalories(item.calories.toString())
    setProtein(item.protein?.toString() ?? '')
    setCarbs(item.carbs?.toString() ?? '')
    setFat(item.fat?.toString() ?? '')
    setShowLibrary(false)
  }

  async function handleSave() {
    if (!name.trim()) { showToast('Name is required', 'error'); return }
    const kcal = Number(calories)
    if (!kcal || kcal <= 0) { showToast('Enter a valid calorie amount', 'error'); return }

    setSaving(true)
    try {
      let libId: number | undefined
      if (saveToLib) {
        libId = await saveFoodLibraryItem({
          name: name.trim(), calories: kcal,
          protein: protein ? Number(protein) : undefined,
          carbs: carbs ? Number(carbs) : undefined,
          fat: fat ? Number(fat) : undefined,
          createdAt: Date.now(),
        })
      }
      await addNutritionLog({
        date, mealType, name: name.trim(), calories: kcal,
        protein: protein ? Number(protein) : undefined,
        carbs: carbs ? Number(carbs) : undefined,
        fat: fat ? Number(fat) : undefined,
        foodLibraryId: libId,
        createdAt: Date.now(),
      })
      showToast('Logged', 'success')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const cfg = MEAL_TYPE_CONFIG[mealType]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="w-full bg-white rounded-t-3xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        <div className="w-10 h-1 bg-paper-400 rounded-full mx-auto mt-3 flex-shrink-0" />

        <div className="flex items-center justify-between px-5 py-3 border-b border-paper-200 flex-shrink-0">
          <button onClick={onClose} className="text-sm font-sans text-ink-300 w-16">Cancel</button>
          <p className={cn('font-sans font-semibold text-sm', cfg.color)}>
            Add to {cfg.label}
          </p>
          <button onClick={handleSave} disabled={saving}
            className="text-sm font-sans font-semibold text-amber-warm disabled:opacity-40 w-16 text-right">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-8">
          {/* Library picker toggle */}
          {(library ?? []).length > 0 && (
            <button onClick={() => setShowLibrary(v => !v)}
              className="flex items-center gap-2 text-xs font-sans font-medium text-amber-warm">
              <BookOpen size={13} />
              {showLibrary ? 'Hide library' : 'Pick from my food library'}
            </button>
          )}

          {/* Library list */}
          {showLibrary && (
            <div className="border border-paper-300 rounded-2xl overflow-hidden">
              <div className="px-3 py-2 border-b border-paper-200">
                <input value={libSearch} onChange={e => setLibSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full text-sm font-sans outline-none bg-transparent text-ink placeholder:text-ink-300" />
              </div>
              <div className="max-h-44 overflow-y-auto">
                {filteredLib.length === 0 ? (
                  <p className="text-xs font-sans text-ink-300 text-center py-3">No items found</p>
                ) : filteredLib.map(f => (
                  <button key={f.id} onClick={() => fillFromLibrary(f)}
                    className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-paper-200 text-left">
                    <span className="text-sm font-sans text-ink">{f.name}</span>
                    <span className="text-xs font-sans text-ink-300">{f.calories} kcal</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-1.5 block">
              Food / Meal name
            </label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Chicken rice bowl"
              className="w-full px-4 py-3 rounded-2xl bg-paper-300 text-sm font-sans text-ink outline-none focus:ring-2 focus:ring-amber-warm/30" />
          </div>

          {/* Calories */}
          <div>
            <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-1.5 block">
              Calories (kcal)
            </label>
            <input value={calories} onChange={e => setCalories(e.target.value)}
              type="number" min="0" placeholder="e.g. 450"
              className="w-full px-4 py-3 rounded-2xl bg-paper-300 text-sm font-sans text-ink outline-none focus:ring-2 focus:ring-amber-warm/30" />
          </div>

          {/* Macros row */}
          <div>
            <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-1.5 block">
              Macros (g) — optional
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Protein', val: protein, set: setProtein },
                { label: 'Carbs', val: carbs, set: setCarbs },
                { label: 'Fat', val: fat, set: setFat },
              ].map(m => (
                <div key={m.label}>
                  <p className="text-[10px] font-sans text-ink-300 mb-1 text-center">{m.label}</p>
                  <input value={m.val} onChange={e => m.set(e.target.value)}
                    type="number" min="0" placeholder="—"
                    className="w-full px-2 py-2 rounded-xl bg-paper-300 text-sm font-sans text-center text-ink outline-none border border-paper-300 focus:border-amber-warm" />
                </div>
              ))}
            </div>
          </div>

          {/* Save to library */}
          <button onClick={() => setSaveToLib(v => !v)}
            className={cn(
              'flex items-center gap-2 w-full px-4 py-3 rounded-2xl border text-sm font-sans transition-colors',
              saveToLib ? 'border-amber-warm bg-amber-warm/10 text-amber-warm' : 'border-paper-300 text-ink-300'
            )}>
            <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
              saveToLib ? 'bg-amber-warm border-amber-warm' : 'border-ink-300')}>
              {saveToLib && <Check size={11} className="text-white" />}
            </div>
            Save to my food library for quick reuse
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Goals editor sheet ────────────────────────────────────────────────────────
function GoalsSheet({ goals, onClose, showToast }: {
  goals: NutritionGoals
  onClose: () => void
  showToast: (m: string, t: 'success' | 'error') => void
}) {
  const [cal, setCal] = useState(goals.calories.toString())
  const [pro, setPro] = useState(goals.protein.toString())
  const [carb, setCarb] = useState(goals.carbs.toString())
  const [f, setF] = useState(goals.fat.toString())
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const c = Number(cal), p = Number(pro), cb = Number(carb), ft = Number(f)
    if (!c || c <= 0) { showToast('Enter a valid calorie goal', 'error'); return }
    setSaving(true)
    try {
      await saveNutritionGoals({ calories: c, protein: p, carbs: cb, fat: ft })
      showToast('Goals saved', 'success')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="w-full bg-white rounded-t-3xl pb-8"
        onClick={e => e.stopPropagation()}>

        <div className="w-10 h-1 bg-paper-400 rounded-full mx-auto mt-3" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-paper-200">
          <button onClick={onClose} className="text-sm font-sans text-ink-300 w-16">Cancel</button>
          <p className="font-sans font-semibold text-sm text-ink">Daily Goals</p>
          <button onClick={handleSave} disabled={saving}
            className="text-sm font-sans font-semibold text-amber-warm disabled:opacity-40 w-16 text-right">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {[
            { label: 'Calorie Goal (kcal)', val: cal, set: setCal },
            { label: 'Protein Goal (g)', val: pro, set: setPro },
            { label: 'Carbs Goal (g)', val: carb, set: setCarb },
            { label: 'Fat Goal (g)', val: f, set: setF },
          ].map(row => (
            <div key={row.label}>
              <label className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider mb-1.5 block">
                {row.label}
              </label>
              <input value={row.val} onChange={e => row.set(e.target.value)}
                type="number" min="0"
                className="w-full px-4 py-3 rounded-2xl bg-paper-300 text-sm font-sans text-ink outline-none focus:ring-2 focus:ring-amber-warm/30" />
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CaloriesPage() {
  const { showToast } = useToast()
  const [date, setDate] = useState(() => toDateString())
  const [addingMeal, setAddingMeal] = useState<MealType | null>(null)
  const [showGoals, setShowGoals] = useState(false)
  const [goals, setGoals] = useState<NutritionGoals>({ ...DEFAULT_NUTRITION_GOALS, id: 1 })

  // Load goals on mount
  useEffect(() => {
    getNutritionGoals().then(setGoals)
  }, [])

  const logs = useLiveQuery(
    () => db.nutritionLogs.where('date').equals(date).sortBy('createdAt'),
    [date]
  ) ?? []

  const workoutLog = useLiveQuery(
    () => db.workoutLogs.where('date').equals(date).filter(l => !!l.completedAt).first(),
    [date]
  )

  const latestBodyWeight = useLiveQuery(
    () => db.bodyMetrics.where('date').belowOrEqual(date).reverse().first()
      .then(m => m?.bodyWeight ?? 70),
    [date]
  ) ?? 70

  // Totals
  const totalCal = logs.reduce((s, l) => s + l.calories, 0)
  const totalPro = logs.reduce((s, l) => s + (l.protein ?? 0), 0)
  const totalCarb = logs.reduce((s, l) => s + (l.carbs ?? 0), 0)
  const totalFat = logs.reduce((s, l) => s + (l.fat ?? 0), 0)

  const burnedCal = workoutLog?.completedAt && workoutLog.startedAt
    ? estimateBurn(workoutLog.startedAt, workoutLog.completedAt, workoutLog.templateName?.split(' ')[0]?.toLowerCase() ?? 'custom', latestBodyWeight)
    : 0
  const netCal = totalCal - burnedCal
  const calPct = goals.calories > 0 ? Math.min(100, (totalCal / goals.calories) * 100) : 0

  const isToday = date === toDateString()
  const dateLabel = isToday ? 'Today' : format(parseISO(date), 'EEE, MMM d')

  // Refresh goals after sheet closes
  const handleGoalsClose = () => {
    setShowGoals(false)
    getNutritionGoals().then(setGoals)
  }

  return (
    <div>
      <PageHeader title="Calories" showBack />

      <div className="px-4 pb-12 space-y-4">
        {/* Date navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setDate(d => toDateString(subDays(parseISO(d), 1)))}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300">
            <ChevronLeft size={20} className="text-ink-300" />
          </button>
          <button onClick={() => setDate(toDateString())}
            className={cn('font-sans font-semibold text-sm px-3 py-1.5 rounded-lg transition-colors',
              isToday ? 'text-amber-warm' : 'text-ink hover:bg-paper-300')}>
            {dateLabel}
          </button>
          <button onClick={() => setDate(d => toDateString(addDays(parseISO(d), 1)))}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300"
            disabled={isToday}>
            <ChevronRight size={20} className={cn('text-ink-300', isToday && 'opacity-30')} />
          </button>
        </div>

        {/* Calorie summary card */}
        <div className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-sans text-ink-300 uppercase tracking-wider">Calories</p>
              <p className="text-2xl font-serif font-bold text-ink mt-0.5">
                {totalCal.toLocaleString()}
                <span className="text-sm font-sans font-normal text-ink-300 ml-1.5">/ {goals.calories.toLocaleString()} kcal</span>
              </p>
            </div>
            <button onClick={() => setShowGoals(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 text-ink-300">
              <Settings2 size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-paper-300 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all',
              calPct >= 100 ? 'bg-red-400' : 'bg-amber-warm')}
              style={{ width: `${calPct}%` }} />
          </div>

          {/* Net calories row */}
          {burnedCal > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <Flame size={13} className="text-orange-400 flex-shrink-0" />
              <span className="text-xs font-sans text-ink-300">
                ~{burnedCal} kcal burned ({workoutLog!.templateName})
              </span>
              <span className="ml-auto text-xs font-sans font-semibold text-ink">
                Net: {netCal.toLocaleString()} kcal
              </span>
            </div>
          )}

          {/* Macros */}
          <div className="pt-1 space-y-2">
            <MacroBar label="Protein" value={totalPro} goal={goals.protein} color="bg-blue-400" />
            <MacroBar label="Carbs"   value={totalCarb} goal={goals.carbs}   color="bg-green-400" />
            <MacroBar label="Fat"     value={totalFat}  goal={goals.fat}     color="bg-orange-400" />
          </div>
        </div>

        {/* Meal sections */}
        {MEAL_TYPES.map(mealType => {
          const mealLogs = logs.filter(l => l.mealType === mealType)
          const mealCal = mealLogs.reduce((s, l) => s + l.calories, 0)
          const cfg = MEAL_TYPE_CONFIG[mealType]
          return (
            <div key={mealType} className="bg-white rounded-2xl shadow-warm-sm border border-paper-300 overflow-hidden">
              {/* Section header */}
              <div className={cn('flex items-center justify-between px-4 py-3 border-b border-paper-200', cfg.bg)}>
                <div>
                  <p className={cn('font-sans font-semibold text-sm', cfg.color)}>{cfg.label}</p>
                  {mealCal > 0 && (
                    <p className="text-xs font-sans text-ink-300 mt-0.5">{mealCal} kcal</p>
                  )}
                </div>
                <button onClick={() => setAddingMeal(mealType)}
                  className="flex items-center gap-1 text-xs font-sans font-medium text-amber-warm">
                  <Plus size={13} /> Add
                </button>
              </div>

              {/* Entries */}
              {mealLogs.length === 0 ? (
                <p className="text-xs font-sans text-ink-300 text-center py-3">Nothing logged</p>
              ) : (
                <div className="divide-y divide-paper-200">
                  {mealLogs.map(log => (
                    <div key={log.id} className="flex items-center px-4 py-2.5 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-sans text-ink truncate">{log.name}</p>
                        {(log.protein || log.carbs || log.fat) && (
                          <p className="text-xs font-sans text-ink-300 mt-0.5">
                            {[
                              log.protein && `P ${log.protein}g`,
                              log.carbs && `C ${log.carbs}g`,
                              log.fat && `F ${log.fat}g`,
                            ].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-sans font-medium text-ink flex-shrink-0">
                        {log.calories} kcal
                      </span>
                      <button onClick={() => deleteNutritionLog(log.id!).then(() => showToast('Removed', 'success'))}
                        className="p-1.5 rounded-lg hover:bg-paper-300 text-ink-300 flex-shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add meal sheet */}
      <AnimatePresence>
        {addingMeal && (
          <AddMealSheet
            mealType={addingMeal}
            date={date}
            onClose={() => setAddingMeal(null)}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Goals sheet */}
      <AnimatePresence>
        {showGoals && (
          <GoalsSheet
            goals={goals}
            onClose={handleGoalsClose}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
