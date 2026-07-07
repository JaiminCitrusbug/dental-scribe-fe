/** Derive up-to-two-letter initials from a name (e.g. "Dr. Sarah Mitchell" -> "SM"). */
export function initials(name: string): string {
  const parts = name
    .replace(/\b(dr|dr\.|mr|mrs|ms|prof)\b\.?/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
