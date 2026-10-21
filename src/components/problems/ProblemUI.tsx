import { t, useI18n, formatNumber } from '@/i18n'
import { Link } from 'react-router-dom'
import { BadgeCheck, CircleDollarSign, Clock3, Users, CircleCheck } from 'lucide-react'
import type { Problem, Difficulty } from '@/data/problems'
import { Avatar } from '@/components/ui/Avatar'
import { Tag } from '@/components/ui/Tag'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { useAuth } from '@/context/AuthContext'
import { normalizeSkill } from '@/lib/problems'
import { problemPermission } from '@/lib/auth/permissions'

export function DifficultyMark({ value }: { value: Difficulty }) {
  useI18n()
  return (
    <span className="problem-difficulty">
      {t(value)}
      <span aria-hidden="true" className={`difficulty-bars difficulty-${value.toLowerCase()}`}>
        <i />
        <i />
        <i />
      </span>
    </span>
  )
}
export function ProblemSkills({
  problem,
  matched,
  all = false,
}: {
  problem: Problem
  matched?: string[]
  all?: boolean
}) {
  useI18n()
  return (
    <div className="problem-skills">
      {problem.skills.map((skill) => (
        <Tag
          key={skill}
          name={skill.toUpperCase()}
          selected={all || matched?.some((s) => normalizeSkill(s) === normalizeSkill(skill))}
          neutral={!!matched && !matched.some((s) => normalizeSkill(s) === normalizeSkill(skill))}
        />
      ))}
    </div>
  )
}
export function Company({ problem, large = false }: { problem: Problem; large?: boolean }) {
  useI18n()
  return (
    <div className="problem-company">
      <Avatar name={problem.initial} size={large ? 'md' : 'sm'} />
      <bdi>{problem.company}</bdi>
      <BadgeCheck
        size={16}
        color="#16ad63"
        aria-label={t('problemUI.verified_company_in_design_fixture')}
      />
    </div>
  )
}
export function Reward({ value, small = false }: { value: number; small?: boolean }) {
  useI18n()
  return (
    <div className={small ? 'problem-reward-small' : 'problem-reward'}>
      {small ? (
        <CircleDollarSign size={18} aria-hidden="true" />
      ) : (
        <span className="caption">{t('problemUI.reward')}</span>
      )}
      <strong>
        {formatNumber(value)} {t('problems.dzd')}
      </strong>
    </div>
  )
}
export function ProblemCard({ problem }: { problem: Problem }) {
  useI18n()
  return (
    <article className="problem-card">
      <div className="problem-card-top">
        <Company problem={problem} />
        <span className="caption text-muted">{t(problem.age)}</span>
      </div>
      <h2 className="section-title" dir="auto">
        <Link to={`/problems/${problem.id}`}>{t(problem.title)}</Link>
      </h2>
      <p className="text-muted" dir="auto">
        {t(problem.summary)}
      </p>
      <ProblemSkills problem={problem} />
      <div className="problem-card-footer">
        <DifficultyMark value={problem.difficulty} />
        <span>
          <Clock3 size={16} aria-hidden="true" />
          {t('problem.endsIn', { duration: t('counts.days', { count: problem.days }) })}
        </span>
        <span>
          <Users size={16} aria-hidden="true" />
          {t('counts.proposals', { count: problem.proposals })}
        </span>
        <Reward value={problem.reward} small />
      </div>
    </article>
  )
}
export function ProblemBreadcrumb({
  problem,
  submit = false,
}: {
  problem?: Problem
  submit?: boolean
}) {
  useI18n()
  return (
    <nav className="problem-breadcrumb" aria-label={t('questionDetail.breadcrumb')}>
      <Link to={'/problems'}>{t('problems.problems')}</Link>
      {problem && (
        <>
          <FigmaIcon asset="60b9b" size={16} />
          {submit ? (
            <Link className="truncate" dir="auto" to={`/problems/${problem.id}`}>
              {t(problem.title)}
            </Link>
          ) : (
            <span className="truncate" dir="auto">
              {t(problem.title)}
            </span>
          )}
        </>
      )}
      {submit && (
        <>
          <FigmaIcon asset="60b9b" size={16} />
          <span>{t('problemUI.submit_a_solution')}</span>
        </>
      )}
    </nav>
  )
}
export function ProfileLink({ problem }: { problem: Problem }) {
  useI18n()
  const path = '/profile-setup'
  return (
    <Link
      className="button-link"
      to={`${path}${path.includes('?') ? '&' : '?'}returnTo=${encodeURIComponent(`/problems/${problem.id}`)}`}
    >
      {t('problemUI.complete_solver_profile')}
    </Link>
  )
}
export function ProblemSummary({
  problem,
  submission = false,
}: {
  problem: Problem
  submission?: boolean
}) {
  useI18n()
  const { user } = useAuth()
  const access = problemPermission(user, problem)
  const solverProfileComplete = access.canSubmitSolutions,
    solverSkills = user?.solverProfile.skills ?? [],
    matched = access.matchedSkills
  return (
    <aside className={`problem-summary ${submission ? 'submission-summary' : ''}`}>
      {submission && (
        <>
          <p className="caption text-muted">{t('problemUI.problem')}</p>
          <h2 className="section-title" dir="auto">
            {t(problem.title)}
          </h2>
        </>
      )}
      <Reward value={problem.reward} />
      <dl className="problem-facts">
        <div>
          <dt>{t('problems.difficulty')}</dt>
          <dd>
            <DifficultyMark value={problem.difficulty} />
          </dd>
        </div>
        <div>
          <dt>{t('problemUI.deadline')}</dt>
          <dd>{t('counts.days', { count: problem.days })}</dd>
        </div>
        {!submission && (
          <div>
            <dt>{t('problemUI.proposals_2')}</dt>
            <dd>{formatNumber(problem.proposals)}</dd>
          </div>
        )}
      </dl>
      {!submission && (
        <>
          <hr />
          <p className="label">{t('problemUI.required_skills')}</p>
        </>
      )}
      <ProblemSkills
        problem={problem}
        matched={solverProfileComplete && !submission ? solverSkills : undefined}
        all={submission}
      />
      {submission ? (
        <div className="problem-message">{t('problemUI.your_solver_profile_will_be_sent_to')}</div>
      ) : access.state === 'company' ? (
        <p className="problem-message">
          {t('problemUI.company_accounts_can_discuss_problems_solution_submission')}
        </p>
      ) : solverProfileComplete ? (
        <>
          <p className="caption problem-match">
            {t('problem.match', { matched: matched.length, total: problem.skills.length })}
          </p>
          <div className="problem-message success">
            <CircleCheck size={20} aria-hidden="true" />
            <p>
              {problem.id === 'p-101' && matched.length >= 2
                ? t('problemUI.your_skills_match_this_problem_s_requirements')
                : t('problemUI.solver_demo_you_can_preview_a_proposal')}
            </p>
          </div>
          <Link
            className="button-link problem-accent"
            to={`/problems/${problem.id}/submit-solution`}
          >
            {t('problemUI.submit_a_solution')}
          </Link>
        </>
      ) : (
        <>
          <div>
            <div className="problem-progress-label">
              <span>{t('profileSetup.solver_profile_completeness')}</span>
              <span>{user?.solverProfile.completeness ?? 0}%</span>
            </div>
            <progress
              className="profile-progress"
              aria-label={t('profileSetup.solver_profile_completeness')}
              max={100}
              value={user?.solverProfile.completeness ?? 0}
            />
          </div>
          <div className="problem-message warning">
            <FigmaIcon asset="0aee9" size={20} />
            <p>{t('problemUI.complete_your_solver_profile_education_skills_cv')}</p>
          </div>
          <ProfileLink problem={problem} />
        </>
      )}
    </aside>
  )
}
export function ProblemNotFound() {
  useI18n()
  return (
    <div className="problems-page">
      <h1 className="heading">{t('problemUI.problem_not_found')}</h1>
      <p>{t('problemUI.this_problem_is_not_included_in_the')}</p>
      <Link className="text-link" to={'/problems'}>
        {t('problemUI.back_to_problems')}
      </Link>
    </div>
  )
}
