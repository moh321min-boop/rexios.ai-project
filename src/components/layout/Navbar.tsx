import { startTransition, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { RexiosLogo } from '@/components/shared/RexiosLogo'
import { LanguageSwitch } from '@/components/shared/LanguageSwitch'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
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
      className={`site-navbar ${location.pathname.startsWith('/problems') ? 'problems-navbar' : ''}`}
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
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
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
          <nav className="navbar-links" aria-label="Main navigation">
            <Link to="/" onClick={close}>
              Home
            </Link>
            <Link
              to={'/community'}
              onClick={close}
              aria-current={location.pathname.startsWith('/community') ? 'page' : undefined}
            >
              Community
            </Link>
            <Link
              to={'/problems'}
              onClick={close}
              aria-current={location.pathname.startsWith('/problems') ? 'page' : undefined}
            >
              Problems
            </Link>
            <button type="button" onClick={() => inform('The About page is not implemented yet.')}>
              About
            </button>
          </nav>
          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                <Button variant="accent" size="sm" onClick={() => go('/community/ask')}>
                  Ask a question
                </Button>
                <button
                  type="button"
                  className="notification-button"
                  aria-label="Notifications"
                  onClick={() => inform('Notifications are not connected in this preview.')}
                >
                  <FigmaIcon asset="228fd" size={22} />
                </button>
                <div className="account-container">
                  <button
                    ref={account}
                    type="button"
                    className="account-toggle"
                    aria-label="Account menu"
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
                    <p className="caption text-muted">Demo account · {user?.displayName}</p>
                    {sessionNotice && <p className="caption text-muted">{sessionNotice}</p>}
                    {permissions.canEditSolverProfile && (
                      <Link to={'/profile-setup'} onClick={close}>
                        Solver profile
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
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => go('/signin')}>
                  Sign in
                </Button>
                <Button size="sm" onClick={() => go('/signup')}>
                  Sign up
                </Button>
              </>
            )}
            <LanguageSwitch />
          </div>
        </div>
      </div>
      {notice && (
        <div role="status" className="navbar-notice">
          {notice}
          <button type="button" aria-label="Dismiss notification" onClick={() => setNotice('')}>
            ×
          </button>
        </div>
      )}
    </header>
  )
}
