import type { PatientInput } from '@/features/patients/types'

export interface TranscriptSegment {
  id: string
  sequence_index: number
  speaker_label: string | null
  content: string
  start_time: number | null
  end_time: number | null
}

export interface ScribeSession {
  id: string
  patient_id: string
  patient_name?: string | null
  procedure_type: string | null
  title: string | null
  status: string
  transcript_text: string | null
  duration_seconds: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  segments?: TranscriptSegment[]
  audio_parts?: { index: number; url: string }[]
}

export interface SessionStartInput {
  patient_id?: string
  new_patient?: PatientInput
  title?: string | null
}
