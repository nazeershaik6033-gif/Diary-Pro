'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, RotateCcw, Pencil, Check } from 'lucide-react'
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
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const editRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showCarryForward) return
    const yesterday = toDateString(subDays(new Date(), 1))
    db.diaryEntries.where('date').equals(yesterday).first().then(entry => {
      const incomplete = (entry?.todos ?? []).filter(t => !t.done)
      setCarryForward(incomplete)
    })
  }, [showCarryForward])

  useEffect(() => {
    if (editingIdx !== null) editRef.current?.focus()
  }, [editingIdx])

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
    if (editingIdx === idx) setEditingIdx(null)
    onChange(todos.filter((_, i) => i !== idx))
  }

  function startEdit(idx: number, text: string) {
    setEditingIdx(idx)
    setEditText(text)
  }

  function saveEdit(idx: number) {
    const text = editText.trim()
    if (text) {
      onChange(todos.map((t, i) => i === idx ? { ...t, text } : t))
    }
    setEditingIdx(null)
  }

  function adoptCarryForward(task: TodoItem) {
    onChange([...todos, { text: task.text, done: false }])
    setCarryForward(prev => prev.filter(t => t.text !== task.text))
  }

  const undone = todos.filter(t => !t.done)
  const done = todos.filter(t => t.done)

  const TaskRow = ({ task, realIdx, completed }: { task: TodoItem; realIdx: number; completed: boolean }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: completed ? '#161616' : '#1a1a1a', borderColor: '#2a2a2a' }}>
      <button type="button" onClick={() => toggle(realIdx)}
        className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors"
        style={{ borderColor: completed ? '#c4933f' : '#555', background: completed ? '#c4933f' : 'transparent' }}>
        {completed && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#111]" /></div>}
      </button>

      {editingIdx === realIdx ? (
        <input
          ref={editRef}
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(realIdx); if (e.key === 'Escape') setEditingIdx(null) }}
          onBlur={() => saveEdit(realIdx)}
          className="flex-1 bg-[#111] border border-[#c4933f]/50 rounded-lg px-2 py-1 text-sm font-sans text-white focus:outline-none focus:ring-1 focus:ring-amber-warm"
        />
      ) : (
        <span className={`flex-1 text-sm font-sans ${completed ? 'text-[#555] line-through' : 'text-[#ddd]'}`}>
          {task.text}
        </span>
      )}

      <div className="flex items-center gap-1 flex-shrink-0">
        {editingIdx === realIdx ? (
          <button type="button" onClick={() => saveEdit(realIdx)} className="text-amber-warm hover:text-amber-dark">
            <Check size={13} />
          </button>
        ) : (
          <button type="button" onClick={() => startEdit(realIdx, task.text)} className="text-[#555] hover:text-[#aaa]">
            <Pencil size={13} />
          </button>
        )}
        <button type="button" onClick={() => remove(realIdx)} className="text-[#555] hover:text-red-400">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {carryForward.length > 0 && (
        <div className="rounded-2xl p-4" style={{ border: '1px solid rgba(196,147,63,0.3)', background: 'rgba(196,147,63,0.08)' }}>
          <p className="text-xs font-sans font-semibold text-amber-warm uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <RotateCcw size={11} /> Unfinished from yesterday
          </p>
          <div className="space-y-1.5">
            {carryForward.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm font-sans text-[#c4933f]">{t.text}</span>
                <button type="button" onClick={() => adoptCarryForward(t)}
                  className="text-xs font-sans text-amber-warm hover:underline flex-shrink-0">
                  Add →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a task…"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-sans text-white focus:outline-none focus:ring-2 focus:ring-amber-warm"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
        />
        <button type="button" onClick={addTask} disabled={!newText.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-warm text-white disabled:opacity-40 flex-shrink-0">
          <Plus size={16} />
        </button>
      </div>

      {undone.length > 0 && (
        <div className="space-y-2">
          {undone.map((task, i) => (
            <TaskRow key={i} task={task} realIdx={todos.indexOf(task)} completed={false} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-sans font-semibold text-[#555] uppercase tracking-wider">Completed</p>
          {done.map((task, i) => (
            <TaskRow key={i} task={task} realIdx={todos.indexOf(task)} completed />
          ))}
        </div>
      )}

      {todos.length === 0 && carryForward.length === 0 && (
        <p className="text-center text-sm font-sans text-[#555] py-6">No tasks yet — add one above</p>
      )}
    </div>
  )
}
