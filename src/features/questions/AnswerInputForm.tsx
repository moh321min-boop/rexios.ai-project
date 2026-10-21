import { Notice } from '@/components/shared/Notice'
import { t, useI18n } from '@/i18n'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCommunity } from '@/context/CommunityContext'
import { Button } from '@/components/ui/Button'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { MarkdownEditor } from '@/components/shared/MarkdownEditor'
import { focusFirstError } from '@/lib/forms'
export function AnswerInputForm({ questionId }: { questionId: string }) {
  useI18n()
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
        <h2 className="section-title">{t('answerInputForm.sign_in_to_write_an_answer')}</h2>
        <p className="text-muted">
          {t('answerInputForm.only_registered_members_can_write_answers_and')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            className="button-link"
            to="/signup"
            state={{ from: `/community/questions/${questionId}` }}
          >
            {t('signUp.sign_up')}
          </Link>
          <Link
            className="button-link secondary-link"
            to="/signin"
            state={{ from: `/community/questions/${questionId}` }}
          >
            {t('signIn.sign_in')}
          </Link>
        </div>
      </section>
    )
  return (
    <form className="answer-composer" onSubmit={submit} noValidate>
      <h2 className="section-title">{t('answerInputForm.write_your_answer')}</h2>
      <MarkdownEditor
        id="answer-body"
        label={t('answerInputForm.your_answer')}
        required
        value={body}
        onValueChange={setBody}
        placeholder={t('answerInputForm.explain_the_solution_in_clear_steps')}
        error={error}
      />
      <div className="editor-actions">
        <Button type="submit">{t('answerInputForm.post_answer')}</Button>
        <Button
          className="shadow-none"
          variant="ghost"
          onClick={() => {
            setBody('')
            setError('')
            setNotice('')
          }}
        >
          {t('askQuestion.cancel')}
        </Button>
      </div>
      {notice && <Notice onDismiss={() => setNotice('')}>{notice}</Notice>}
    </form>
  )
}
