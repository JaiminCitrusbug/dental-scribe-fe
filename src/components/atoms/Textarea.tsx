import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[88px] w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink',
        'placeholder:text-muted/80 transition-colors outline-none resize-y',
        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25',
        className,
      )}
      {...props}
    />
  )
})
