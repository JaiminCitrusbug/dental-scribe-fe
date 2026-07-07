import { http } from '@/api/http'
import type { Clinic } from '@/features/auth/types'

export function updateProfile(clinic_name: string, contact_name: string): Promise<Clinic> {
  return http.patch<Clinic>('/auth/profile', { clinic_name, contact_name })
}

export function changePassword(current_password: string, password: string): Promise<null> {
  return http.post<null>('/auth/change-password', { current_password, password }, true)
}
