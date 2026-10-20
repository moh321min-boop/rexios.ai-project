import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { problems, type Problem } from '@/data/problems'
import { useAuth } from '@/context/AuthContext'
import { useProblems } from '@/context/ProblemsContext'
import {
  emptySolution,
  validateSolution,
  validateSolutionFile,
  type SolutionDraft,
} from '@/lib/problems'
import { problemPermission } from '@/lib/auth/permissions'
import { focusFirstError } from '@/lib/forms'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import {
  ProblemBreadcrumb,
  ProblemNotFound,
  ProblemSummary,
  ProfileLink,
} from '@/components/problems/ProblemUI'
export function SubmitSolutionPage() {
  const { id } = useParams()
  const problem = problems.find((p) => p.id === id)
  const { user, permissions } = useAuth()
  if (!problem) return <ProblemNotFound />
  return (
    <div className="problems-page problem-submit-page">
      <ProblemBreadcrumb problem={problem} submit />
      {permissions.canSubmitSolutions && user ? (
        <SolutionForm key={`${problem.id}-${user.id}`} problem={problem} />
      ) : (
        <section className="problem-card">
          <h1 className="heading">
            {!user
              ? 'Sign in to submit a solution'
              : user.role === 'industrial_company'
                ? 'Solution submission unavailable'
                : 'Complete your solver profile'}
          </h1>
          <p>
            {!user
              ? 'Sign in with a demo solver account to test this workflow.'
              : user.role === 'industrial_company'
                ? 'Company accounts can participate in discussions. Technical solver accounts submit proposals.'
                : 'A complete solver profile is required in this preview.'}
          </p>
          {permissions.canEditSolverProfile && <ProfileLink problem={problem} />}
          <Link className="text-link" to={`/problems/${problem.id}`}>
            Back to problem
          </Link>
        </section>
      )}
    </div>
  )
}
function SolutionForm({ problem }: { problem: Problem }) {
  const { user } = useAuth(),
    { drafts, submissions, saveDraft, submit } = useProblems()
  const key = `${user!.id}:${problem.id}`
  const [draft, setDraft] = useState<SolutionDraft>(() => drafts[key] ?? emptySolution()),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [notice, setNotice] = useState(''),
    [banner, setBanner] = useState(true),
    [success, setSuccess] = useState(false)
  const picker = useRef<HTMLInputElement>(null),
    submitted = useRef(false),
    navigate = useNavigate()
  const matched = problemPermission(user, problem).matchedSkills.length
  function change<K extends keyof SolutionDraft>(name: K, value: SolutionDraft[K]) {
    setDraft((d) => ({ ...d, [name]: value }))
    setErrors((e) => ({ ...e, [name]: '' }))
    setNotice('')
  }
  function choose(file?: File) {
    if (!file) return
    const error = validateSolutionFile(file)
    setErrors((e) => ({ ...e, file: error }))
    if (!error) {
      change('file', { name: file.name, size: file.size })
      setNotice('Selected locally. Only the filename and size are retained; nothing is uploaded.')
    }
  }
  function send(event: FormEvent) {
    event.preventDefault()
    const next = { ...validateSolution(draft), ...(errors.file ? { file: errors.file } : {}) }
    setErrors(next)
    if (Object.values(next).some(Boolean)) {
      focusFirstError()
      return
    }
    if (submitted.current || submissions[key]) {
      setNotice('A local proposal already exists for this problem. Reloading clears the preview.')
      return
    }
    submitted.current = true
    submit(key, { ...draft, summary: draft.summary.trim(), link: draft.link.trim() })
    setSuccess(true)
  }
  function cancel() {
    saveDraft(key, draft)
    navigate(`/problems/${problem.id}`)
  }
  return (
    <div className="problem-submit-grid">
      <form className="solution-form" noValidate onSubmit={send}>
        <header>
          <h1 className="heading">Submit your solution</h1>
          <p className="text-muted">
            Explain your idea clearly; the company decides whether to accept or reject the solution.
          </p>
        </header>
        {banner && (
          <div className="problem-message info">
            <FigmaIcon asset="a424c" size={24} />
            <p>
              Your skills match {matched} of the problem's {problem.skills.length} skills — you can
              continue.
            </p>
            <button
              type="button"
              aria-label="Dismiss skill match notice"
              onClick={() => setBanner(false)}
            >
              ×
            </button>
          </div>
        )}
        <Textarea
          autoGrow
          className="resize-none"
          label="Solution summary"
          required
          placeholder="Explain your idea, how you'll implement it and the technologies you'll use…"
          helperText="At least 50 words recommended"
          value={draft.summary}
          onChange={(e) => change('summary', e.target.value)}
          error={errors.summary}
          maxLength={20000}
        />
        <div className="form-row">
          <Select
            label="Proposed delivery time"
            required
            value={draft.delivery}
            onChange={(e) => change('delivery', e.target.value)}
            error={errors.delivery}
          >
            {['10'].map((days) => (
              <option key={days} value={days}>
                {days} days
              </option>
            ))}
          </Select>
          <Input
            label="Link to previous work or a demo"
            placeholder="https://github.com/…"
            helperText="Optional"
            value={draft.link}
            onChange={(e) => change('link', e.target.value)}
            error={errors.link}
            type="url"
          />
        </div>
        <div className="solution-upload">
          <span className="label" id="solution-file-label">
            Attachments (optional)
          </span>
          <input
            ref={picker}
            type="file"
            accept=".pdf,.docx"
            className="sr-only"
            tabIndex={-1}
            aria-labelledby="solution-file-label"
            onChange={(e) => {
              choose(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <div
            className="upload-box"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              choose(e.dataTransfer.files[0])
            }}
          >
            <button
              type="button"
              aria-invalid={!!errors.file}
              aria-describedby={errors.file ? 'solution-file-error' : undefined}
              onClick={() => picker.current?.click()}
            >
              <FigmaIcon asset="bc4f0" size={28} />
              <span>{draft.file ? draft.file.name : 'Drag the file here or click to choose'}</span>
              <span className="caption text-muted">
                {draft.file
                  ? `${(draft.file.size / 1000000).toFixed(1)}MB — selected locally. Click to replace.`
                  : 'PDF or DOCX — up to 5MB'}
              </span>
            </button>
            {draft.file && (
              <button type="button" className="text-link" onClick={() => change('file', null)}>
                Remove attachment
              </button>
            )}
          </div>
          {errors.file && (
            <p className="caption text-error-text" id="solution-file-error">
              {errors.file}
            </p>
          )}
        </div>
        <div>
          <label className="solution-terms">
            <input
              className="checkbox"
              type="checkbox"
              checked={draft.terms}
              onChange={(e) => change('terms', e.target.checked)}
              aria-invalid={!!errors.terms}
              aria-describedby={errors.terms ? 'solution-terms-error' : undefined}
            />
            <span>I confirm this work is my own and agree to the solution submission terms</span>
          </label>
          {errors.terms && (
            <p className="caption text-error-text" id="solution-terms-error">
              {errors.terms}
            </p>
          )}
        </div>
        <hr />
        <div className="solution-actions">
          <Button type="submit" disabled={!!submissions[key]}>
            Submit solution
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              saveDraft(key, draft)
              setNotice('Draft saved for this tab only. Reloading clears it.')
            }}
          >
            Save as draft
          </Button>
          <Button variant="ghost" type="button" onClick={cancel}>
            Cancel
          </Button>
        </div>
        {notice && (
          <p role="status" className="inline-notice">
            {notice}
          </p>
        )}
        {submissions[key] && !success && (
          <p role="status" className="inline-notice">
            A local preview solution has already been submitted. Nothing was sent to a company.
          </p>
        )}
      </form>
      <ProblemSummary problem={problem} submission />
      <Modal
        isOpen={success}
        onClose={() => setSuccess(false)}
        title="Local solution preview saved"
        description="Nothing was uploaded or sent to a company. This sample submission disappears when the page is reloaded."
      >
        <Link className="button-link" to={`/problems/${problem.id}`}>
          Back to problem
        </Link>
      </Modal>
    </div>
  )
}
