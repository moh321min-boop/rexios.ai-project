import { t, useI18n } from '@/i18n'
import type { ReactNode } from 'react'
import { RexiosLogo } from '@/components/shared/RexiosLogo'
import { LanguageSwitch } from '@/components/shared/LanguageSwitch'
import { authArtwork } from '@/data/authArtwork'
export function AuthLayout({ children, mode }: { children: ReactNode; mode: 'signup' | 'signin' }) {
  useI18n()
  return (
    <main className="auth-layout">
      <aside className="auth-art" aria-label={t('authLayout.rexios_ai_community')}>
        <div className="auth-pixels" aria-hidden="true">
          {authArtwork[mode].map(([x, y, size, lime], i) => (
            <span
              key={i}
              style={{
                left: `${(x / 560) * 100}%`,
                top: `${(y / 1040) * 100}%`,
                width: size,
                height: size,
                background: lime ? 'var(--color-accent)' : '#1b3fc4',
              }}
            />
          ))}
        </div>
        <RexiosLogo variant="light" className="auth-logo" />
        <div className="auth-mobile-language">
          <LanguageSwitch />
        </div>
        <div className="auth-illustration">
          <img
            src="/figma/e5844.svg"
            alt={t('authLayout.rexios_ai_pixel_dinosaur')}
            width="360"
            height="270"
            className="auth-mascot"
          />
        </div>
        <div className="auth-panel-copy">
          <h2 className="heading">
            {mode === 'signup'
              ? t('authLayout.join_the_community_of_technologists')
              : t('authLayout.welcome_back_to_the_community')}
          </h2>
          <p>{t('authLayout.ask_answer_and_learn_from_real_problems')}</p>
        </div>
      </aside>
      <section
        className="auth-form-area"
        aria-label={mode === 'signup' ? t('signUp.sign_up') : t('signIn.sign_in')}
      >
        <div className="auth-language">
          <LanguageSwitch />
        </div>
        {children}
      </section>
    </main>
  )
}
