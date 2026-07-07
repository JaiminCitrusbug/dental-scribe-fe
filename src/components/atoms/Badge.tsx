import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { accentSurface, type Accent } from '@/lib/accent'

interface BadgeProps {
  tone?: Accent
  children: ReactNode
  className?: string
}

/** Small status pill. Never relies on color alone - always carries a label. */
export function Badge({ tone = 'sky', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
        accentSurface[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
