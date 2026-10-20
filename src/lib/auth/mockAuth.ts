import type { User } from '@/types'

export interface SolverProfile {
  complete: boolean
  completeness: number
  skills: string[]
}
export interface DemoUser extends User {
  accountKind: 'member' | 'solver' | 'company'
  solverProfile: SolverProfile
  temporary?: boolean
}
export const SESSION_KEY = 'rexios.demo.session.v1'
export const PROFILE_KEY = 'rexios.demo.profiles.v1'
export const DEMO_PASSWORD = 'RexiosDemo123!'
export function mockAuthEnabled(env = import.meta.env) {
  return env.VITE_AUTH_MODE === 'mock' && (env.DEV || env.VITE_PUBLIC_DEMO === 'true')
}
export const authUnavailable =
  'Authentication is unavailable. Mock login is disabled and no backend authentication provider is connected.'
const base = { joinedAt: '2026-01-01T00:00:00Z', isVerified: false }
export const demoAccounts: DemoUser[] = [
  {
    ...base,
    id: 'demo-member',
    email: 'member@rexios.demo',
    username: 'sara',
    displayName: 'Sara Kasmi',
    role: 'technical_talent',
    accountKind: 'member',
    solverProfile: { complete: false, completeness: 0, skills: [] },
  },
  {
    ...base,
    id: 'demo-solver',
    email: 'solver@rexios.demo',
    username: 'karim',
    displayName: 'Karim Haddad',
    role: 'technical_talent',
    accountKind: 'solver',
    solverProfile: { complete: true, completeness: 100, skills: ['Python', 'Embedded Systems'] },
  },
  {
    ...base,
    id: 'demo-incomplete',
    email: 'incomplete@rexios.demo',
    username: 'amine',
    displayName: 'Amine Ben Ali',
    role: 'technical_talent',
    accountKind: 'solver',
    solverProfile: { complete: false, completeness: 40, skills: ['Python', 'IoT'] },
  },
  {
    ...base,
    id: 'demo-company',
    email: 'company@rexios.demo',
    username: 'orient',
    displayName: 'Orient Textile Co.',
    role: 'industrial_company',
    accountKind: 'company',
    solverProfile: { complete: false, completeness: 0, skills: [] },
  },
]
// Public fixtures, never production authorization. Only fixed IDs and curated skill flags
// enter sessionStorage; names, emails, passwords, CVs and URLs never do.
const knownSkills = [
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
const temporaryAccounts = new Map<string, { user: DemoUser; passwordHash: string }>()
function read(key: string) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}
function profiles(): Record<string, SolverProfile> {
  try {
    const value: unknown = JSON.parse(read(PROFILE_KEY) ?? '{}')
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, SolverProfile>)
      : {}
  } catch {
    return {}
  }
}
function hydrate(seed: DemoUser): DemoUser {
  const value = profiles()[seed.id]
  const valid =
    value?.complete === true &&
    Array.isArray(value.skills) &&
    value.skills.length > 0 &&
    value.skills.every((s) => knownSkills.includes(s))
  return structuredClone(
    valid && seed.role === 'technical_talent'
      ? {
          ...seed,
          accountKind: 'solver',
          solverProfile: { complete: true, completeness: 100, skills: value.skills },
        }
      : seed
  )
}
export function restoreMockSession(): DemoUser | null {
  if (!mockAuthEnabled()) return null
  const seed = demoAccounts.find((u) => u.id === read(SESSION_KEY))
  if (!seed) {
    write(SESSION_KEY, null)
    return null
  }
  return hydrate(seed)
}
async function digest(password: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}
export async function signInMock(
  email: string,
  password: string
): Promise<{ user: DemoUser; persisted: boolean }> {
  if (!mockAuthEnabled()) throw new Error(authUnavailable)
  const normalized = email.trim().toLowerCase(),
    seed = demoAccounts.find((u) => u.email === normalized)
  const temporary = Array.from(temporaryAccounts.values()).find((x) => x.user.email === normalized)
  if (seed && password === DEMO_PASSWORD) {
    const user = hydrate(seed)
    return { user, persisted: write(SESSION_KEY, user.id) }
  }
  if (temporary && temporary.passwordHash === (await digest(password))) {
    write(SESSION_KEY, null)
    return { user: structuredClone(temporary.user), persisted: false }
  }
  throw new Error(
    'Email or password is incorrect. Use a documented demo account or a temporary account created in this tab.'
  )
}
export async function signUpMock(email: string, password: string): Promise<DemoUser> {
  if (!mockAuthEnabled()) throw new Error(authUnavailable)
  const normalized = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || password.length < 8 || !/\d/.test(password))
    throw new Error(
      'Enter a valid email and a password of at least 8 characters including a digit.'
    )
  if (
    demoAccounts.some((u) => u.email === normalized) ||
    Array.from(temporaryAccounts.values()).some((x) => x.user.email === normalized)
  )
    throw new Error('This email already belongs to a demo account. Sign in instead.')
  const user: DemoUser = {
    ...base,
    id: `temporary-${crypto.randomUUID()}`,
    email: normalized,
    username: 'temporary-member',
    displayName: 'New member',
    role: 'technical_talent',
    accountKind: 'member',
    temporary: true,
    solverProfile: { complete: false, completeness: 0, skills: [] },
  }
  temporaryAccounts.set(user.id, { user, passwordHash: await digest(password) })
  write(SESSION_KEY, null)
  return structuredClone(user)
}
export function completeMockProfile(
  user: DemoUser,
  skills: string[]
): { user: DemoUser; persisted: boolean } {
  if (!mockAuthEnabled() || user.role !== 'technical_talent')
    throw new Error('This account cannot edit a solver profile.')
  const selected = [...new Set(skills.filter((s) => knownSkills.includes(s)))]
  if (!selected.length) throw new Error('Choose at least one supported skill.')
  const next: DemoUser = {
    ...user,
    accountKind: 'solver',
    solverProfile: { complete: true, completeness: 100, skills: selected },
  }
  if (user.temporary) {
    const item = temporaryAccounts.get(user.id)
    if (item) temporaryAccounts.set(user.id, { ...item, user: next })
    return { user: next, persisted: false }
  }
  const all = profiles()
  const clean = Object.fromEntries(
    demoAccounts
      .filter((a) => a.role === 'technical_talent' && all[a.id]?.complete === true)
      .map((a) => [
        a.id,
        {
          complete: true,
          completeness: 100,
          skills: Array.isArray(all[a.id]?.skills)
            ? all[a.id]!.skills.filter((s) => knownSkills.includes(s))
            : [],
        },
      ])
  )
  return {
    user: next,
    persisted: write(PROFILE_KEY, JSON.stringify({ ...clean, [user.id]: next.solverProfile })),
  }
}
export function signOutMock() {
  write(SESSION_KEY, null)
}
