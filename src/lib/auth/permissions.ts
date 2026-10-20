import type { DemoUser } from './mockAuth'
import type { Problem } from '@/data/problems'
import { normalizeSkill } from '@/lib/problems'
export function permissionsFor(user: DemoUser | null) {
  return {
    canParticipate: !!user,
    canEditSolverProfile: user?.role === 'technical_talent',
    canSubmitSolutions: user?.role === 'technical_talent' && user.solverProfile.complete,
  }
}
export function problemPermission(user: DemoUser | null, problem: Problem) {
  return {
    ...permissionsFor(user),
    matchedSkills: problem.skills.filter((s) =>
      user?.solverProfile.skills.some((t) => normalizeSkill(s) === normalizeSkill(t))
    ),
    state: !user
      ? 'visitor'
      : user.role === 'industrial_company'
        ? 'company'
        : user.solverProfile.complete
          ? 'eligible'
          : 'incomplete',
  }
}
export function homeFor(user: DemoUser) {
  return user.accountKind === 'member' ? '/community' : '/problems'
}
export function safeDestination(value: unknown): string | undefined {
  if (
    typeof value !== 'string' ||
    !/^\/(?:community(?:\/ask|\/questions\/[\w-]+)?|problems(?:\/[\w-]+(?:\/submit-solution)?)?|profile-setup|account-activated)(?:\?[^#]*)?$/.test(
      value
    ) ||
    value.includes('\\')
  )
    return undefined
  const url = new URL(value, 'https://rexios.invalid')
  url.searchParams.delete('preview')
  url.searchParams.delete('state')
  return url.pathname + url.search
}
