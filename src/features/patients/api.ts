import { http, type Paged } from '@/api/http'
import type { Patient, PatientInput } from './types'

interface ListParams {
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

export function listPatients({
  search,
  page = 1,
  pageSize = 10,
  sortBy = 'created_at',
  order = 'desc',
  dateFrom,
  dateTo,
}: ListParams): Promise<Paged<Patient>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: sortBy,
    order,
  })
  if (search) params.set('search', search)
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo) params.set('date_to', dateTo)
  return http.getPaged<Patient>(`/patients?${params.toString()}`)
}

export function getPatient(id: string): Promise<Patient> {
  return http.get<Patient>(`/patients/${id}`)
}

export function createPatient(input: PatientInput): Promise<Patient> {
  return http.post<Patient>('/patients', input, true)
}

export function updatePatient(id: string, input: PatientInput): Promise<Patient> {
  return http.put<Patient>(`/patients/${id}`, input)
}

export function deletePatient(id: string): Promise<null> {
  return http.del<null>(`/patients/${id}`)
}
