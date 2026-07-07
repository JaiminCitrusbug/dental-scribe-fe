import { ChevronDownIcon, ChevronUpIcon } from '@/components/atoms/icons'
import { cn } from '@/lib/cn'
import type { SortState } from '@/lib/useSort'

interface SortHeaderProps {
  label: string
  column: string
  sort: SortState
  onSort: (column: string) => void
  align?: 'left' | 'right'
}

export function SortHeader({ label, column, sort, onSort, align = 'left' }: SortHeaderProps) {
  const active = sort.by === column
  return (
    <th className={cn('px-2.5 pb-3', align === 'right' && 'text-right')}>
      <button
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted hover:text-ink"
      >
        {label}
        <span className="inline-flex flex-col leading-[0]">
          <ChevronUpIcon className={cn('-mb-[3px] size-3', active && sort.order === 'asc' ? 'text-primary' : 'text-muted/40')} />
          <ChevronDownIcon className={cn('size-3', active && sort.order === 'desc' ? 'text-primary' : 'text-muted/40')} />
        </span>
      </button>
    </th>
  )
}
