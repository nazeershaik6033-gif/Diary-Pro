'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { toDateString, formatDisplay } from '@/lib/utils/date'
import { CheckSquare, Square, ClipboardList } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TasksPage() {
  const today = toDateString()

  const entry = useLiveQuery(
    () => db.diaryEntries.where('date').equals(today).filter(e => !e.deletedAt).first(),
    [today]
  )

  const todos = entry?.todos ?? []
  const done = todos.filter(t => t.done).length

  async function toggleTodo(index: number) {
    if (!entry?.id) return
    const updated = todos.map((t, i) => i === index ? { ...t, done: !t.done } : t)
    await db.diaryEntries.update(entry.id, { todos: updated, updatedAt: Date.now() })
  }

  return (
    <div className="px-4 pt-4 pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif font-bold text-ink text-xl">Today&apos;s Tasks</h1>
          <p className="text-xs font-sans text-ink-300 mt-0.5">{formatDisplay(today)}</p>
        </div>
        {todos.length > 0 && (
          <span className="text-xs font-sans text-amber-warm bg-amber-faint px-2.5 py-1 rounded-full">
            {done}/{todos.length} done
          </span>
        )}
      </div>

      {entry === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-paper-300 animate-pulse" />
          ))}
        </div>
      ) : todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-paper-300 flex items-center justify-center mb-4">
            <ClipboardList size={28} className="text-amber-warm" />
          </div>
          <h3 className="text-base font-serif font-semibold text-ink mb-2">No tasks today</h3>
          <p className="text-sm font-sans text-ink-300 mb-5 max-w-xs">
            Add tasks in your diary entry for today.
          </p>
          <Link
            href={`/diary/entry?date=${today}`}
            className="text-sm font-sans font-medium text-amber-warm border border-amber-warm/30 px-4 py-2 rounded-xl"
          >
            Open today&apos;s entry →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo, i) => (
            <motion.button
              key={i}
              onClick={() => toggleTodo(i)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-paper-100 border border-paper-300 text-left active:scale-[0.99] transition-transform"
            >
              {todo.done
                ? <CheckSquare size={20} className="text-amber-warm flex-shrink-0" />
                : <Square size={20} className="text-ink-300 flex-shrink-0" />
              }
              <span className={`text-sm font-sans flex-1 ${todo.done ? 'line-through text-ink-300' : 'text-ink'}`}>
                {todo.text}
              </span>
            </motion.button>
          ))}

          {done > 0 && done === todos.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <p className="text-sm font-sans text-amber-warm font-medium">All done! 🎉</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
