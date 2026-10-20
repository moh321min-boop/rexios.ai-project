import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { DEMO_PASSWORD, SESSION_KEY } from '@/lib/auth/mockAuth'
import { SignInPage } from './SignInPage'
function setup(query = '', from?: string) {
  window.history.replaceState({}, '', '/signin' + query)
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[{ pathname: '/signin', search: query, state: { from } }]}>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<h1>Signup destination</h1>} />
          <Route path="/community" element={<h1>Community destination</h1>} />
          <Route path="/problems" element={<h1>Problems destination</h1>} />
          <Route path="/community/ask" element={<h1>Ask destination</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}
function fill(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Email *'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Password *'), { target: { value: password } })
}
afterEach(() => {
  window.history.replaceState({}, '', '/')
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})
describe('credential-based demo sign in', () => {
  it('retains the original mascot and validates fields with focus', async () => {
    setup()
    expect(screen.getByRole('img', { name: 'Rexios AI pixel dinosaur' })).toHaveAttribute(
      'src',
      '/figma/e5844.svg'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sign in', exact: true }))
    expect(screen.getByLabelText('Email *')).toHaveAccessibleDescription(
      'Enter a valid email address.'
    )
    expect(screen.getByLabelText('Password *')).toHaveAccessibleDescription('Enter your password.')
    await waitFor(() => expect(screen.getByLabelText('Email *')).toHaveFocus())
  })
  it.each([
    ['unknown@rexios.demo', DEMO_PASSWORD],
    ['member@rexios.demo', 'Wrong123!'],
  ])('rejects invalid credentials for %s without persisting them', async (email, password) => {
    setup()
    fill(email, password)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in', exact: true }))
    await waitFor(() =>
      expect(screen.getByLabelText('Password *')).toHaveAttribute('aria-invalid', 'true')
    )
    expect(screen.getByLabelText('Password *')).toHaveAttribute('type', 'password')
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    expect(JSON.stringify(sessionStorage)).not.toContain(password)
  })
  it.each([
    ['member', 'Community'],
    ['solver', 'Problems'],
    ['incomplete', 'Problems'],
    ['company', 'Problems'],
  ])('signs in %s on the normal route', async (role, destination) => {
    setup()
    fill(`${role}@rexios.demo`, DEMO_PASSWORD)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in', exact: true }))
    expect(
      await screen.findByRole('heading', { name: `${destination} destination` })
    ).toBeInTheDocument()
    expect(sessionStorage.getItem(SESSION_KEY)).toBe(`demo-${role}`)
  })
  it('preserves a safe intended destination', async () => {
    setup('', '/community/ask')
    fill('member@rexios.demo', DEMO_PASSWORD)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in', exact: true }))
    expect(await screen.findByRole('heading', { name: 'Ask destination' })).toBeInTheDocument()
  })
  it('ignores obsolete preview role and error parameters', () => {
    setup('?preview=solver&state=error')
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    expect(screen.getByLabelText('Password *')).toHaveAttribute('aria-invalid', 'false')
  })
  it('keeps OAuth and recovery honestly unavailable and signup navigation working', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))
    expect(screen.getByRole('status')).toHaveTextContent('No authentication request was sent.')
    await userEvent.click(screen.getByRole('button', { name: 'Forgot your password?' }))
    expect(screen.getByRole('status')).toHaveTextContent('No reset email was sent.')
    await userEvent.click(screen.getByRole('link', { name: 'Create an account' }))
    expect(screen.getByRole('heading', { name: 'Signup destination' })).toBeInTheDocument()
  })
  it('disables login when no mock or real provider is configured', () => {
    vi.stubEnv('VITE_AUTH_MODE', '')
    setup()
    expect(screen.getByRole('button', { name: 'Sign in', exact: true })).toBeDisabled()
    expect(screen.getByText(/Mock login is disabled/)).toBeInTheDocument()
  })
})
