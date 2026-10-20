import { afterEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { SESSION_KEY } from '@/lib/auth/mockAuth'
import { SignUpPage } from './SignUpPage'
function setup() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<h1>Sign-in destination</h1>} />
          <Route path="/account-activated" element={<h1>Temporary account destination</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}
function fill(email: string, password: string, confirm = password) {
  for (const [label, value] of [
    ['Email *', email],
    ['Password *', password],
    ['Confirm password *', confirm],
  ])
    fireEvent.change(screen.getByLabelText(label!, { exact: true }), { target: { value } })
}
afterEach(() => window.history.replaceState({}, '', '/'))
describe('temporary demo signup', () => {
  it('preserves mascot and sign-in navigation', async () => {
    setup()
    expect(screen.getByRole('img', { name: 'Rexios AI pixel dinosaur' })).toHaveAttribute(
      'src',
      '/figma/e5844.svg'
    )
    await userEvent.click(screen.getByRole('link', { name: 'Sign in', exact: true }))
    expect(screen.getByRole('heading', { name: 'Sign-in destination' })).toBeInTheDocument()
  })
  it('validates required fields and focuses email', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Sign up', exact: true }))
    expect(screen.getByLabelText('Email *')).toHaveAccessibleDescription(
      'Enter a valid email address.'
    )
    expect(screen.getByLabelText('Password *', { exact: true })).toHaveAccessibleDescription(
      'Use at least 8 characters, including one digit.'
    )
    expect(screen.getByLabelText('Confirm password *')).toHaveAccessibleDescription(
      'Passwords must match.'
    )
    await waitFor(() => expect(screen.getByLabelText('Email *')).toHaveFocus())
  })
  it('still requires a digit, matching confirmation and consent', async () => {
    setup()
    fill('test@example.invalid', 'nodigitpassword', 'different')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Sign up', exact: true }))
    expect(screen.getByLabelText('Password *', { exact: true })).toHaveAttribute(
      'aria-invalid',
      'true'
    )
    expect(screen.getByLabelText('Confirm password *')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('You must agree to continue.')
  })
  it('creates a temporary account without storing email or password', async () => {
    setup()
    const email = `signup-${crypto.randomUUID()}@example.invalid`
    fill(email, 'Example123!')
    await userEvent.click(screen.getByRole('button', { name: 'Sign up', exact: true }))
    expect(
      await screen.findByRole('heading', { name: 'Temporary account destination' })
    ).toBeInTheDocument()
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    expect(JSON.stringify(sessionStorage)).not.toContain(email)
    expect(JSON.stringify(sessionStorage)).not.toContain('Example123!')
  })
  it('rejects duplicate fixture emails instead of overwriting accounts', async () => {
    setup()
    fill('member@rexios.demo', 'Example123!')
    await userEvent.click(screen.getByRole('button', { name: 'Sign up', exact: true }))
    await waitFor(() =>
      expect(screen.getByLabelText('Email *')).toHaveAccessibleDescription(
        'This email already belongs to a demo account. Sign in instead.'
      )
    )
  })
})
