import { cn } from '@/lib/utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('w-5 h-5 rounded-full border-2 border-paper-400 border-t-amber-warm animate-spin', className)} />
  )
}
