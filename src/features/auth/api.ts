import { http } from '@/api/http'
import type { Clinic, RegisterPayload } from './types'

interface AccessTokenResponse {
  access_token: string
  token_type?: string
}

export function registerClinic(payload: RegisterPayload): Promise<Clinic> {
  return http.post<Clinic>('/auth/register', payload)
}

export function login(email: string, password: string): Promise<AccessTokenResponse> {
  return http.post<AccessTokenResponse>('/auth/login', { email, password })
}

export function logout(): Promise<null> {
  // Revokes the refresh token + clears the httpOnly cookie server-side.
  return http.post<null>('/auth/logout', undefined, false)
}

export function fetchMe(): Promise<Clinic> {
  return http.get<Clinic>('/auth/me')
}

export function forgotPassword(email: string): Promise<null> {
  return http.post<null>('/auth/forgot-password', { email })
}
