import { cn } from '@/lib/utils/cn'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-sans font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-amber-warm text-white shadow-warm hover:bg-amber-dark': variant === 'primary',
            'bg-paper-300 text-ink hover:bg-paper-400 border border-paper-400': variant === 'secondary',
            'text-ink-400 hover:bg-paper-300': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
          },
          {
            'text-sm px-3 py-1.5': size === 'sm',
            'text-base px-4 py-2.5': size === 'md',
            'text-lg px-6 py-3': size === 'lg',
          },
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
