'use client'

import { useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { DiaryPage } from '@/types/diary'
import { cn } from '@/lib/utils/cn'

interface PageToolbarProps {
  pages: DiaryPage[]
  activePageIndex: number
  onSelect: (index: number) => void
  onAddPage: () => void
  onDeletePage: (index: number) => void
  onRenamePage: (index: number, title: string) => void
}

export function PageToolbar({
  pages,
  activePageIndex,
  onSelect,
  onAddPage,
  onDeletePage,
  onRenamePage,
}: PageToolbarProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const getTabLabel = (page: DiaryPage, index: number) =>
    page.title?.trim() || `Page ${index + 1}`

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setEditValue(pages[index].title?.trim() || `Page ${index + 1}`)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitEdit = () => {
    if (editingIndex !== null) {
      const trimmed = editValue.trim()
      onRenamePage(editingIndex, trimmed)
    }
    setEditingIndex(null)
    setEditValue('')
  }

  const handleLongPressStart = (index: number) => {
    if (index !== activePageIndex) return
    longPressTimer.current = setTimeout(() => {
      startEdit(index)
    }, 500)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    if (confirmDeleteIndex === index) {
      onDeletePage(index)
      setConfirmDeleteIndex(null)
    } else {
      setConfirmDeleteIndex(index)
      // auto-cancel confirm after 3s
      setTimeout(() => setConfirmDeleteIndex(null), 3000)
    }
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {pages.map((page, index) => {
        const isActive = index === activePageIndex
        const isEditing = editingIndex === index
        const isConfirmingDelete = confirmDeleteIndex === index

        return (
          <div
            key={page.id}
            className={cn(
              'relative flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-sans font-medium transition-colors select-none',
              isActive
                ? 'bg-amber-warm text-white'
                : 'bg-paper-300 text-ink-300 hover:bg-paper-400 cursor-pointer'
            )}
            onClick={() => {
              if (!isEditing) onSelect(index)
            }}
            onMouseDown={() => handleLongPressStart(index)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={() => handleLongPressStart(index)}
            onTouchEnd={handleLongPressEnd}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitEdit()
                  if (e.key === 'Escape') {
                    setEditingIndex(null)
                    setEditValue('')
                  }
                }}
                className="bg-transparent outline-none text-sm font-sans font-medium w-24 text-[16px]"
                style={{ fontSize: '14px' }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span className="whitespace-nowrap">{getTabLabel(page, index)}</span>
            )}

            {/* Delete button — only on active tab when more than 1 page */}
            {isActive && pages.length > 1 && !isEditing && (
              <button
                type="button"
                aria-label={
                  isConfirmingDelete ? 'Confirm delete page' : 'Delete page'
                }
                onClick={e => handleDeleteClick(e, index)}
                className={cn(
                  'ml-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-all',
                  isConfirmingDelete
                    ? 'bg-red-500 text-white'
                    : 'bg-white/30 text-white hover:bg-white/50'
                )}
              >
                <X size={10} />
              </button>
            )}
          </div>
        )
      })}

      {/* Add page button */}
      <button
        type="button"
        aria-label="Add page"
        onClick={onAddPage}
        className="flex-shrink-0 w-8 h-8 rounded-xl bg-paper-300 text-ink-300 hover:bg-paper-400 flex items-center justify-center transition-colors active:scale-[0.99]"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
