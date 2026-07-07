import type { Accent } from '@/lib/accent'

/** Procedure options - value matches the KB procedure slugs for grounded reports. */
export const PROCEDURES: { value: string; label: string }[] = [
  { value: 'root_canal', label: 'Root Canal' },
  { value: 'tooth_extraction', label: 'Tooth Extraction' },
  { value: 'wisdom_tooth_removal', label: 'Wisdom Tooth Removal' },
  { value: 'dental_cleaning', label: 'Dental Cleaning / Scaling' },
  { value: 'crown_bridge', label: 'Crown / Bridge' },
  { value: 'filling_composite', label: 'Filling / Composite' },
  { value: 'dental_implant', label: 'Dental Implant' },
  { value: 'teeth_whitening', label: 'Teeth Whitening' },
  { value: 'braces_orthodontic', label: 'Braces / Orthodontic' },
  { value: 'periodontal_treatment', label: 'Periodontal / Gum Treatment' },
  { value: 'dentures', label: 'Dentures' },
  { value: 'sutures_stitches', label: 'Sutures / Stitches' },
  { value: 'general', label: 'General / Other' },
]

/** Display an inferred procedure/topic string. Inferred values are free-text
 * (e.g. "Root Canal, Cavities"); known slugs map to a friendly label. */
export function procedureLabel(value: string | null | undefined): string {
  if (!value) return '-'
  return PROCEDURES.find((p) => p.value === value)?.label ?? value
}

const SESSION_STATUS: Record<string, { label: string; tone: Accent }> = {
  recording: { label: 'Recording', tone: 'sky' },
  transcribing: { label: 'Transcribing', tone: 'sky' },
  processing: { label: 'Processing', tone: 'violet' },
  completed: { label: 'Completed', tone: 'mint' },
  failed: { label: 'Failed', tone: 'rose' },
}

export function sessionStatus(status: string): { label: string; tone: Accent } {
  return SESSION_STATUS[status] ?? { label: status, tone: 'amber' }
}
