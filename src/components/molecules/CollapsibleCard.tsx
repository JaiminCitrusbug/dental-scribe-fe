import { useState, type ReactNode } from 'react'
import { Card, CardBody } from '@/components/atoms/Card'
import { ChevronDownIcon } from '@/components/atoms/icons'
import { cn } from '@/lib/cn'

interface CollapsibleCardProps {
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  bodyClassName?: string
  className?: string
}

export function CollapsibleCard({
  title,
  actions,
  children,
  defaultOpen = true,
  bodyClassName,
  className,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className={className}>
      <div className={cn('flex items-center justify-between px-[18px] py-4', open && 'border-b border-border')}>
        <h3 className="text-[15.5px] font-bold text-ink">{title}</h3>
        <div className="flex items-center gap-1.5">
          {actions}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Collapse' : 'Expand'}
            aria-expanded={open}
            className="grid size-8 place-items-center rounded-md border border-border text-muted hover:bg-bg"
          >
            <ChevronDownIcon className={cn('size-4 transition-transform', !open && '-rotate-90')} />
          </button>
        </div>
      </div>
      {open && <CardBody className={bodyClassName}>{children}</CardBody>}
    </Card>
  )
}
