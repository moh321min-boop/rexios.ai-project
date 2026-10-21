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
import { safeDestination } from '@/lib/auth/permissions'
export function SignUpPage() {
  useI18n()
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
      next.email = 'signIn.enter_a_valid_email_address'
    if (values.password.length < 8 || !/\d/.test(values.password))
      next.password = 'signUp.use_at_least_8_characters_including_one'
    if (!values.confirm || values.confirm !== values.password)
      next.confirm = 'signUp.passwords_must_match'
    if (!values.terms) next.terms = 'signUp.you_must_agree_to_continue'
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
        email:
          error instanceof Error ? error.message : 'signUp.unable_to_create_a_temporary_account',
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
          <h1 className="heading">{t('signUp.create_your_account')}</h1>
          <p className="text-muted">{t('signUp.join_the_community_in_under_a_minute')}</p>
        </div>
        <GoogleButton onClick={() => setNotice('signIn.google_sign_in_is_not_connected_no')}>
          {t('signUp.sign_up_with_google')}
        </GoogleButton>
        <EmailDivider />
        <Input
          label={t('signIn.email')}
          type="email"
          autoComplete="email"
          required
          placeholder="name@example.com"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          error={errors.email}
        />
        <Input
          label={t('signIn.password')}
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={values.password}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
          error={errors.password}
          helperText={t('signUp.at_least_8_characters_including_one_digit')}
        />
        <Input
          label={t('signUp.confirm_password')}
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
            {t('signUp.i_agree_to_the_terms_of_use')}
          </label>
          {errors.terms && (
            <p id="terms-error" className="caption text-error-text">
              {t(errors.terms)}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={busy || !mockEnabled} aria-busy={busy}>
          {t('signUp.sign_up')}
        </Button>
        <div className="flex flex-wrap justify-center gap-[6px]">
          <span className="text-muted">{t('signUp.already_have_an_account')}</span>
          <Link className="text-link" to="/signin" state={location.state}>
            {t('signIn.sign_in')}
          </Link>
        </div>
        <p className="caption text-muted">
          {mockEnabled
            ? t('signUp.temporary_demo_account_only_lost_on_reload')
            : t(authUnavailable)}
        </p>
        {notice && <Notice onDismiss={() => setNotice('')}>{notice}</Notice>}
      </form>
    </AuthLayout>
  )
}
