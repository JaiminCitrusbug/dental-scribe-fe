/** Soft-pastel accent tones used across stat tiles, badges, avatars, icons. */
export type Accent = 'mint' | 'sky' | 'amber' | 'rose' | 'violet'

/** Full literal class strings so Tailwind's scanner picks them up. */
export const accentSurface: Record<Accent, string> = {
  mint: 'bg-mint text-mint-ink',
  sky: 'bg-sky text-sky-ink',
  amber: 'bg-amber text-amber-ink',
  rose: 'bg-rose text-rose-ink',
  violet: 'bg-violet text-violet-ink',
}

const ORDER: Accent[] = ['sky', 'mint', 'amber', 'violet', 'rose']

/** Deterministically pick an accent from a string key (e.g. a patient id/name). */
export function accentForKey(key: string): Accent {
  let sum = 0
  for (let i = 0; i < key.length; i++) sum = (sum + key.charCodeAt(i)) % 997
  return ORDER[sum % ORDER.length]
}
