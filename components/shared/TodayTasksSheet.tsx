'use client'
import { useState, useRef } from 'react'
import { X, Plus, Pencil, Check, Trash2, ClipboardList } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { toDateString } from '@/lib/utils/date'
import { createDiaryEntry } from '@/lib/db/diary'
import { cn } from '@/lib/utils/cn'
import type { TodoItem } from '@/components/diary/TasksTab'

interface TodayTasksSheetProps {
  open: boolean
  onClose: () => void
}

export function TodayTasksSheet({ open, onClose }: TodayTasksSheetProps) {
  const today = toDateString()
  const [newText, setNewText] = useState('')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const entry = useLiveQuery(
    () => db.diaryEntries.where('date').equals(today).filter(e => !e.deletedAt).first(),
    [today]
  )

  const todos: TodoItem[] = entry?.todos ?? []
  const undone = todos.filter(t => !t.done)
  const done = todos.filter(t => t.done)

  async function saveTodos(updated: TodoItem[]) {
    if (entry?.id) {
      await db.diaryEntries.update(entry.id, { todos: updated, updatedAt: Date.now() })
    } else {
      // Create today's entry if none exists
      const now = Date.now()
      await createDiaryEntry({
        date: today, title: '', content: '', learnings: undefined,
        gratitude: ['', '', ''], tagIds: [], hasPhotos: false,
        todos: updated, starred: false, pinned: false, createdAt: now, updatedAt: now,
      })
    }
  }

  async function addTask() {
    const text = newText.trim()
    if (!text) return
    await saveTodos([...todos, { text, done: false }])
    setNewText('')
    inputRef.current?.focus()
  }

  async function toggle(idx: number) {
    const updated = todos.map((t, i) => i === idx ? { ...t, done: !t.done } : t)
    await saveTodos([...updated.filter(t => !t.done), ...updated.filter(t => t.done)])
  }

  async function remove(idx: number) {
    await saveTodos(todos.filter((_, i) => i !== idx))
  }

  async function saveEdit(idx: number) {
    const text = editText.trim()
    if (text) await saveTodos(todos.map((t, i) => i === idx ? { ...t, text } : t))
    setEditingIdx(null)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rounded-t-2xl flex flex-col max-h-[80vh]" style={{ background: '#141414', border: '1px solid #222', borderBottom: 'none' }}>

        {/* Handle + header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-3" style={{ borderBottom: '1px solid #1e1e1e' }}>
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-amber-warm" />
            <span className="font-serif font-semibold text-white text-base">Today's Tasks</span>
            {todos.length > 0 && (
              <span className="text-[11px] font-sans px-2 py-0.5 rounded-full" style={{ background: '#c4933f22', color: '#c4933f' }}>
                {done.length}/{todos.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#666] hover:text-white hover:bg-[#222] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {entry === undefined ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: '#1a1a1a' }} />
            ))
          ) : todos.length === 0 ? (
            <p className="text-center text-sm font-sans py-6" style={{ color: '#555' }}>No tasks yet — add one below</p>
          ) : (
            <>
              {undone.map((task, i) => {
                const realIdx = todos.indexOf(task)
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #222' }}>
                    <button type="button" onClick={() => toggle(realIdx)}
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors"
                      style={{ borderColor: '#444' }} />
                    {editingIdx === realIdx ? (
                      <input autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(realIdx); if (e.key === 'Escape') setEditingIdx(null) }}
                        onBlur={() => saveEdit(realIdx)}
                        className="flex-1 rounded-lg px-2 py-1 text-sm font-sans text-white focus:outline-none focus:ring-1 focus:ring-amber-warm"
                        style={{ background: '#111', border: '1px solid #c4933f55' }} />
                    ) : (
                      <span className="flex-1 text-sm font-sans text-[#ddd]">{task.text}</span>
                    )}
                    <div className="flex gap-1 flex-shrink-0">
                      {editingIdx === realIdx
                        ? <button type="button" onClick={() => saveEdit(realIdx)} className="text-amber-warm"><Check size={13} /></button>
                        : <button type="button" onClick={() => { setEditingIdx(realIdx); setEditText(task.text) }} className="text-[#555] hover:text-[#aaa]"><Pencil size={13} /></button>
                      }
                      <button type="button" onClick={() => remove(realIdx)} className="text-[#555] hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </div>
                )
              })}

              {done.length > 0 && (
                <>
                  <p className="text-[11px] font-sans uppercase tracking-wider pt-1" style={{ color: '#444' }}>Done ({done.length})</p>
                  {done.map((task, i) => {
                    const realIdx = todos.indexOf(task)
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                        <button type="button" onClick={() => toggle(realIdx)}
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                          style={{ borderColor: '#c4933f', background: '#c4933f' }}>
                          <div className="w-2 h-2 rounded-full bg-[#111]" />
                        </button>
                        <span className="flex-1 text-sm font-sans line-through" style={{ color: '#444' }}>{task.text}</span>
                        <button type="button" onClick={() => remove(realIdx)} className="text-[#555] hover:text-red-400 flex-shrink-0"><Trash2 size={13} /></button>
                      </div>
                    )
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* Add task input */}
        <div className="px-4 py-3 flex gap-2" style={{ borderTop: '1px solid #1e1e1e', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <input ref={inputRef} value={newText} onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Add a task…"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-sans text-white focus:outline-none focus:ring-2 focus:ring-amber-warm"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
          <button type="button" onClick={addTask} disabled={!newText.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-warm text-white disabled:opacity-40 flex-shrink-0">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
