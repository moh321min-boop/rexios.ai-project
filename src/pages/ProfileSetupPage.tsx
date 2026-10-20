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
  'Submit solutions to paid problems',
  'Your profile is shown to companies when you submit a proposal',
  'Track the status of your proposals (under review, accepted, rejected)',
  'A skill-match indicator for every problem',
]
export function ProfileSetupPage() {
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
      setErrors((e) => ({ ...e, cv: 'Choose a PDF or DOCX file up to 5MB.' }))
      return
    }
    setFile({ name: next.name, size: next.size })
    setErrors((e) => ({ ...e, cv: '' }))
    setNotice('File selected locally. No file has been uploaded.')
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!values.first.trim()) next.first = 'First name is required'
    if (!values.last.trim()) next.last = 'Last name is required'
    if (!values.education) next.education = 'Please select a level'
    if (!values.major.trim()) next.major = 'Enter your major and institution'
    if (!values.experience) next.experience = 'Please select your experience level'
    if (!selected.length) next.skills = 'Choose at least one skill'
    if (!hasEvidence) next.cv = 'Upload your CV or add at least one link below'
    if (!isWebLink(values.github)) next.github = 'Enter a valid website URL'
    if (!isWebLink(values.linkedin)) next.linkedin = 'Enter a valid profile URL'
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
    } else
      setNotice(
        'Profile saving is not connected. Your entries remain on this page; nothing was uploaded or saved to a server.'
      )
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
          <h1 className="heading">Solver profile unavailable</h1>
          <p>
            This account cannot edit a technical solver profile. Company problem management is not
            implemented.
          </p>
        </div>
      </PageLayout>
    )
  return (
    <PageLayout>
      <div className="app-content profile-content">
        <form noValidate onSubmit={submit} className="card profile-form">
          <div>
            <h1 className="heading">Solver profile</h1>
            <p className="text-muted mt-1">
              Fields marked with * are required. This information is shown to the company only when
              you submit a solution.
            </p>
          </div>
          <div className="flex flex-col gap-[6px]">
            <div className="flex justify-between gap-3">
              <span className="caption text-muted">Solver profile completeness</span>
              <span className="label text-primary">{completeness}%</span>
            </div>
            <progress
              className="profile-progress"
              aria-label="Solver profile completeness"
              max={100}
              value={completeness}
            />
          </div>
          {Object.values(errors).some(Boolean) && (
            <p role="alert" className="form-alert">
              Please fix the highlighted fields before saving.
            </p>
          )}
          <div className="form-row">
            <Input
              label="First name"
              required
              autoComplete="given-name"
              placeholder="Enter your first name"
              {...field('first')}
            />
            <Input
              label="Last name"
              required
              autoComplete="family-name"
              placeholder="Enter your last name"
              {...field('last')}
            />
          </div>
          <div className="form-row">
            <Select label="Education level" required {...field('education')}>
              <option value="">Select your education level</option>
              {[
                "Year 1 — Bachelor's",
                "Year 2 — Bachelor's",
                "Year 3 — Bachelor's",
                "Master's",
                'PhD',
                'Other',
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </Select>
            <Input
              label="Major and institution"
              required
              placeholder="e.g. Computer Engineering — USTHB"
              {...field('major')}
            />
          </div>
          <Select label="Experience level" required {...field('experience')}>
            <option value="">Select your experience level</option>
            {['Student / recent graduate', '1–3 years', '3–5 years', '5+ years'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <fieldset className="flex min-w-0 flex-col gap-[10px]">
            <legend className="label mb-[10px]">Skills * — choose at least one</legend>
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
                {errors.skills}
              </p>
            )}
            <p className="caption text-muted">
              Your skills are used to compute your match with each problem.
            </p>
          </fieldset>
          <div className="flex flex-col gap-2">
            <span id="cv-label" className="label">
              CV (résumé) *
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
                      aria-label="Remove CV"
                      onClick={() => {
                        setFile(null)
                        setNotice('')
                      }}
                    >
                      <FigmaIcon asset="bbd93" size={18} />
                    </button>
                  </div>
                  <p className="caption text-muted">
                    {(file.size / 1000000).toFixed(1)}MB —{' '}
                    {filled && !notice ? 'preview file' : 'selected locally'}
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
                  <span className="label">Drag the file here or click to choose</span>
                  <span className="caption text-muted">PDF or DOCX — up to 5MB</span>
                </button>
              )}
            </div>
            {errors.cv && (
              <p id="cv-error" className="caption text-error-text">
                {errors.cv}
              </p>
            )}
            <p className="caption text-muted">
              Or add a link to your professional profile below (optional if you uploaded a CV)
            </p>
            {user?.solverProfile.complete && (
              <p className="caption text-muted">
                Your demo completion flag is saved. CV files, names and profile links are not
                stored.
              </p>
            )}
          </div>
          <div className="form-row">
            <Input
              label="GitHub / personal website"
              placeholder="github.com/username"
              {...field('github')}
            />
            <Input label="LinkedIn" placeholder="linkedin.com/in/username" {...field('linkedin')} />
          </div>
          <div className="bg-subtle h-[2px]" />
          <div className="form-actions">
            <Button type="submit">Save solver profile</Button>
            <p className="caption text-muted">You can edit your profile any time from settings.</p>
          </div>
          {notice && (
            <p role="status" className="inline-notice">
              {notice}
            </p>
          )}
        </form>
        <aside className="solver-perks">
          <img src="/figma/e1b5f.svg" width={120} height={90} alt="Rexios AI" />
          <h2 className="section-title">What does a solver profile unlock?</h2>
          {perks.map((perk) => (
            <p className="flex items-start gap-[10px]" key={perk}>
              <FigmaIcon asset="3d3b0" size={20} />
              {perk}
            </p>
          ))}
        </aside>
      </div>
    </PageLayout>
  )
}
