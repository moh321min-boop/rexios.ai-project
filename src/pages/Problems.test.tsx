import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProblemsProvider } from '@/context/ProblemsContext'
import { ProblemsPage } from './ProblemsPage'
import { ProblemDetailPage } from './ProblemDetailPage'
import { SubmitSolutionPage } from './SubmitSolutionPage'
import { SESSION_KEY } from '@/lib/auth/mockAuth'
function setup(path = '/problems', role = 'member') {
  const url = path
  sessionStorage.clear()
  if (role !== 'visitor') sessionStorage.setItem(SESSION_KEY, `demo-${role}`)
  window.history.replaceState({}, '', url)
  return render(
    <AuthProvider>
      <ProblemsProvider>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/:id" element={<ProblemDetailPage />} />
            <Route path="/problems/:id/submit-solution" element={<SubmitSolutionPage />} />
          </Routes>
        </MemoryRouter>
      </ProblemsProvider>
    </AuthProvider>
  )
}
afterEach(() => window.history.replaceState({}, '', '/'))
describe('Problems workflow', () => {
  it('searches fixtures, filters difficulty and resets the controls', async () => {
    const user = userEvent.setup()
    setup()
    expect(screen.getAllByRole('article')).toHaveLength(4)
    fireEvent.change(screen.getByRole('textbox', { name: 'Search problems' }), {
      target: { value: 'oven' },
    })
    expect(screen.getAllByRole('article')).toHaveLength(1)
    await user.click(screen.getByRole('checkbox', { name: 'Expert' }))
    expect(screen.getByRole('heading', { name: 'No matching problems' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reset', exact: true }))
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })
  it('uses one detail page for incomplete and solver roles and retains local discussion', async () => {
    const user = userEvent.setup()
    setup('/problems/p-101', 'incomplete')
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '40')
    expect(screen.queryByRole('link', { name: 'Submit a solution' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Post comment' }))
    expect(screen.getByLabelText('Add a comment or question')).toHaveAccessibleDescription(
      'Write a comment or question.'
    )
    fireEvent.change(screen.getByLabelText('Add a comment or question'), {
      target: { value: 'Is the sensor shielded?' },
    })
    await user.click(screen.getByRole('button', { name: 'Post comment' }))
    expect(screen.getByText('Is the sensor shielded?')).toBeInTheDocument()
    cleanup()
    setup('/problems/p-101', 'solver')
    expect(screen.getByRole('link', { name: 'Submit a solution' })).toBeInTheDocument()
    expect(screen.getByText('Your skills match 2 of 3')).toBeInTheDocument()
  })
  it('guards visitor, incomplete and company submission and allows solver switching', async () => {
    setup('/problems/p-101/submit-solution', 'visitor')
    expect(
      screen.getByRole('heading', { name: 'Sign in to submit a solution' })
    ).toBeInTheDocument()
    cleanup()
    setup('/problems/p-101/submit-solution', 'company')
    expect(
      screen.getByRole('heading', { name: 'Solution submission unavailable' })
    ).toBeInTheDocument()
    cleanup()
    setup('/problems/p-101/submit-solution', 'incomplete')
    expect(
      screen.getByRole('heading', { name: 'Complete your solver profile' })
    ).toBeInTheDocument()
    cleanup()
    setup('/problems/p-101/submit-solution', 'solver')
    expect(screen.getByLabelText('Solution summary *')).toBeInTheDocument()
  })
  it('validates submissions and preserves a draft through cancel and return', async () => {
    const user = userEvent.setup()
    setup('/problems/p-101/submit-solution', 'solver')
    await user.click(screen.getByRole('button', { name: 'Submit solution', exact: true }))
    expect(screen.getByLabelText('Solution summary *')).toHaveAccessibleDescription(
      'Describe your solution.'
    )
    fireEvent.change(screen.getByLabelText('Solution summary *'), {
      target: { value: 'A calibrated ESP32 sensor with a small monitoring dashboard.' },
    })
    fireEvent.change(screen.getByLabelText('Link to previous work or a demo'), {
      target: { value: 'javascript:alert(1)' },
    })
    await user.click(screen.getByRole('button', { name: 'Submit solution', exact: true }))
    expect(screen.getByLabelText('Link to previous work or a demo')).toHaveAccessibleDescription(
      'Enter a complete http:// or https:// URL.'
    )
    await user.click(screen.getByRole('button', { name: 'Save as draft' }))
    expect(screen.getByRole('status')).toHaveTextContent('Draft saved for this tab only')
    await user.click(screen.getByRole('button', { name: 'Cancel', exact: true }))
    await user.click(screen.getByRole('link', { name: 'Submit a solution' }))
    expect(screen.getByLabelText('Solution summary *')).toHaveValue(
      'A calibrated ESP32 sensor with a small monitoring dashboard.'
    )
    expect(screen.getByLabelText('Link to previous work or a demo')).toHaveValue(
      'javascript:alert(1)'
    )
  })
  it('does not reuse the oven requirements for other problems and handles unknown IDs', () => {
    setup('/problems/p-102')
    expect(screen.queryByRole('heading', { name: 'Deliverables' })).not.toBeInTheDocument()
    expect(screen.getByText(/Detailed requirements and attachments/)).toBeInTheDocument()
    expect(
      within(screen.getByRole('heading', { name: /Discussion/ })).getByText('(0)')
    ).toBeInTheDocument()
  })
  it('shows an explicit missing-problem state', () => {
    setup('/problems/missing')
    expect(screen.getByRole('heading', { name: 'Problem not found' })).toBeInTheDocument()
  })
})
