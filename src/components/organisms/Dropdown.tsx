import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface DropdownItem {
  label: string
  onClick: () => void
}

interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  triggerClassName?: string
}

/** Minimal click-away dropdown menu. */
export function Dropdown({ trigger, items, align = 'right', triggerClassName }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button type="button" className={triggerClassName} onClick={() => setOpen((v) => !v)}>
        {trigger}
      </button>
      {open && (
        <div
          className={cn(
            'absolute z-30 mt-1.5 min-w-[160px] overflow-hidden rounded-md border border-border bg-surface py-1 shadow-pop',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick()
                setOpen(false)
              }}
              className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-ink hover:bg-bg"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
