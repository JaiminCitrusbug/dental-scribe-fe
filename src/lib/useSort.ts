import { useState } from 'react'

export interface SortState {
  by: string
  order: 'asc' | 'desc'
}

/** Column sort state: clicking the active column flips direction, a new column starts ascending. */
export function useSort(initial: SortState, onChange?: () => void) {
  const [sort, setSort] = useState<SortState>(initial)

  function toggle(column: string) {
    setSort((s) =>
      s.by === column
        ? { by: column, order: s.order === 'asc' ? 'desc' : 'asc' }
        : { by: column, order: 'asc' },
    )
    onChange?.()
  }

  function reset() {
    setSort(initial)
  }

  const isDefault = sort.by === initial.by && sort.order === initial.order

  return { sort, toggle, reset, isDefault }
}
