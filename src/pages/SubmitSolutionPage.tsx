import { Notice } from '@/components/shared/Notice'
import { t, useI18n } from '@/i18n'
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
  useI18n()
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
              ? t('submitSolution.sign_in_to_submit_a_solution')
              : user.role === 'industrial_company'
                ? t('submitSolution.solution_submission_unavailable')
                : t('submitSolution.complete_your_solver_profile')}
          </h1>
          <p>
            {!user
              ? t('submitSolution.sign_in_with_a_demo_solver_account')
              : user.role === 'industrial_company'
                ? t('submitSolution.company_accounts_can_participate_in_discussions_technical')
                : t('submitSolution.a_complete_solver_profile_is_required_in')}
          </p>
          {permissions.canEditSolverProfile && <ProfileLink problem={problem} />}
          <Link className="text-link" to={`/problems/${problem.id}`}>
            {t('submitSolution.back_to_problem')}
          </Link>
        </section>
      )}
    </div>
  )
}
function SolutionForm({ problem }: { problem: Problem }) {
  useI18n()
  const { user } = useAuth(),
    { drafts, submissions, saveDraft, submit } = useProblems()
  const key = `${user!.id}:${problem.id}`
  const [draft, setDraft] = useState<SolutionDraft>(() => drafts[key] ?? emptySolution()),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [notice, setNotice] = useState(''),
    [banner, setBanner] = useState(true),
    [showSubmissionNotice, setShowSubmissionNotice] = useState(true),
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
      setNotice('submitSolution.selected_locally_only_the_filename_and_size')
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
      setNotice('submitSolution.a_local_proposal_already_exists_for_this')
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
          <h1 className="heading">{t('submitSolution.submit_your_solution')}</h1>
          <p className="text-muted">
            {t('submitSolution.explain_your_idea_clearly_the_company_decides')}
          </p>
        </header>
        {banner && (
          <div className="problem-message info">
            <FigmaIcon asset="a424c" size={24} />
            <p>{t('solution.match', { matched, total: problem.skills.length })}</p>
            <button
              type="button"
              aria-label={t('submitSolution.dismiss_skill_match_notice')}
              onClick={() => setBanner(false)}
            >
              ×
            </button>
          </div>
        )}
        <Textarea
          autoGrow
          className="resize-none"
          label={t('submitSolution.solution_summary')}
          required
          placeholder={t('submitSolution.explain_your_idea_how_you_ll_implement')}
          helperText={t('submitSolution.at_least_50_words_recommended')}
          value={draft.summary}
          onChange={(e) => change('summary', e.target.value)}
          error={errors.summary}
          maxLength={20000}
        />
        <div className="form-row">
          <Select
            label={t('submitSolution.proposed_delivery_time')}
            required
            value={draft.delivery}
            onChange={(e) => change('delivery', e.target.value)}
            error={errors.delivery}
          >
            {['10'].map((days) => (
              <option key={days} value={days}>
                {t('counts.days', { count: Number(days) })}
              </option>
            ))}
          </Select>
          <Input
            label={t('submitSolution.link_to_previous_work_or_a_demo')}
            placeholder="https://github.com/…"
            helperText={t('submitSolution.optional')}
            value={draft.link}
            onChange={(e) => change('link', e.target.value)}
            error={errors.link}
            type="url"
          />
        </div>
        <div className="solution-upload">
          <span className="label" id="solution-file-label">
            {t('submitSolution.attachments_optional')}
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
              <span>
                {draft.file ? draft.file.name : t('profileSetup.drag_the_file_here_or_click_to')}
              </span>
              <span className="caption text-muted">
                {draft.file
                  ? t('solution.fileSelected', { size: (draft.file.size / 1000000).toFixed(1) })
                  : t('profileSetup.pdf_or_docx_up_to_5mb')}
              </span>
            </button>
            {draft.file && (
              <button type="button" className="text-link" onClick={() => change('file', null)}>
                {t('submitSolution.remove_attachment')}
              </button>
            )}
          </div>
          {errors.file && (
            <p className="caption text-error-text" id="solution-file-error">
              {t(errors.file)}
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
            <span>{t('submitSolution.i_confirm_this_work_is_my_own')}</span>
          </label>
          {errors.terms && (
            <p className="caption text-error-text" id="solution-terms-error">
              {t(errors.terms)}
            </p>
          )}
        </div>
        <hr />
        <div className="solution-actions">
          <Button type="submit" disabled={!!submissions[key]}>
            {t('submitSolution.submit_solution')}
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              saveDraft(key, draft)
              setNotice('submitSolution.draft_saved_for_this_tab_only_reloading')
            }}
          >
            {t('askQuestion.save_as_draft')}
          </Button>
          <Button variant="ghost" type="button" onClick={cancel}>
            {t('askQuestion.cancel')}
          </Button>
        </div>
        {notice && <Notice onDismiss={() => setNotice('')}>{notice}</Notice>}
        {submissions[key] && !success && showSubmissionNotice && (
          <Notice onDismiss={() => setShowSubmissionNotice(false)}>
            {t('submitSolution.a_local_preview_solution_has_already_been')}
          </Notice>
        )}
      </form>
      <ProblemSummary problem={problem} submission />
      <Modal
        isOpen={success}
        onClose={() => setSuccess(false)}
        title={t('submitSolution.local_solution_preview_saved')}
        description={t('submitSolution.nothing_was_uploaded_or_sent_to_a')}
      >
        <Link className="button-link" to={`/problems/${problem.id}`}>
          {t('submitSolution.back_to_problem')}
        </Link>
      </Modal>
    </div>
  )
}
