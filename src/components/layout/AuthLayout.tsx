import type { ReactNode } from 'react'
import { RexiosLogo } from '@/components/shared/RexiosLogo'
import { LanguageSwitch } from '@/components/shared/LanguageSwitch'
import { authArtwork } from '@/data/authArtwork'
export function AuthLayout({ children, mode }: { children: ReactNode; mode: 'signup' | 'signin' }) {
  return (
    <main className="auth-layout">
      <aside className="auth-art" aria-label="Rexios AI community">
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
            alt="Rexios AI pixel dinosaur"
            width="360"
            height="270"
            className="auth-mascot"
          />
        </div>
        <div className="auth-panel-copy">
          <h2 className="heading">
            {mode === 'signup'
              ? 'Join the community of technologists'
              : 'Welcome back to the community'}
          </h2>
          <p>Ask, answer and learn from real problems your peers face.</p>
        </div>
      </aside>
      <section className="auth-form-area" aria-label={mode === 'signup' ? 'Sign up' : 'Sign in'}>
        <div className="auth-language">
          <LanguageSwitch />
        </div>
        {children}
      </section>
    </main>
  )
}
