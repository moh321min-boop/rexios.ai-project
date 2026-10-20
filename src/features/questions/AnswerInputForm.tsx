import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCommunity } from '@/context/CommunityContext'
import { Button } from '@/components/ui/Button'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { MarkdownEditor } from '@/components/shared/MarkdownEditor'
import { focusFirstError } from '@/lib/forms'
export function AnswerInputForm({ questionId }: { questionId: string }) {
  const { isAuthenticated, user } = useAuth()
  const { addAnswer } = useCommunity()
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!body.trim()) {
      setError('Please write your answer.')
      focusFirstError()
      return
    }
    if (!user) return
    const now = new Date().toISOString()
    addAnswer({
      id: `local-${crypto.randomUUID()}`,
      questionId,
      body: body.trim(),
      authorId: user.id,
      author: user,
      voteCount: 0,
      insightCount: 0,
      isAccepted: false,
      createdAt: now,
      updatedAt: now,
      timeLabel: 'Just now',
    })
    setBody('')
    setError('')
    setNotice('Answer added to this preview only. It will be lost on reload.')
  }
  if (!isAuthenticated)
    return (
      <section className="answer-gate">
        <FigmaIcon asset="edfe7" size={32} />
        <h2 className="section-title">Sign in to write an answer</h2>
        <p className="text-muted">Only registered members can write answers and react to posts.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            className="button-link"
            to="/signup"
            state={{ from: `/community/questions/${questionId}` }}
          >
            Sign up
          </Link>
          <Link
            className="button-link secondary-link"
            to="/signin"
            state={{ from: `/community/questions/${questionId}` }}
          >
            Sign in
          </Link>
        </div>
      </section>
    )
  return (
    <form className="answer-composer" onSubmit={submit} noValidate>
      <h2 className="section-title">Write your answer</h2>
      <MarkdownEditor
        id="answer-body"
        label="Your answer"
        required
        value={body}
        onValueChange={setBody}
        placeholder="Explain the solution in clear steps…"
        error={error}
      />
      <div className="editor-actions">
        <Button type="submit">Post answer</Button>
        <Button
          className="shadow-none"
          variant="ghost"
          onClick={() => {
            setBody('')
            setError('')
            setNotice('')
          }}
        >
          Cancel
        </Button>
      </div>
      {notice && (
        <p role="status" className="inline-notice">
          {notice}
        </p>
      )}
    </form>
  )
}
