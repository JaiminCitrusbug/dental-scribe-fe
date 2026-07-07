import { http, type Paged } from '@/api/http'
import type { PublicReport, Report, ShareResult } from './types'

export function generateReport(sessionId: string): Promise<Report> {
  return http.post<Report>(`/reports/sessions/${sessionId}/generate`, undefined, true)
}

export function regenerateSummary(sessionId: string): Promise<Report> {
  return http.post<Report>(`/reports/sessions/${sessionId}/regenerate-summary`, undefined, true)
}

export function regenerateCareReport(sessionId: string): Promise<Report> {
  return http.post<Report>(`/reports/sessions/${sessionId}/regenerate-care-report`, undefined, true)
}

export function getSessionReport(sessionId: string): Promise<Report> {
  return http.get<Report>(`/reports/sessions/${sessionId}`)
}

interface ReportListParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

export function listReports({
  page = 1,
  pageSize = 10,
  search,
  sortBy = 'created_at',
  order = 'desc',
  dateFrom,
  dateTo,
}: ReportListParams = {}): Promise<Paged<Report>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: sortBy,
    order,
  })
  if (search) params.set('search', search)
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo) params.set('date_to', dateTo)
  return http.getPaged<Report>(`/reports?${params.toString()}`)
}

export function shareReport(reportId: string): Promise<ShareResult> {
  return http.post<ShareResult>(`/reports/${reportId}/share`, undefined, true)
}

export function getPublicReport(token: string): Promise<PublicReport> {
  // Public endpoint - no auth header needed.
  return http.get<PublicReport>(`/shared/${token}`, false)
}
