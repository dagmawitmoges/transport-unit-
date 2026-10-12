const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const SESSION_KEY = 'au-transport-session'

export interface AuthUser {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  avatar_url: string | null
  department: string | null
  telephone_extension: string | null
}

export interface Session {
  access_token: string
  refresh_token: string
  user: AuthUser
}

/** Staff sign in with Google. */
export function loginWithGoogle(credential: string): Promise<Session> {
  return postSession('/api/v1/auth/google', { credential })
}

/** Approvers, dispatchers, drivers and admins sign in with email + password. */
export function loginWithPassword(email: string, password: string): Promise<Session> {
  return postSession('/api/v1/auth/login', { email, password })
}

async function postSession(path: string, auth: Record<string, string>): Promise<Session> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auth }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.error ?? `Sign-in failed (${res.status})`)
  }
  const session: Session = body.data
  saveSession(session)
  return session
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function saveSession(session: Session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Storage unavailable (private mode); session lasts until reload.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}

/** Authorization header for calls to the API once signed in. */
export function authHeaders(session: Session): HeadersInit {
  return { Authorization: `Bearer ${session.access_token}` }
}
