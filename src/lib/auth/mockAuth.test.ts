import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  completeMockProfile,
  DEMO_PASSWORD,
  demoAccounts,
  mockAuthEnabled,
  PROFILE_KEY,
  restoreMockSession,
  SESSION_KEY,
  signInMock,
  signOutMock,
  signUpMock,
} from './mockAuth'
import { homeFor, permissionsFor, problemPermission, safeDestination } from './permissions'
import { problems } from '@/data/problems'
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})
describe('explicit mock authentication', () => {
  it.each(demoAccounts)(
    'validates and restores $email using only a fixture ID',
    async (account) => {
      const { user } = await signInMock(` ${account.email.toUpperCase()} `, DEMO_PASSWORD)
      expect(user.id).toBe(account.id)
      expect(sessionStorage.getItem(SESSION_KEY)).toBe(account.id)
      expect(restoreMockSession()?.id).toBe(account.id)
      expect(JSON.stringify(sessionStorage)).not.toContain(DEMO_PASSWORD)
      signOutMock()
      expect(restoreMockSession()).toBeNull()
    }
  )
  it('rejects unknown users, incorrect passwords and URL-based escalation', async () => {
    await expect(signInMock('unknown@rexios.demo', DEMO_PASSWORD)).rejects.toThrow('incorrect')
    await expect(signInMock('member@rexios.demo', 'wrong')).rejects.toThrow('incorrect')
    window.history.replaceState({}, '', '/?preview=solver')
    expect(restoreMockSession()).toBeNull()
    sessionStorage.setItem(SESSION_KEY, 'admin')
    expect(restoreMockSession()).toBeNull()
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })
  it('requires both configuration and explicit public-demo intent for production', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_PUBLIC_DEMO', 'false')
    expect(mockAuthEnabled()).toBe(false)
    await expect(signInMock('solver@rexios.demo', DEMO_PASSWORD)).rejects.toThrow('disabled')
    vi.stubEnv('VITE_PUBLIC_DEMO', 'true')
    expect(mockAuthEnabled()).toBe(true)
    vi.stubEnv('VITE_AUTH_MODE', '')
    expect(mockAuthEnabled()).toBe(false)
  })
  it('separates member role, completeness, skills and solution permission', () => {
    const [member, solver, incomplete, company] = demoAccounts
    expect(permissionsFor(member!).canSubmitSolutions).toBe(false)
    expect(permissionsFor(incomplete!).canSubmitSolutions).toBe(false)
    expect(permissionsFor(solver!).canSubmitSolutions).toBe(true)
    expect(permissionsFor(company!).canEditSolverProfile).toBe(false)
    expect(problemPermission(solver!, problems[0]!).matchedSkills).toEqual(['Python', 'Embedded'])
    expect(homeFor(member!)).toBe('/community')
    expect(homeFor(incomplete!)).toBe('/problems')
  })
  it('persists only curated profile flags and ignores malformed storage', async () => {
    const { user } = await signInMock('incomplete@rexios.demo', DEMO_PASSWORD)
    const result = completeMockProfile(user, ['Python', 'Embedded Systems', 'private free text'])
    expect(result.user.solverProfile.complete).toBe(true)
    expect(restoreMockSession()?.solverProfile.skills).toEqual(['Python', 'Embedded Systems'])
    const stored = sessionStorage.getItem(PROFILE_KEY)!
    expect(stored).not.toContain('@')
    expect(stored).not.toContain('private free text')
    expect(stored).not.toContain('Amine')
    sessionStorage.setItem(PROFILE_KEY, 'broken')
    expect(restoreMockSession()?.solverProfile.complete).toBe(false)
  })
  it('creates temporary accounts with no persisted credentials or session', async () => {
    const email = `temporary-${crypto.randomUUID()}@example.invalid`
    const user = await signUpMock(email, 'Example123!')
    expect(user.temporary).toBe(true)
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    expect(JSON.stringify(sessionStorage)).not.toContain(email)
    await expect(signInMock(email, 'wrong')).rejects.toThrow('incorrect')
    expect((await signInMock(email, 'Example123!')).user.id).toBe(user.id)
    await expect(signUpMock(email, 'Example123!')).rejects.toThrow('already')
  })
  it('degrades to memory-only sessions when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    expect((await signInMock('member@rexios.demo', DEMO_PASSWORD)).persisted).toBe(false)
  })
  it('only accepts internal, implemented return destinations', () => {
    expect(safeDestination('/problems/p-101/submit-solution')).toBe(
      '/problems/p-101/submit-solution'
    )
    expect(safeDestination('/community?preview=solver&q=sensor')).toBe('/community?q=sensor')
    for (const value of [
      'https://evil.invalid',
      '//evil.invalid',
      '/signin',
      '/\\evil.invalid',
      null,
    ])
      expect(safeDestination(value)).toBeUndefined()
  })
})
