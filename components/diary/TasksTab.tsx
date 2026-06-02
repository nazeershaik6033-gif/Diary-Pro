'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Pencil, Check, Mic, MicOff } from 'lucide-react'

export type TodoItem = { text: string; done: boolean }

export function TasksTab({
  todos,
  onChange,
}: {
  todos: TodoItem[]
  onChange: (t: TodoItem[]) => void
  showCarryForward?: boolean  // kept for API compat, no longer used
}) {
  const [newText, setNewText] = useState('')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [listening, setListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const editRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null)

  useEffect(() => {
    if (editingIdx !== null) editRef.current?.focus()
  }, [editingIdx])

  function toggleMic() {
    if (listening) { recRef.current?.stop(); setListening(false); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = false
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join(' ').trim()
      if (text) setNewText(prev => prev ? prev + ' ' + text : text)
    }
    rec.onend = () => { setListening(false); inputRef.current?.focus() }
    rec.onerror = () => setListening(false)
    recRef.current = rec; rec.start(); setListening(true)
  }

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
        <button type="button" onMouseDown={e => { e.preventDefault(); toggleMic() }}
          className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors"
          style={{ background: listening ? '#c4933f' : '#1a1a1a', border: '1px solid #2a2a2a', color: listening ? '#fff' : '#888' }}>
          {listening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
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

      {todos.length === 0 && (
        <p className="text-center text-sm font-sans text-[#555] py-6">No tasks yet — add one above</p>
      )}
    </div>
  )
}
