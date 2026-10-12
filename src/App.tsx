import { useState } from 'react'
import type { FormEvent } from 'react'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import { clearSession, loadSession, loginWithGoogle, loginWithPassword } from './lib/auth'
import type { Session } from './lib/auth'
import './App.css'

function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession())
  const [error, setError] = useState<string | null>(null)

  const handleCredential = async (credential?: string) => {
    setError(null)
    if (!credential) {
      setError('Google did not return a credential. Please try again.')
      return
    }
    try {
      setSession(await loginWithGoogle(credential))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed')
    }
  }

  const handlePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      setSession(await loginWithPassword(String(form.get('email')), String(form.get('password'))))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    }
  }

  const signOut = () => {
    googleLogout()
    clearSession()
    setSession(null)
  }

  if (session) {
    const { user } = session
    return (
      <main className="auth-card">
        {user.avatar_url && <img className="avatar" src={user.avatar_url} alt="" referrerPolicy="no-referrer" />}
        <h1>
          {user.first_name} {user.last_name}
        </h1>
        <p>{user.email}</p>
        <p className="role">{user.role.replace(/_/g, ' ')}</p>
        <button onClick={signOut}>Sign out</button>
      </main>
    )
  }

  return (
    <main className="auth-card">
      <h1>AU Transport Dispatching</h1>
      <p>Staff: sign in with your African Union Google account.</p>
      <GoogleLogin
        onSuccess={(res) => handleCredential(res.credential)}
        onError={() => setError('Google sign-in was cancelled or failed.')}
        useOneTap={false}
      />
      <p className="divider">Approvers, dispatchers and drivers</p>
      <form className="password-form" onSubmit={handlePassword}>
        <input name="email" type="email" placeholder="Email" autoComplete="username" required />
        <input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
        <button type="submit">Sign in</button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </main>
  )
}

export default App
