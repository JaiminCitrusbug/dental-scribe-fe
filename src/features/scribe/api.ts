import { http, type Paged } from '@/api/http'
import type { ScribeSession, SessionStartInput } from './types'

export function startSession(input: SessionStartInput): Promise<ScribeSession> {
  return http.post<ScribeSession>('/scribe/sessions', input, true)
}

export function getSession(id: string): Promise<ScribeSession> {
  return http.get<ScribeSession>(`/scribe/sessions/${id}`)
}

export function finishSession(id: string): Promise<ScribeSession> {
  return http.post<ScribeSession>(`/scribe/sessions/${id}/finish`, undefined, true)
}

export function deleteSession(id: string): Promise<null> {
  return http.del<null>(`/scribe/sessions/${id}`)
}

interface SessionListParams {
  page?: number
  pageSize?: number
  patientId?: string
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
  status?: string
  dateFrom?: string
  dateTo?: string
}

export function listSessions({
  page = 1,
  pageSize = 10,
  patientId,
  search,
  sortBy = 'created_at',
  order = 'desc',
  status,
  dateFrom,
  dateTo,
}: SessionListParams = {}): Promise<Paged<ScribeSession>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: sortBy,
    order,
  })
  if (patientId) params.set('patient_id', patientId)
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo) params.set('date_to', dateTo)
  return http.getPaged<ScribeSession>(`/scribe/sessions?${params.toString()}`)
}
