import { cn } from '@/lib/utils/cn'
import { type HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'amber' | 'sage' | 'blush' | 'neutral'
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-sans',
        {
          'bg-amber-faint text-amber-dark': variant === 'amber',
          'bg-sage/20 text-sage-dark': variant === 'sage',
          'bg-blush/20 text-blush-dark': variant === 'blush',
          'bg-paper-300 text-ink-400': variant === 'neutral',
        },
        className
      )}
      {...props}
    />
  )
}
