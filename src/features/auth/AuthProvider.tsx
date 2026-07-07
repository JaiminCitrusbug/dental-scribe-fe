import { useQueryClient } from '@tanstack/react-query'
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { bootstrapAuth, clearTokens, hasStoredSession, setTokens } from '@/api/http'
import { fetchMe, login as apiLogin, registerClinic } from './api'
import type { Clinic, RegisterPayload } from './types'

type AuthStatus = 'loading' | 'guest' | 'authed'

interface AuthContextValue {
  clinic: Clinic | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  updateClinic: (clinic: Clinic) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  // If a refresh token is stored, start in 'loading' and silently re-authenticate.
  const [status, setStatus] = useState<AuthStatus>(hasStoredSession() ? 'loading' : 'guest')

  useEffect(() => {
    if (!hasStoredSession()) return
    let active = true
    bootstrapAuth().then(async (ok) => {
      if (!active) return
      if (ok) {
        try {
          const me = await fetchMe()
          setClinic(me)
          setStatus('authed')
        } catch {
          clearTokens()
          setStatus('guest')
        }
      } else {
        setStatus('guest')
      }
    })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      // Drop any previous account's cached queries before loading the new one.
      queryClient.clear()
      const tokens = await apiLogin(email, password)
      setTokens(tokens.access_token, tokens.refresh_token)
      const me = await fetchMe()
      setClinic(me)
      setStatus('authed')
    },
    [queryClient],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerClinic(payload)
      await login(payload.email, payload.password)
    },
    [login],
  )

  const logout = useCallback(() => {
    clearTokens()
    setClinic(null)
    setStatus('guest')
    // Wipe cached queries so the next account never sees stale data.
    queryClient.clear()
  }, [queryClient])

  const updateClinic = useCallback((next: Clinic) => setClinic(next), [])

  const value = useMemo<AuthContextValue>(
    () => ({ clinic, status, login, register, logout, updateClinic }),
    [clinic, status, login, register, logout, updateClinic],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
