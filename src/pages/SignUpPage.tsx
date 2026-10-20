import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { GoogleButton, EmailDivider } from '@/components/shared/GoogleButton'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { authUnavailable } from '@/lib/auth/mockAuth'
import { safeDestination } from '@/lib/auth/permissions'
export function SignUpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, mockEnabled } = useAuth()
  const submitting = useRef(false)
  const [busy, setBusy] = useState(false)
  const [values, setValues] = useState({ email: '', password: '', confirm: '', terms: true })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = 'Enter a valid email address.'
    if (values.password.length < 8 || !/\d/.test(values.password))
      next.password = 'Use at least 8 characters, including one digit.'
    if (!values.confirm || values.confirm !== values.password)
      next.confirm = 'Passwords must match.'
    if (!values.terms) next.terms = 'You must agree to continue.'
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
      await register(values.email, values.password)
      setValues((v) => ({ ...v, password: '', confirm: '' }))
      navigate(safeDestination(location.state?.from) ?? '/account-activated', { replace: true })
    } catch (error) {
      setErrors({
        email: error instanceof Error ? error.message : 'Unable to create a temporary account.',
      })
      requestAnimationFrame(() =>
        document.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()
      )
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }
  return (
    <AuthLayout mode="signup">
      <form noValidate onSubmit={submit} className="card auth-card">
        <div className="flex flex-col gap-1">
          <h1 className="heading">Create your account</h1>
          <p className="text-muted">Join the community in under a minute.</p>
        </div>
        <GoogleButton
          onClick={() =>
            setNotice('Google sign-in is not connected. No authentication request was sent.')
          }
        >
          Sign up with Google
        </GoogleButton>
        <EmailDivider />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@example.com"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={values.password}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
          error={errors.password}
          helperText="At least 8 characters, including one digit"
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={values.confirm}
          onChange={(e) => setValues({ ...values, confirm: e.target.value })}
          error={errors.confirm}
        />
        <div>
          <label className="flex items-center gap-[10px] text-[14px] leading-[1.55]">
            <input
              type="checkbox"
              className="checkbox"
              checked={values.terms}
              aria-invalid={!!errors.terms}
              onChange={(e) => setValues({ ...values, terms: e.target.checked })}
              aria-describedby={errors.terms ? 'terms-error' : undefined}
            />
            I agree to the Terms of Use and Privacy Policy
          </label>
          {errors.terms && (
            <p id="terms-error" className="caption text-error-text">
              {errors.terms}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={busy || !mockEnabled} aria-busy={busy}>
          Sign up
        </Button>
        <div className="flex flex-wrap justify-center gap-[6px]">
          <span className="text-muted">Already have an account?</span>
          <Link className="text-link" to="/signin" state={location.state}>
            Sign in
          </Link>
        </div>
        <p className="caption text-muted">
          {mockEnabled
            ? 'Temporary demo account only — lost on reload. No server account is created. Use test data; no password is saved to browser storage.'
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
