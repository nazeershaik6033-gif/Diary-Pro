'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { X, Tag } from 'lucide-react'
import { db } from '@/lib/db'
import { TAG_CATEGORY_CONFIG } from '@/types/tags'
import type { Tag as TagType, TagCategoryId } from '@/types/tags'
import { cn } from '@/lib/utils/cn'

interface TypedTagPickerProps {
  selectedTagIds: number[]
  onChange: (ids: number[]) => void
}

export function TypedTagPicker({ selectedTagIds, onChange }: TypedTagPickerProps) {
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showCategoryRow, setShowCategoryRow] = useState(false)
  const [pendingName, setPendingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const allTags = useLiveQuery(() => db.tags.toArray(), []) ?? []

  const selectedTags = allTags.filter(t => t.id !== undefined && selectedTagIds.includes(t.id!))

  const filteredTags = input.trim()
    ? allTags.filter(
        t =>
          t.name.toLowerCase().includes(input.toLowerCase()) &&
          !selectedTagIds.includes(t.id!)
      )
    : []

  const removeTag = (id: number) => {
    onChange(selectedTagIds.filter(i => i !== id))
  }

  const selectTag = (tag: TagType) => {
    if (tag.id !== undefined && !selectedTagIds.includes(tag.id)) {
      onChange([...selectedTagIds, tag.id])
    }
    setInput('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const createTag = async (name: string, categoryId: TagCategoryId) => {
    const trimmed = name.trim()
    if (!trimmed) return
    // Check for duplicate
    const existing = allTags.find(t => t.name.toLowerCase() === trimmed.toLowerCase())
    if (existing && existing.id !== undefined) {
      if (!selectedTagIds.includes(existing.id)) {
        onChange([...selectedTagIds, existing.id])
      }
    } else {
      const newId = await db.tags.add({ name: trimmed, categoryId, createdAt: Date.now() })
      onChange([...selectedTagIds, newId as number])
    }
    setInput('')
    setPendingName('')
    setShowCategoryRow(false)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed) return

      // If exact match exists in filtered, select it
      const exact = allTags.find(t => t.name.toLowerCase() === trimmed.toLowerCase())
      if (exact && exact.id !== undefined && !selectedTagIds.includes(exact.id)) {
        selectTag(exact)
        return
      }

      // Otherwise prompt for category
      setPendingName(trimmed)
      setShowCategoryRow(true)
      setIsOpen(false)
    } else if (e.key === 'Backspace' && !input && selectedTagIds.length > 0) {
      onChange(selectedTagIds.slice(0, -1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setShowCategoryRow(false)
    }
  }

  const handleInputChange = (val: string) => {
    setInput(val)
    setIsOpen(val.trim().length > 0)
    setShowCategoryRow(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <div className="flex items-center gap-1">
        <Tag size={14} className="text-ink-300" />
        <span className="text-sm font-medium font-sans text-ink-400">Tags</span>
      </div>

      {/* Chips + input row */}
      <div
        className="flex flex-wrap gap-2 p-3 rounded-xl border border-paper-400 bg-white min-h-[44px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="flex items-center gap-1 bg-amber-faint text-amber-dark text-xs font-sans px-2 py-1 rounded-full"
          >
            {tag.emoji && <span>{tag.emoji}</span>}
            {tag.name}
            <button
              type="button"
              aria-label={`Remove ${tag.name}`}
              onClick={e => { e.stopPropagation(); removeTag(tag.id!) }}
              className="hover:text-amber-dark/70 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => input.trim().length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder={selectedTagIds.length === 0 ? 'Add tag…' : ''}
          className="flex-1 min-w-[80px] outline-none text-[16px] font-sans text-ink placeholder:text-ink-300 bg-transparent"
        />
      </div>

      {/* Dropdown: matching existing tags */}
      {isOpen && filteredTags.length > 0 && (
        <div className="rounded-xl border border-paper-300 bg-white shadow-warm-sm overflow-hidden">
          {filteredTags.slice(0, 8).map(tag => (
            <button
              key={tag.id}
              type="button"
              onMouseDown={e => { e.preventDefault(); selectTag(tag) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-paper-300 transition-colors text-left"
            >
              {tag.emoji && <span className="text-base">{tag.emoji}</span>}
              <span className="flex-1 text-sm font-sans text-ink">{tag.name}</span>
              <span className="text-xs font-sans text-ink-300">
                {TAG_CATEGORY_CONFIG[tag.categoryId]?.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Dropdown: no matches — show "create" prompt */}
      {isOpen && filteredTags.length === 0 && input.trim().length > 0 && (
        <div className="rounded-xl border border-paper-300 bg-white shadow-warm-sm overflow-hidden">
          <button
            type="button"
            onMouseDown={e => {
              e.preventDefault()
              setPendingName(input.trim())
              setShowCategoryRow(true)
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-paper-300 transition-colors text-left"
          >
            <span className="text-sm font-sans text-ink">
              Create <strong>&ldquo;{input.trim()}&rdquo;</strong>
            </span>
          </button>
        </div>
      )}

      {/* Category row for new tag */}
      {showCategoryRow && pendingName && (
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-paper-300 bg-paper-50 animate-fade-in">
          <p className="text-xs font-sans text-ink-300">
            Pick a category for <strong>&ldquo;{pendingName}&rdquo;</strong>:
          </p>
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(TAG_CATEGORY_CONFIG) as [TagCategoryId, { label: string; emoji: string }][]).map(
              ([catId, cfg]) => (
                <button
                  key={catId}
                  type="button"
                  onClick={() => createTag(pendingName, catId)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-sans font-medium transition-colors',
                    'bg-paper-300 text-ink-300 hover:bg-amber-warm hover:text-white active:scale-[0.99]'
                  )}
                >
                  <span>{cfg.emoji}</span>
                  <span>{cfg.label}</span>
                </button>
              )
            )}
          </div>
          <button
            type="button"
            onClick={() => createTag(pendingName, 'custom')}
            className="text-xs font-sans text-amber-warm underline underline-offset-2 text-left"
          >
            Skip — use Custom
          </button>
        </div>
      )}
    </div>
  )
}
