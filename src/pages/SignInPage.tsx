import { Notice } from '@/components/shared/Notice'
import { t, useI18n } from '@/i18n'
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
  useI18n()
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'signIn.enter_a_valid_email_address'
    if (!password) next.password = 'signIn.enter_your_password'
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
      setErrors({ password: error instanceof Error ? error.message : 'signIn.unable_to_sign_in' })
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
          <h1 className="heading">{t('signIn.sign_in')}</h1>
          <p className="text-muted">{t('signIn.sign_in_to_join_the_discussions')}</p>
        </div>
        <GoogleButton onClick={() => setNotice('signIn.google_sign_in_is_not_connected_no')}>
          {t('signIn.continue_with_google')}
        </GoogleButton>
        <EmailDivider />
        <Input
          label={t('signIn.email')}
          type="email"
          autoComplete="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label={t('signIn.password')}
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
            onClick={() => setNotice('signIn.password_recovery_is_not_connected_no_reset')}
          >
            {t('signIn.forgot_your_password')}
          </button>
        </div>
        <Button type="submit" className="w-full" disabled={busy || !mockEnabled} aria-busy={busy}>
          {t('signIn.sign_in')}
        </Button>
        <div className="flex flex-wrap justify-center gap-[6px]">
          <span className="text-muted">{t('signIn.don_t_have_an_account')}</span>
          <Link className="text-link" to="/signup" state={location.state}>
            {t('signIn.create_an_account')}
          </Link>
        </div>
        <p className="caption text-muted">
          {mockEnabled ? t('signIn.demo_accounts_only_no_secure_or_real') : t(authUnavailable)}
        </p>
        {notice && <Notice onDismiss={() => setNotice('')}>{notice}</Notice>}
      </form>
    </AuthLayout>
  )
}
