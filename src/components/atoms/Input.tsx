import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink',
        'placeholder:text-muted/80 transition-colors outline-none',
        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25',
        'disabled:opacity-60 disabled:pointer-events-none',
        className,
      )}
      {...props}
    />
  )
})
