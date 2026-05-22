'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: ReactNode
  className?: string
}

export function PageHeader({ title, showBack = true, onBack, rightAction, className }: PageHeaderProps) {
  const router = useRouter()
  const handleBack = onBack ?? (() => router.back())

  return (
    <header className={cn('flex items-center gap-3 px-4 py-4 sticky top-0 bg-paper z-10', className)}>
      {showBack && (
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-300 transition-colors"
        >
          <ArrowLeft size={20} className="text-ink" />
        </button>
      )}
      <h1 className="flex-1 text-xl font-serif font-semibold text-ink">{title}</h1>
      {rightAction}
    </header>
  )
}
