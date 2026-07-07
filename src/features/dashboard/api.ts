import { http } from '@/api/http'
import type { Patient } from '@/features/patients/types'

export interface RecentSession {
  id: string
  patient_id: string
  procedure_type: string | null
  status: string
  created_at: string
}

export interface RecentReport {
  id: string
  scribe_session_id: string
  grounding_source: string
  created_at: string
}

export interface DashboardSummary {
  total_patients: number
  new_patients_this_month: number
  sessions_this_week: number
  reports_generated: number
  avg_visit_minutes: number | null
  recent_patients: Patient[]
  recent_sessions: RecentSession[]
  recent_reports: RecentReport[]
  sessions_trend: unknown[]
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return http.get<DashboardSummary>('/dashboard/summary')
}
