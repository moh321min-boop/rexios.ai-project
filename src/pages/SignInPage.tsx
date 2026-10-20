import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { GoogleButton, EmailDivider } from '@/components/shared/GoogleButton'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { authUnavailable } from '@/lib/auth/mockAuth'
import { homeFor, safeDestination } from '@/lib/auth/permissions'
export function SignInPage() {
  const navigate = useNavigate()
  const { login, mockEnabled } = useAuth()
  const location = useLocation()
  const submitting = useRef(false)
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        document.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()
      )
      return
    }
    if (submitting.current) return
    submitting.current = true
    setBusy(true)
    setNotice('')
    try {
      const user = await login(email, password)
      setPassword('')
      navigate(safeDestination(location.state?.from) ?? homeFor(user), { replace: true })
    } catch (error) {
      setErrors({ password: error instanceof Error ? error.message : 'Unable to sign in.' })
      requestAnimationFrame(() =>
        document.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()
      )
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }
  return (
    <AuthLayout mode="signin">
      <form noValidate onSubmit={submit} className="card auth-card">
        <div className="flex flex-col gap-1">
          <h1 className="heading">Sign in</h1>
          <p className="text-muted">Sign in to join the discussions.</p>
        </div>
        <GoogleButton
          onClick={() =>
            setNotice('Google sign-in is not connected. No authentication request was sent.')
          }
        >
          Continue with Google
        </GoogleButton>
        <EmailDivider />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="text-link !text-[13px]"
            onClick={() =>
              setNotice('Password recovery is not connected. No reset email was sent.')
            }
          >
            Forgot your password?
          </button>
        </div>
        <Button type="submit" className="w-full" disabled={busy || !mockEnabled} aria-busy={busy}>
          Sign in
        </Button>
        <div className="flex flex-wrap justify-center gap-[6px]">
          <span className="text-muted">Don't have an account?</span>
          <Link className="text-link" to="/signup" state={location.state}>
            Create an account
          </Link>
        </div>
        <p className="caption text-muted">
          {mockEnabled
            ? 'Demo accounts only — no secure or real authentication. Use the test credentials documented in README.'
            : authUnavailable}
        </p>
        {notice && (
          <p role="status" className="border-subtle bg-brand-soft rounded border-2 p-3 text-sm">
            {notice}
          </p>
        )}
      </form>
    </AuthLayout>
  )
}
