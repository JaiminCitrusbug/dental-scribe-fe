import { http } from '@/api/http'
import type { Clinic, RegisterPayload, TokenPair } from './types'

export function registerClinic(payload: RegisterPayload): Promise<Clinic> {
  return http.post<Clinic>('/auth/register', payload)
}

export function login(email: string, password: string): Promise<TokenPair> {
  return http.post<TokenPair>('/auth/login', { email, password })
}

export function fetchMe(): Promise<Clinic> {
  return http.get<Clinic>('/auth/me')
}

export function forgotPassword(email: string): Promise<null> {
  return http.post<null>('/auth/forgot-password', { email })
}
