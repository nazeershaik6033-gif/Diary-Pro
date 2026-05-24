'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, RotateCcw } from 'lucide-react'
import { db } from '@/lib/db'
import { toDateString } from '@/lib/utils/date'
import { subDays } from 'date-fns'

export type TodoItem = { text: string; done: boolean }

export function TasksTab({
  todos,
  onChange,
  showCarryForward = false,
}: {
  todos: TodoItem[]
  onChange: (t: TodoItem[]) => void
  showCarryForward?: boolean
}) {
  const [newText, setNewText] = useState('')
  const [carryForward, setCarryForward] = useState<TodoItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showCarryForward) return
    const yesterday = toDateString(subDays(new Date(), 1))
    db.diaryEntries.where('date').equals(yesterday).first().then(entry => {
      const incomplete = (entry?.todos ?? []).filter(t => !t.done)
      setCarryForward(incomplete)
    })
  }, [showCarryForward])

  function addTask() {
    const text = newText.trim()
    if (!text) return
    onChange([...todos, { text, done: false }])
    setNewText('')
    inputRef.current?.focus()
  }

  function toggle(idx: number) {
    const updated = todos.map((t, i) => i === idx ? { ...t, done: !t.done } : t)
    onChange([...updated.filter(t => !t.done), ...updated.filter(t => t.done)])
  }

  function remove(idx: number) {
    onChange(todos.filter((_, i) => i !== idx))
  }

  function adoptCarryForward(task: TodoItem) {
    onChange([...todos, { text: task.text, done: false }])
    setCarryForward(prev => prev.filter(t => t.text !== task.text))
  }

  const undone = todos.filter(t => !t.done)
  const done = todos.filter(t => t.done)

  return (
    <div className="space-y-4">
      {/* Carry-forward from yesterday */}
      {carryForward.length > 0 && (
        <div className="rounded-2xl border border-amber-warm/30 bg-amber-faint p-4">
          <p className="text-xs font-sans font-semibold text-amber-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <RotateCcw size={11} /> Unfinished from yesterday
          </p>
          <div className="space-y-1.5">
            {carryForward.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm font-sans text-amber-dark">{t.text}</span>
                <button
                  type="button"
                  onClick={() => adoptCarryForward(t)}
                  className="text-xs font-sans text-amber-warm hover:underline flex-shrink-0"
                >
                  Add →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new task */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a task…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-paper-400 text-sm font-sans text-ink focus:outline-none focus:ring-2 focus:ring-amber-warm bg-white"
        />
        <button
          type="button"
          onClick={addTask}
          disabled={!newText.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-warm text-white disabled:opacity-40 flex-shrink-0"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Active tasks */}
      {undone.length > 0 && (
        <div className="space-y-2">
          {undone.map((task, i) => {
            const realIdx = todos.indexOf(task)
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-paper-300">
                <button type="button" onClick={() => toggle(realIdx)}
                  className="w-5 h-5 rounded-full border-2 border-ink-300 flex-shrink-0 hover:border-amber-warm transition-colors" />
                <span className="flex-1 text-sm font-sans text-ink">{task.text}</span>
                <button type="button" onClick={() => remove(realIdx)}
                  className="text-ink-200 hover:text-red-400 flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Completed tasks */}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-sans font-semibold text-ink-300 uppercase tracking-wider">Completed</p>
          {done.map((task, i) => {
            const realIdx = todos.indexOf(task)
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-paper-200 border border-paper-300">
                <button type="button" onClick={() => toggle(realIdx)}
                  className="w-5 h-5 rounded-full border-2 border-amber-warm bg-amber-warm flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </button>
                <span className="flex-1 text-sm font-sans text-ink-300 line-through">{task.text}</span>
                <button type="button" onClick={() => remove(realIdx)}
                  className="text-ink-200 hover:text-red-400 flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {todos.length === 0 && carryForward.length === 0 && (
        <p className="text-center text-sm font-sans text-ink-300 py-6">No tasks yet — add one above</p>
      )}
    </div>
  )
}
