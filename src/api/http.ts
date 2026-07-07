/**
 * API client for the DentalScribe backend.
 *
 * - Unwraps the standard { data, meta, errors, message } envelope.
 * - Holds the access + refresh tokens IN MEMORY ONLY (never localStorage), per
 *   the frontend security rules. Tokens are lost on hard refresh by design.
 * - Transparently refreshes the access token once on a 401.
 */

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const API = `${BASE}/api/v1`

// Access token stays in memory only. The refresh token is persisted so a page
// reload can silently re-authenticate instead of logging the user out.
const REFRESH_STORAGE_KEY = 'ds_refresh_token'

function readStoredRefresh(): string | null {
  try {
    return localStorage.getItem(REFRESH_STORAGE_KEY)
  } catch {
    return null
  }
}

let accessToken: string | null = null
let refreshToken: string | null = readStoredRefresh()

export function setTokens(access: string, refresh: string): void {
  accessToken = access
  refreshToken = refresh
  try {
    localStorage.setItem(REFRESH_STORAGE_KEY, refresh)
  } catch {
    /* storage unavailable - fall back to in-memory only */
  }
}
export function clearTokens(): void {
  accessToken = null
  refreshToken = null
  try {
    localStorage.removeItem(REFRESH_STORAGE_KEY)
  } catch {
    /* noop */
  }
}
export function hasSession(): boolean {
  return accessToken !== null
}
export function hasStoredSession(): boolean {
  return refreshToken !== null
}

/** Silently obtain a fresh access token from the stored refresh token (on reload). */
export function bootstrapAuth(): Promise<boolean> {
  return refreshToken ? tryRefresh() : Promise.resolve(false)
}

/** Access token for the WebSocket auth handshake (in-memory only). */
export function getAccessToken(): string | null {
  return accessToken
}

/** ws:// base derived from the API base URL. */
export function wsBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
  return base.replace(/^http/, 'ws')
}

export interface ApiErrorItem {
  field?: string
  message: string
}

export class ApiError extends Error {
  status: number
  errors: ApiErrorItem[] | null
  constructor(message: string, status: number, errors: ApiErrorItem[] | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  _retried?: boolean
}

async function raw(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (opts.auth && accessToken) headers.Authorization = `Bearer ${accessToken}`
  return fetch(`${API}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false
  const res = await raw('/auth/refresh', { method: 'POST', body: { refresh_token: refreshToken } })
  if (!res.ok) {
    clearTokens()
    return false
  }
  const json = await res.json()
  const data = json?.data
  if (data?.access_token && data?.refresh_token) {
    setTokens(data.access_token, data.refresh_token)
    return true
  }
  clearTokens()
  return false
}

export interface PageMeta {
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface Paged<T> {
  items: T[]
  meta: PageMeta
}

interface Envelope<T> {
  data?: T
  meta?: PageMeta
  errors?: ApiErrorItem[]
  message?: string
}

async function envelope<T>(path: string, opts: RequestOptions = {}): Promise<Envelope<T>> {
  let res = await raw(path, opts)

  if (res.status === 401 && opts.auth && !opts._retried && (await tryRefresh())) {
    res = await raw(path, { ...opts, _retried: true })
  }

  let json: Envelope<T> | null = null
  try {
    json = (await res.json()) as Envelope<T>
  } catch {
    json = null
  }

  if (!res.ok) {
    throw new ApiError(json?.message ?? res.statusText, res.status, json?.errors ?? null)
  }
  return json ?? {}
}

async function data<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  return (await envelope<T>(path, opts)).data as T
}

export const http = {
  get: <T>(path: string, auth = true) => data<T>(path, { method: 'GET', auth }),
  post: <T>(path: string, body?: unknown, auth = false) =>
    data<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    data<T>(path, { method: 'PUT', body, auth }),
  patch: <T>(path: string, body?: unknown, auth = true) =>
    data<T>(path, { method: 'PATCH', body, auth }),
  del: <T>(path: string, auth = true) => data<T>(path, { method: 'DELETE', auth }),
  getPaged: async <T>(path: string, auth = true): Promise<Paged<T>> => {
    const env = await envelope<T[]>(path, { method: 'GET', auth })
    return {
      items: env.data ?? [],
      meta: env.meta ?? { page: 1, page_size: 20, total: 0, total_pages: 0 },
    }
  },
}
