import { Notice } from '@/components/shared/Notice'
import { t, useI18n } from '@/i18n'
import { useRef, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Reply } from 'lucide-react'
import { problems, initialProblemComments, type Problem } from '@/data/problems'
import { fixtureText } from '@/i18n/fixtures'
import { useProblems } from '@/context/ProblemsContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'
import { Tag } from '@/components/ui/Tag'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import {
  Company,
  DifficultyMark,
  ProblemBreadcrumb,
  ProblemNotFound,
  ProblemSkills,
  ProblemSummary,
} from '@/components/problems/ProblemUI'
function Discussion({ problem }: { problem: Problem }) {
  useI18n()
  const { comments, addComment } = useProblems(),
    { user, triggerAuthPrompt } = useAuth()
  const entries = comments[problem.id] ?? []
  const [text, setText] = useState(''),
    [error, setError] = useState(''),
    [reply, setReply] = useState<{ id: string; author: string } | null>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  function post(e: FormEvent) {
    e.preventDefault()
    if (!user) {
      triggerAuthPrompt('Sign in to discuss this problem.')
      return
    }
    if (!text.trim()) {
      setError('problemDetail.write_a_comment_or_question')
      input.current?.focus()
      return
    }
    addComment(problem.id, {
      id: crypto.randomUUID(),
      author: user.displayName,
      text: text.trim(),
      time: 'Just now',
      company: user.role === 'industrial_company',
      replyTo: reply?.id,
    })
    setText('')
    setError('')
    setReply(null)
  }
  return (
    <section className="problem-discussion">
      <div>
        <h2>
          {t('problemDetail.discussion')} <span>({entries.length})</span>
        </h2>
        <p className="text-muted">{t('problemDetail.ask_the_problem_owner_or_the_community')}</p>
      </div>
      <form className="problem-comment-form" noValidate onSubmit={post}>
        {reply && (
          <p className="caption">
            {t('problem.replyingTo', { name: reply.author })}{' '}
            <button type="button" className="text-link" onClick={() => setReply(null)}>
              {t('problemDetail.cancel_reply')}
            </button>
          </p>
        )}
        <Textarea
          autoGrow
          className="resize-none"
          ref={input}
          label={t('problemDetail.add_a_comment_or_question')}
          placeholder={t('problemDetail.ask_about_the_company_or_the_problem')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          error={error}
          maxLength={10000}
        />
        <Button size="sm" type="submit">
          {t('problemDetail.post_comment')}
        </Button>
      </form>
      {entries.map((comment) => (
        <article
          className={`problem-comment ${comment.replyTo ? 'is-reply' : ''} ${comment.company ? 'company-comment' : ''}`}
          key={comment.id}
        >
          <div className="problem-card-top">
            <div className="problem-company">
              <Avatar size="sm" name={comment.author} />
              <bdi>{comment.author}</bdi>
              {comment.company && (
                <span className="problem-skills">
                  <Tag name={t('roles.companyBadge')} selected />
                </span>
              )}
            </div>
            <span className="caption text-muted">{t(comment.time)}</span>
          </div>
          <p dir="auto">
            {fixtureText(
              comment.text,
              problem.id === 'p-101'
                ? initialProblemComments.find((item) => item.id === comment.id)?.text
                : undefined
            )}
          </p>
          <button
            type="button"
            className="problem-reply"
            aria-label={t('problem.replyTo', { name: comment.author })}
            onClick={() => {
              setReply({ id: comment.id, author: comment.author })
              input.current?.focus()
            }}
          >
            <Reply size={16} aria-hidden="true" />
            {t('problemDetail.reply')}
          </button>
        </article>
      ))}
    </section>
  )
}
export function ProblemDetailPage() {
  useI18n()
  const { id } = useParams()
  const problem = problems.find((p) => p.id === id)
  return problem ? <Detail key={problem.id} problem={problem} /> : <ProblemNotFound />
}
function Detail({ problem }: { problem: Problem }) {
  useI18n()
  const [notice, setNotice] = useState('')
  return (
    <div className="problems-page">
      <ProblemBreadcrumb problem={problem} />
      <div className="problem-detail-grid">
        <div className="problem-main">
          <section className="problem-title-card">
            <div className="problem-card-top">
              <Company problem={problem} large />
              <span className="caption text-muted">
                {t('problem.posted', { time: t(problem.age) })}
              </span>
            </div>
            <h1 className="heading" dir="auto">
              {t(problem.title)}
            </h1>
            <div className="problem-title-tags">
              <DifficultyMark value={problem.difficulty} />
              <ProblemSkills problem={problem} />
            </div>
          </section>
          <section className="problem-description">
            <div>
              <h2 className="section-title">{t('problemDetail.problem_description')}</h2>
              <p dir="auto">{t(problem.description ?? problem.summary)}</p>
              {!problem.description && (
                <p className="inline-notice">
                  {t('problemDetail.detailed_requirements_and_attachments_for_this_problem')}
                </p>
              )}
            </div>
            {problem.sections?.map((section) => (
              <div key={section.title}>
                <h2 className="section-title">{t(section.title)}</h2>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>
                      <FigmaIcon asset="3d3b0" size={20} />
                      <span dir="auto">{t(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {problem.attachments && (
              <div>
                <h2 className="section-title">{t('problemDetail.attachments')}</h2>
                <div className="problem-attachments">
                  {problem.attachments.map((name) => (
                    <Button
                      size="sm"
                      variant="secondary"
                      key={name}
                      onClick={() => setNotice(name)}
                    >
                      <FigmaIcon asset="2c98d" size={18} />
                      {name}
                    </Button>
                  ))}
                </div>
                {notice && (
                  <Notice onDismiss={() => setNotice('')}>
                    {t('problem.attachmentUnavailable', { name: notice })}
                  </Notice>
                )}
              </div>
            )}
          </section>
          <Discussion problem={problem} />
        </div>
        <ProblemSummary problem={problem} />
      </div>
    </div>
  )
}
