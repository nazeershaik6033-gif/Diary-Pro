'use client'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search…', className }: SearchBarProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search size={16} className="absolute left-3 text-ink-200" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-paper-300 pl-9 pr-9 py-2.5 text-[16px] font-sans text-ink placeholder:text-ink-200 focus:outline-none focus:ring-2 focus:ring-amber-warm"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3">
          <X size={16} className="text-ink-300" />
        </button>
      )}
    </div>
  )
}
