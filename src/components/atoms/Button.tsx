import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'ghost' | 'subtle'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  leadingIcon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white border-transparent shadow-card hover:bg-primary-ink',
  ghost: 'bg-surface text-ink border-border hover:bg-bg',
  subtle: 'bg-bg text-ink border-transparent hover:bg-border/60',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  leadingIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md border font-display font-bold',
        'tracking-[-0.01em] transition-colors focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {leadingIcon && <span className="size-4 shrink-0">{leadingIcon}</span>}
      {children}
    </button>
  )
}
