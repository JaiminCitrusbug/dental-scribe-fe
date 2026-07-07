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

// Access token is kept in memory only. The refresh token lives in an httpOnly
// cookie set by the backend (invisible to JS), so a reload silently
// re-authenticates via /auth/refresh (the cookie rides along with credentials).
let accessToken: string | null = null

export function setAccessToken(access: string): void {
  accessToken = access
}
export function clearTokens(): void {
  accessToken = null
}
export function hasSession(): boolean {
  return accessToken !== null
}

/** Silently obtain a fresh access token from the refresh cookie (on reload). */
export function bootstrapAuth(): Promise<boolean> {
  return tryRefresh()
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
    // Send/receive the httpOnly refresh cookie on auth calls.
    credentials: 'include',
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
}

async function tryRefresh(): Promise<boolean> {
  const res = await raw('/auth/refresh', { method: 'POST' })
  if (!res.ok) {
    clearTokens()
    return false
  }
  const json = await res.json()
  const access = json?.data?.access_token
  if (access) {
    setAccessToken(access)
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
