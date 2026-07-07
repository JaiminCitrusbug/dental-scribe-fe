import { cn } from '@/lib/cn'
import { accentSurface, type Accent } from '@/lib/accent'

interface AvatarProps {
  initials: string
  tone?: Accent
  size?: 'sm' | 'md'
  className?: string
}

const sizes = {
  sm: 'size-[34px] text-[12.5px] rounded-[9px]',
  md: 'size-[38px] text-sm rounded-md',
}

/** Initials avatar. Decorative - the accompanying name carries the meaning. */
export function Avatar({ initials, tone = 'sky', size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'grid place-items-center font-display font-bold select-none',
        accentSurface[tone],
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
