import { afterEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CommunityProvider } from '@/context/CommunityContext'
import { AskQuestionPage } from './AskQuestionPage'
import { QuestionDetailPage } from './QuestionDetailPage'
import { CommunityFeedPage } from './CommunityFeedPage'
import { FormattedText } from '@/components/shared/FormattedText'
import { SESSION_KEY } from '@/lib/auth/mockAuth'
function renderCommunity(path: string) {
  window.history.replaceState({}, '', path)
  sessionStorage.setItem(SESSION_KEY, 'demo-member')
  return render(
    <AuthProvider>
      <CommunityProvider>
        <MemoryRouter initialEntries={[path]}>
          <Link to="/community/questions/q-104">Next question</Link>
          <Routes>
            <Route path="/community" element={<CommunityFeedPage />} />
            <Route path="/community/ask" element={<AskQuestionPage />} />
            <Route path="/community/questions/:id" element={<QuestionDetailPage />} />
          </Routes>
        </MemoryRouter>
      </CommunityProvider>
    </AuthProvider>
  )
}
afterEach(() => window.history.replaceState({}, '', '/'))
describe('community workflows', () => {
  it('validates question fields and limits selection to five tags', async () => {
    const user = userEvent.setup()
    renderCommunity('/community/ask')
    await user.click(screen.getByRole('button', { name: 'Post question' }))
    expect(screen.getByLabelText('Question title *')).toHaveAccessibleDescription(
      'Title must be at least 15 characters.'
    )
    await waitFor(() => expect(screen.getByLabelText('Question title *')).toHaveFocus())
    for (const name of ['Embedded Systems', 'IoT', 'Python', 'C / C++', 'AI / ML', 'SCADA'])
      await user.click(screen.getByRole('button', { name, exact: true }))
    expect(
      within(screen.getByRole('group', { name: 'Question tags' })).getAllByRole('button', {
        pressed: true,
      })
    ).toHaveLength(5)
    expect(screen.getByRole('alert')).toHaveTextContent('Choose up to 5 tags.')
  })
  it('saves a draft across in-app navigation and posts a local question', async () => {
    const user = userEvent.setup()
    renderCommunity('/community/ask')
    fireEvent.change(screen.getByLabelText('Question title *'), {
      target: { value: 'How can I calibrate this sensor?' },
    })
    fireEvent.change(screen.getByLabelText('Problem details *'), {
      target: {
        value: 'I measured the sensor output twice and need help understanding the difference.',
      },
    })
    await user.click(screen.getByRole('button', { name: 'IoT', exact: true }))
    await user.click(screen.getByRole('button', { name: 'Save as draft' }))
    expect(screen.getByRole('status')).toHaveTextContent('lost on reload')
    await user.click(screen.getByRole('button', { name: 'Cancel', exact: true }))
    await user.click(screen.getAllByRole('button', { name: 'Ask a question', exact: true })[0]!)
    expect(screen.getByLabelText('Question title *')).toHaveValue(
      'How can I calibrate this sensor?'
    )
    await user.click(screen.getByRole('button', { name: 'Post question' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'How can I calibrate this sensor?'
    )
    expect(screen.getByText('No answers yet. Be the first to help.')).toBeInTheDocument()
  })
  it('adds an answer only to its question and clears the composer when the route changes', async () => {
    const user = userEvent.setup()
    renderCommunity('/community/questions/q-101')
    await user.click(screen.getByRole('button', { name: 'Post answer' }))
    expect(screen.getByLabelText('Your answer *')).toHaveAccessibleDescription(
      'Please write your answer.'
    )
    await user.type(
      screen.getByLabelText('Your answer *'),
      'Try comparing the sensor with a calibrated reference.'
    )
    await user.click(screen.getByRole('button', { name: 'Post answer' }))
    expect(screen.getByRole('heading', { name: '4 answers' })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Your answer *'), 'Unsubmitted text')
    await user.click(screen.getByRole('link', { name: 'Next question' }))
    expect(screen.getByRole('heading', { name: '0 answers' })).toBeInTheDocument()
    expect(screen.getByLabelText('Your answer *')).toHaveValue('')
    expect(
      screen.queryByText('Try comparing the sensor with a calibrated reference.')
    ).not.toBeInTheDocument()
  })
  it('reports an unknown question without displaying another question', () => {
    renderCommunity('/community/questions/missing')
    expect(screen.getByRole('heading', { name: 'Question not found' })).toBeInTheDocument()
    expect(screen.queryByText(/temperature sensor noise/)).not.toBeInTheDocument()
  })
  it('toggles a reaction and its count without changing the base fixture', async () => {
    const user = userEvent.setup()
    renderCommunity('/community/questions/q-101')
    await user.click(screen.getByRole('button', { name: 'Helpful 12' }))
    expect(screen.getByRole('button', { name: 'Helpful 13' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await user.click(screen.getByRole('button', { name: 'Helpful 13' }))
    expect(screen.getByRole('button', { name: 'Helpful 12' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })
  it('renders code and safe links without interpreting HTML or executable URLs', () => {
    render(
      <FormattedText
        text={
          '<img src=x onerror=alert(1)>\n\n[unsafe](javascript:evil) [safe](https://example.com)\n\n```\nconst value = 1;\n```'
        }
      />
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'safe' })).toHaveAttribute('rel', 'noreferrer')
    expect(screen.getByText('const value = 1;').tagName).toBe('CODE')
  })
})
