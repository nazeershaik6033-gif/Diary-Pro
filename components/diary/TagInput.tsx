'use client'
import { useState, type KeyboardEvent } from 'react'
import { X, Tag } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !value.includes(t)) {
      onChange([...value, t])
    }
    setInput('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag))
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <Tag size={14} className="text-ink-300" />
        <span className="text-sm font-medium font-sans text-ink-400">Tags</span>
      </div>
      <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-paper-400 bg-white min-h-[44px]">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 bg-amber-faint text-amber-dark text-xs font-sans px-2 py-1 rounded-full">
            #{tag}
            <button type="button" onClick={() => removeTag(tag)}>
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => input && addTag(input)}
          placeholder={value.length === 0 ? 'Add tags…' : ''}
          className="flex-1 min-w-[80px] outline-none text-[16px] font-sans text-ink placeholder:text-ink-200 bg-transparent"
        />
      </div>
    </div>
  )
}
