import type { ReactNode } from 'react'
import { Button } from '@/components/atoms/Button'
import { SearchIcon } from '@/components/atoms/icons'

interface ListToolbarProps {
  search: string
  onSearch: (value: string) => void
  onClear: () => void
  showClear: boolean
  placeholder?: string
  extra?: ReactNode
}

export function ListToolbar({ search, onSearch, onClear, showClear, placeholder, extra }: ListToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-[18px] py-3.5">
      <label className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-md border border-border bg-bg px-3 py-2 sm:max-w-[300px]">
        <SearchIcon className="size-4 text-muted" />
        <input
          className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted/80"
          placeholder={placeholder ?? 'Search…'}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </label>
      {extra}
      {showClear && (
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
