import { Notice } from '@/components/shared/Notice'
import { t, useI18n } from '@/i18n'
import { useRef, useState, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Chip } from '@/components/ui/Chip'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { focusFirstError, isWebLink } from '@/lib/forms'
import { useAuth } from '@/context/AuthContext'

const skills = [
  'Python',
  'C',
  'C++',
  'JavaScript',
  'React',
  'SQL',
  'Embedded Systems',
  'IoT',
  'AI / ML',
  'Robotics',
  'Backend',
  'Arduino',
]
const perks = [
  'accountActivated.submit_solutions_to_paid_problems',
  'profileSetup.your_profile_is_shown_to_companies_when',
  'profileSetup.track_the_status_of_your_proposals_under',
  'profileSetup.a_skill_match_indicator_for_every_problem',
]
export function ProfileSetupPage() {
  useI18n()
  const navigate = useNavigate()
  const { user, completeSolverProfile, permissions } = useAuth()
  const filled = !!user && !user.temporary
  const [values, setValues] = useState({
    first: filled ? (user!.displayName.split(' ')[0] ?? '') : '',
    last: filled ? user!.displayName.split(' ').slice(1).join(' ') : '',
    education: filled ? "Year 2 — Bachelor's" : '',
    major: filled ? 'Computer Engineering — USTHB' : '',
    experience: filled ? 'Student / recent graduate' : '',
    github: '',
    linkedin: '',
  })
  const [selected, setSelected] = useState<string[]>(user?.solverProfile.skills ?? [])
  const [file, setFile] = useState<{ name: string; size: number } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  const picker = useRef<HTMLInputElement>(null)
  const hasEvidence =
    !!file || !!values.github.trim() || !!values.linkedin.trim() || !!user?.solverProfile.complete
  const completeness = Math.round(
    ([
      values.first.trim(),
      values.last.trim(),
      values.education,
      values.major.trim(),
      values.experience,
      selected.length,
      hasEvidence,
    ].filter(Boolean).length /
      7) *
      100
  )
  function chooseFile(next?: File) {
    if (!next) return
    if (!/\.(pdf|docx)$/i.test(next.name) || next.size > 5 * 1024 * 1024 || next.size === 0) {
      setErrors((e) => ({ ...e, cv: 'profileSetup.choose_a_pdf_or_docx_file_up' }))
      return
    }
    setFile({ name: next.name, size: next.size })
    setErrors((e) => ({ ...e, cv: '' }))
    setNotice('profileSetup.file_selected_locally_no_file_has_been')
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!values.first.trim()) next.first = 'profileSetup.first_name_is_required'
    if (!values.last.trim()) next.last = 'profileSetup.last_name_is_required'
    if (!values.education) next.education = 'profileSetup.please_select_a_level'
    if (!values.major.trim()) next.major = 'profileSetup.enter_your_major_and_institution'
    if (!values.experience) next.experience = 'profileSetup.please_select_your_experience_level'
    if (!selected.length) next.skills = 'profileSetup.choose_at_least_one_skill'
    if (!hasEvidence) next.cv = 'profileSetup.upload_your_cv_or_add_at_least'
    if (!isWebLink(values.github)) next.github = 'profileSetup.enter_a_valid_website_url'
    if (!isWebLink(values.linkedin)) next.linkedin = 'profileSetup.enter_a_valid_profile_url'
    setErrors(next)
    if (Object.keys(next).length) {
      focusFirstError()
      return
    }
    if (user && permissions.canEditSolverProfile) {
      const returnTo = new URLSearchParams(location.search).get('returnTo')
      completeSolverProfile(selected)
      navigate(
        returnTo && /^\/problems\/[a-zA-Z0-9-]+$/.test(returnTo) ? returnTo : '/account-activated'
      )
    } else setNotice('profileSetup.profile_saving_is_not_connected_your_entries')
  }
  const field = (key: keyof typeof values) => ({
    value: values[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues({ ...values, [key]: e.target.value }),
    error: errors[key],
  })
  if (!permissions.canEditSolverProfile)
    return (
      <PageLayout>
        <div className="app-content">
          <h1 className="heading">{t('profileSetup.solver_profile_unavailable')}</h1>
          <p>{t('profileSetup.this_account_cannot_edit_a_technical_solver')}</p>
        </div>
      </PageLayout>
    )
  return (
    <PageLayout>
      <div className="app-content profile-content">
        <form noValidate onSubmit={submit} className="card profile-form">
          <div>
            <h1 className="heading">{t('profileSetup.solver_profile')}</h1>
            <p className="text-muted mt-1">
              {t('profileSetup.fields_marked_with_are_required_this_information')}
            </p>
          </div>
          <div className="flex flex-col gap-[6px]">
            <div className="flex justify-between gap-3">
              <span className="caption text-muted">
                {t('profileSetup.solver_profile_completeness')}
              </span>
              <span className="label text-primary">{completeness}%</span>
            </div>
            <progress
              className="profile-progress"
              aria-label={t('profileSetup.solver_profile_completeness')}
              max={100}
              value={completeness}
            />
          </div>
          {Object.values(errors).some(Boolean) && (
            <p role="alert" className="form-alert">
              {t('profileSetup.please_fix_the_highlighted_fields_before_saving')}
            </p>
          )}
          <div className="form-row">
            <Input
              label={t('profileSetup.first_name')}
              required
              autoComplete="given-name"
              placeholder={t('profileSetup.enter_your_first_name')}
              {...field('first')}
            />
            <Input
              label={t('profileSetup.last_name')}
              required
              autoComplete="family-name"
              placeholder={t('profileSetup.enter_your_last_name')}
              {...field('last')}
            />
          </div>
          <div className="form-row">
            <Select label={t('profileSetup.education_level')} required {...field('education')}>
              <option value="">{t('profileSetup.select_your_education_level')}</option>
              {[
                "Year 1 — Bachelor's",
                "Year 2 — Bachelor's",
                "Year 3 — Bachelor's",
                "Master's",
                'PhD',
                'Other',
              ].map((x) => (
                <option key={x} value={x}>
                  {t(x)}
                </option>
              ))}
            </Select>
            <Input
              label={t('profileSetup.major_and_institution')}
              required
              placeholder={t('profileSetup.e_g_computer_engineering_usthb')}
              {...field('major')}
            />
          </div>
          <Select label={t('profileSetup.experience_level')} required {...field('experience')}>
            <option value="">{t('profileSetup.select_your_experience_level')}</option>
            {['Student / recent graduate', '1–3 years', '3–5 years', '5+ years'].map((x) => (
              <option key={x} value={x}>
                {t(x)}
              </option>
            ))}
          </Select>
          <fieldset className="flex min-w-0 flex-col gap-[10px]">
            <legend className="label mb-[10px]">
              {t('profileSetup.skills_choose_at_least_one')}
            </legend>
            <div
              className="flex flex-wrap gap-[10px]"
              tabIndex={-1}
              aria-invalid={!!errors.skills}
              aria-describedby={errors.skills ? 'skills-error' : undefined}
            >
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  selected={selected.includes(skill)}
                  removable
                  onClick={() =>
                    setSelected((s) =>
                      s.includes(skill) ? s.filter((x) => x !== skill) : [...s, skill]
                    )
                  }
                >
                  {skill}
                </Chip>
              ))}
            </div>
            {errors.skills && (
              <p id="skills-error" className="caption text-error-text">
                {t(errors.skills)}
              </p>
            )}
            <p className="caption text-muted">
              {t('profileSetup.your_skills_are_used_to_compute_your')}
            </p>
          </fieldset>
          <div className="flex flex-col gap-2">
            <span id="cv-label" className="label">
              {t('profileSetup.cv_r_sum')}
            </span>
            <input
              ref={picker}
              type="file"
              accept=".pdf,.docx"
              className="sr-only"
              tabIndex={-1}
              aria-labelledby="cv-label"
              onChange={(e) => {
                chooseFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            <div
              className={`upload-box ${file ? 'upload-filled' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                chooseFile(e.dataTransfer.files[0])
              }}
            >
              {file ? (
                <>
                  <div className="flex items-center justify-center gap-[10px]">
                    <FigmaIcon asset="2c98d" size={24} />
                    <span className="label break-all">{file.name}</span>
                    <button
                      type="button"
                      aria-label={t('profileSetup.remove_cv')}
                      onClick={() => {
                        setFile(null)
                        setNotice('')
                      }}
                    >
                      <FigmaIcon asset="bbd93" size={18} />
                    </button>
                  </div>
                  <p className="caption text-muted">
                    {(file.size / 1000000).toFixed(1)}
                    {t('profileSetup.mb')}{' '}
                    {filled && !notice
                      ? t('profileSetup.preview_file')
                      : t('profileSetup.selected_locally')}
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => picker.current?.click()}
                  aria-invalid={!!errors.cv}
                  aria-describedby={errors.cv ? 'cv-error' : undefined}
                  className="flex w-full flex-col items-center gap-2"
                >
                  <FigmaIcon asset="bc4f0" size={28} />
                  <span className="label">{t('profileSetup.drag_the_file_here_or_click_to')}</span>
                  <span className="caption text-muted">
                    {t('profileSetup.pdf_or_docx_up_to_5mb')}
                  </span>
                </button>
              )}
            </div>
            {errors.cv && (
              <p id="cv-error" className="caption text-error-text">
                {t(errors.cv)}
              </p>
            )}
            <p className="caption text-muted">
              {t('profileSetup.or_add_a_link_to_your_professional')}
            </p>
            {user?.solverProfile.complete && (
              <p className="caption text-muted">
                {t('profileSetup.your_demo_completion_flag_is_saved_cv')}
              </p>
            )}
          </div>
          <div className="form-row">
            <Input
              label={t('profileSetup.github_personal_website')}
              placeholder="github.com/username"
              type="url"
              {...field('github')}
            />
            <Input
              label="LinkedIn"
              type="url"
              placeholder="linkedin.com/in/username"
              {...field('linkedin')}
            />
          </div>
          <div className="bg-subtle h-[2px]" />
          <div className="form-actions">
            <Button type="submit">{t('profileSetup.save_solver_profile')}</Button>
            <p className="caption text-muted">
              {t('profileSetup.you_can_edit_your_profile_any_time')}
            </p>
          </div>
          {notice && <Notice onDismiss={() => setNotice('')}>{notice}</Notice>}
        </form>
        <aside className="solver-perks">
          <img src="/figma/e1b5f.svg" width={120} height={90} alt="Rexios AI" />
          <h2 className="section-title">{t('profileSetup.what_does_a_solver_profile_unlock')}</h2>
          {perks.map((perk) => (
            <p className="flex items-start gap-[10px]" key={perk}>
              <FigmaIcon asset="3d3b0" size={20} />
              {t(perk)}
            </p>
          ))}
        </aside>
      </div>
    </PageLayout>
  )
}
