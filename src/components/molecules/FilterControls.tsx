const fieldClass =
  'rounded-md border border-border bg-bg px-2.5 py-2 text-[12.5px] font-medium text-ink outline-none focus:border-primary'

interface DateRangeProps {
  from: string
  to: string
  onFrom: (v: string) => void
  onTo: (v: string) => void
}

export function DateRange({ from, to, onFrom, onTo }: DateRangeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <input type="date" value={from} max={to || undefined} onChange={(e) => onFrom(e.target.value)} className={fieldClass} aria-label="From date" />
      <span className="text-[12px] text-muted">to</span>
      <input type="date" value={to} min={from || undefined} onChange={(e) => onTo(e.target.value)} className={fieldClass} aria-label="To date" />
    </div>
  )
}

interface FilterSelectProps {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  ariaLabel?: string
}

export function FilterSelect({ value, onChange, options, ariaLabel }: FilterSelectProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} aria-label={ariaLabel}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
