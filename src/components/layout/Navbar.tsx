import { t, useI18n } from '@/i18n'
import { startTransition, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { RexiosLogo } from '@/components/shared/RexiosLogo'
import { LanguageSwitch } from '@/components/shared/LanguageSwitch'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { useAuth } from '@/context/AuthContext'
import { Notice } from '@/components/shared/Notice'

export function Navbar() {
  useI18n()
  const { user, isAuthenticated, logout, permissions, sessionNotice } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [openRoute, setOpenRoute] = useState<string | null>(null)
  const [accountRoute, setAccountRoute] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const toggle = useRef<HTMLButtonElement>(null)
  const account = useRef<HTMLButtonElement>(null)
  const open = openRoute === location.key
  const accountOpen = accountRoute === location.key
  const close = () => {
    setOpenRoute(null)
    setAccountRoute(null)
  }
  useEffect(() => {
    const breakpoint = window.matchMedia('(min-width: 1024px)')
    const resize = () => {
      setOpenRoute(null)
      setAccountRoute(null)
    }
    breakpoint.addEventListener('change', resize)
    return () => breakpoint.removeEventListener('change', resize)
  }, [])
  function go(path: string) {
    close()
    navigate(
      path,
      path === '/signin' || path === '/signup'
        ? { state: { from: location.pathname + location.search } }
        : undefined
    )
  }
  function inform(message: string) {
    close()
    setNotice(message)
  }
  return (
    <header
      className="site-navbar"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && (open || accountOpen)) {
          event.preventDefault()
          close()
          ;(open ? toggle : account).current?.focus()
        }
      }}
    >
      <div className="navbar-row">
        <div onClick={close}>
          <RexiosLogo className="text-primary navbar-logo" />
        </div>
        <button
          ref={toggle}
          type="button"
          className="navbar-toggle"
          aria-label={open ? t('navbar.close_navigation_menu') : t('navbar.open_navigation_menu')}
          aria-expanded={open}
          aria-controls="application-navigation"
          onClick={() => {
            setOpenRoute(open ? null : location.key)
            setAccountRoute(null)
          }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div id="application-navigation" className={`navbar-menu ${open ? 'is-open' : ''}`}>
          <nav className="navbar-links" aria-label={t('navbar.main_navigation')}>
            <NavLink to="/" end onClick={close}>
              {t('navbar.home')}
            </NavLink>
            <NavLink to="/community" onClick={close}>
              {t('communityFeed.community')}
            </NavLink>
            <NavLink to="/problems" onClick={close}>
              {t('problems.problems')}
            </NavLink>
            <button type="button" onClick={() => inform('The About page is not implemented yet.')}>
              {t('navbar.about')}
            </button>
          </nav>
          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                <Button variant="accent" size="sm" onClick={() => go('/community/ask')}>
                  {t('askQuestion.ask_a_question')}
                </Button>
                <button
                  type="button"
                  className="notification-button"
                  aria-label={t('navbar.notifications')}
                  onClick={() => inform('Notifications are not connected in this preview.')}
                >
                  <FigmaIcon asset="228fd" size={22} />
                </button>
                <div className="account-container">
                  <button
                    ref={account}
                    type="button"
                    className="account-toggle"
                    aria-label={t('navbar.account_menu')}
                    aria-expanded={accountOpen}
                    aria-controls="account-links"
                    onClick={() => setAccountRoute(accountOpen ? null : location.key)}
                  >
                    <Avatar name={user?.displayName ?? 'Sara Kasmi'} />
                  </button>
                  <div
                    id="account-links"
                    className={`account-links ${accountOpen ? 'is-open' : ''}`}
                  >
                    <p className="caption text-muted">
                      {t('navbar.demo_account')} {user?.displayName}
                    </p>
                    {sessionNotice && <p className="caption text-muted">{t(sessionNotice)}</p>}
                    {permissions.canEditSolverProfile && (
                      <Link to={'/profile-setup'} onClick={close}>
                        {t('profileSetup.solver_profile')}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        // Keep session and route changes together so a protected page cannot
                        // enqueue its sign-in redirect between logout and navigation.
                        startTransition(() => {
                          logout()
                          go('/community')
                        })
                      }}
                    >
                      {t('navbar.sign_out')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => go('/signin')}>
                  {t('signIn.sign_in')}
                </Button>
                <Button size="sm" onClick={() => go('/signup')}>
                  {t('signUp.sign_up')}
                </Button>
              </>
            )}
            <LanguageSwitch />
          </div>
        </div>
      </div>
      {notice && (
        <Notice className="navbar-notice" onDismiss={() => setNotice('')}>
          {notice}
        </Notice>
      )}
    </header>
  )
}
