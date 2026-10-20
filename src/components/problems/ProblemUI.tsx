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
  return (
    <span className="problem-difficulty">
      {value}
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
  return (
    <div className="problem-company">
      <Avatar name={problem.initial} size={large ? 'md' : 'sm'} />
      <span>{problem.company}</span>
      <BadgeCheck size={16} color="#16ad63" aria-label="Verified company in design fixture" />
    </div>
  )
}
export function Reward({ value, small = false }: { value: number; small?: boolean }) {
  return (
    <div className={small ? 'problem-reward-small' : 'problem-reward'}>
      {small ? (
        <CircleDollarSign size={18} aria-hidden="true" />
      ) : (
        <span className="caption">Reward</span>
      )}
      <strong>{value.toLocaleString('en-US')} DZD</strong>
    </div>
  )
}
export function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <article className="problem-card">
      <div className="problem-card-top">
        <Company problem={problem} />
        <span className="caption text-muted">{problem.age}</span>
      </div>
      <h2 className="section-title">
        <Link to={`/problems/${problem.id}`}>{problem.title}</Link>
      </h2>
      <p className="text-muted">{problem.summary}</p>
      <ProblemSkills problem={problem} />
      <div className="problem-card-footer">
        <DifficultyMark value={problem.difficulty} />
        <span>
          <Clock3 size={16} aria-hidden="true" />
          Ends in {problem.days} days
        </span>
        <span>
          <Users size={16} aria-hidden="true" />
          {problem.proposals} proposals
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
  return (
    <nav className="problem-breadcrumb" aria-label="Breadcrumb">
      <Link to={'/problems'}>Problems</Link>
      {problem && (
        <>
          <FigmaIcon asset="60b9b" size={16} />
          {submit ? (
            <Link className="truncate" to={`/problems/${problem.id}`}>
              {problem.title}
            </Link>
          ) : (
            <span className="truncate">{problem.title}</span>
          )}
        </>
      )}
      {submit && (
        <>
          <FigmaIcon asset="60b9b" size={16} />
          <span>Submit a solution</span>
        </>
      )}
    </nav>
  )
}
export function ProfileLink({ problem }: { problem: Problem }) {
  const path = '/profile-setup'
  return (
    <Link
      className="button-link"
      to={`${path}${path.includes('?') ? '&' : '?'}returnTo=${encodeURIComponent(`/problems/${problem.id}`)}`}
    >
      Complete solver profile
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
  const { user } = useAuth()
  const access = problemPermission(user, problem)
  const solverProfileComplete = access.canSubmitSolutions,
    solverSkills = user?.solverProfile.skills ?? [],
    matched = access.matchedSkills
  return (
    <aside className={`problem-summary ${submission ? 'submission-summary' : ''}`}>
      {submission && (
        <>
          <p className="caption text-muted">Problem</p>
          <h2 className="section-title">{problem.title}</h2>
        </>
      )}
      <Reward value={problem.reward} />
      <dl className="problem-facts">
        <div>
          <dt>Difficulty</dt>
          <dd>
            <DifficultyMark value={problem.difficulty} />
          </dd>
        </div>
        <div>
          <dt>Deadline</dt>
          <dd>{problem.days} days</dd>
        </div>
        {!submission && (
          <div>
            <dt>Proposals</dt>
            <dd>{problem.proposals}</dd>
          </div>
        )}
      </dl>
      {!submission && (
        <>
          <hr />
          <p className="label">Required skills</p>
        </>
      )}
      <ProblemSkills
        problem={problem}
        matched={solverProfileComplete && !submission ? solverSkills : undefined}
        all={submission}
      />
      {submission ? (
        <div className="problem-message">
          Your solver profile will be sent to the company with this proposal for evaluation.
        </div>
      ) : access.state === 'company' ? (
        <p className="problem-message">
          Company accounts can discuss problems. Solution submission is available to technical
          solvers.
        </p>
      ) : solverProfileComplete ? (
        <>
          <p className="caption problem-match">
            Your skills match {matched.length} of {problem.skills.length}
          </p>
          <div className="problem-message success">
            <CircleCheck size={20} aria-hidden="true" />
            <p>
              {problem.id === 'p-101' && matched.length >= 2
                ? "Your skills match this problem's requirements. You can submit your solution now."
                : 'Solver demo: you can preview a proposal. Production eligibility rules are not connected.'}
            </p>
          </div>
          <Link
            className="button-link problem-accent"
            to={`/problems/${problem.id}/submit-solution`}
          >
            Submit a solution
          </Link>
        </>
      ) : (
        <>
          <div>
            <div className="problem-progress-label">
              <span>Solver profile completeness</span>
              <span>{user?.solverProfile.completeness ?? 0}%</span>
            </div>
            <progress
              className="profile-progress"
              aria-label="Solver profile completeness"
              max={100}
              value={user?.solverProfile.completeness ?? 0}
            />
          </div>
          <div className="problem-message warning">
            <FigmaIcon asset="0aee9" size={20} />
            <p>
              Complete your solver profile (education, skills, CV) so the problem owner can evaluate
              your proposal.
            </p>
          </div>
          <ProfileLink problem={problem} />
        </>
      )}
    </aside>
  )
}
export function ProblemNotFound() {
  return (
    <div className="problems-page">
      <h1 className="heading">Problem not found</h1>
      <p>This problem is not included in the local preview.</p>
      <Link className="text-link" to={'/problems'}>
        Back to problems
      </Link>
    </div>
  )
}
