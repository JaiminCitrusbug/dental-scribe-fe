export interface ReportContent {
  chief_concern: string | null
  assessment: string | null
  treatment: string | null
  precautions: string[]
  recommendations: string[]
  offerings: string[]
  follow_up: string | null
  warning_signs: string[]
  citations: string[]
}

export interface Report {
  id: string
  scribe_session_id: string
  status: string
  grounding_source: 'kb' | 'llm_fallback' | 'insufficient'
  content: ReportContent | null
  max_similarity: number | null
  disclaimer: string | null
  created_at: string
  summary?: string | null
  patient_name?: string | null
  procedure_type?: string | null
}

export interface ShareResult {
  token: string
  url: string
  expires_at: string
}

export interface PublicReport {
  clinic_name: string | null
  patient_first_name: string | null
  procedure_type: string | null
  grounding_source: 'kb' | 'llm_fallback' | 'insufficient'
  summary: string | null
  content: ReportContent | null
  disclaimer: string | null
  generated_at: string
}
