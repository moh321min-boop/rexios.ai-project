import { useRef, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Reply } from 'lucide-react'
import { problems, type Problem } from '@/data/problems'
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
      setError('Write a comment or question.')
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
          Discussion <span>({entries.length})</span>
        </h2>
        <p className="text-muted">
          Ask the problem owner or the community. Commenting is open to all members with just an
          email.
        </p>
      </div>
      <form className="problem-comment-form" noValidate onSubmit={post}>
        {reply && (
          <p className="caption">
            Replying to {reply.author}{' '}
            <button type="button" className="text-link" onClick={() => setReply(null)}>
              Cancel reply
            </button>
          </p>
        )}
        <Textarea
          autoGrow
          className="resize-none"
          ref={input}
          label="Add a comment or question"
          placeholder="Ask about the company or the problem details…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          error={error}
          maxLength={10000}
        />
        <Button size="sm" type="submit">
          Post comment
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
              <span>{comment.author}</span>
              {comment.company && (
                <span className="problem-skills">
                  <Tag name="COMPANY" selected />
                </span>
              )}
            </div>
            <span className="caption text-muted">{comment.time}</span>
          </div>
          <p>{comment.text}</p>
          <button
            type="button"
            className="problem-reply"
            onClick={() => {
              setReply({ id: comment.id, author: comment.author })
              input.current?.focus()
            }}
          >
            <Reply size={16} aria-hidden="true" />
            Reply<span className="sr-only"> to {comment.author}</span>
          </button>
        </article>
      ))}
    </section>
  )
}
export function ProblemDetailPage() {
  const { id } = useParams()
  const problem = problems.find((p) => p.id === id)
  return problem ? <Detail key={problem.id} problem={problem} /> : <ProblemNotFound />
}
function Detail({ problem }: { problem: Problem }) {
  const [notice, setNotice] = useState('')
  return (
    <div className="problems-page">
      <ProblemBreadcrumb problem={problem} />
      <div className="problem-detail-grid">
        <div className="problem-main">
          <section className="problem-title-card">
            <div className="problem-card-top">
              <Company problem={problem} large />
              <span className="caption text-muted">Posted {problem.age}</span>
            </div>
            <h1 className="heading">{problem.title}</h1>
            <div className="problem-title-tags">
              <DifficultyMark value={problem.difficulty} />
              <ProblemSkills problem={problem} />
            </div>
          </section>
          <section className="problem-description">
            <div>
              <h2 className="section-title">Problem description</h2>
              <p>{problem.description ?? problem.summary}</p>
              {!problem.description && (
                <p className="inline-notice">
                  Detailed requirements and attachments for this problem were not supplied. This
                  preview uses only the list reference.
                </p>
              )}
            </div>
            {problem.sections?.map((section) => (
              <div key={section.title}>
                <h2 className="section-title">{section.title}</h2>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>
                      <FigmaIcon asset="3d3b0" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {problem.attachments && (
              <div>
                <h2 className="section-title">Attachments</h2>
                <div className="problem-attachments">
                  {problem.attachments.map((name) => (
                    <Button
                      size="sm"
                      variant="secondary"
                      key={name}
                      onClick={() =>
                        setNotice(
                          `${name} is shown in the design, but the original file was not supplied. No download is available.`
                        )
                      }
                    >
                      <FigmaIcon asset="2c98d" size={18} />
                      {name}
                    </Button>
                  ))}
                </div>
                {notice && (
                  <p role="status" className="inline-notice">
                    {notice}
                  </p>
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
