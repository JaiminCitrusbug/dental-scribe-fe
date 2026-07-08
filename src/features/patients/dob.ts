// Date-of-birth validation for the native date picker (value is ISO YYYY-MM-DD).
// The picker enforces a valid calendar date and format; we add the no-future rule.

export interface DobResult {
  ok: boolean
  error?: string
}

/** Today's date as YYYY-MM-DD, for the date input's `max` attribute. */
export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Validate an ISO (YYYY-MM-DD) date of birth. Empty is allowed (DOB is optional). */
export function validateDob(iso: string): DobResult {
  const v = (iso ?? '').trim()
  if (!v) return { ok: true }

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  if (!m) return { ok: false, error: 'Invalid date' }

  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])

  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return { ok: false, error: 'Not a real date' }
  }
  if (year < 1900) return { ok: false, error: 'Year must be 1900 or later' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (d > today) return { ok: false, error: 'Date cannot be in the future' }

  return { ok: true }
}
