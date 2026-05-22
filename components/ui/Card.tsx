import { cn } from '@/lib/utils/cn'
import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated'
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white',
        variant === 'default' && 'shadow-warm-sm border border-paper-300',
        variant === 'elevated' && 'shadow-warm-md',
        className
      )}
      {...props}
    />
  )
}
