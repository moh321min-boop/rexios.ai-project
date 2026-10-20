import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  completeMockProfile,
  mockAuthEnabled,
  restoreMockSession,
  signInMock,
  signOutMock,
  signUpMock,
  type DemoUser,
} from '@/lib/auth/mockAuth'
import { permissionsFor } from '@/lib/auth/permissions'
interface AuthContextType {
  user: DemoUser | null
  isAuthenticated: boolean
  mockEnabled: boolean
  login: (email: string, password: string) => Promise<DemoUser>
  register: (email: string, password: string) => Promise<DemoUser>
  logout: () => void
  completeSolverProfile: (skills: string[]) => void
  permissions: ReturnType<typeof permissionsFor>
  showAuthPrompt: boolean
  setShowAuthPrompt: (show: boolean) => void
  authPromptReason: string
  authPromptDestination: string | undefined
  triggerAuthPrompt: (reason?: string, destination?: string) => void
  sessionNotice: string
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(restoreMockSession)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false),
    [authPromptReason, setReason] = useState('Sign in to participate.'),
    [authPromptDestination, setDestination] = useState<string>(),
    [sessionNotice, setSessionNotice] = useState('')
  async function login(email: string, password: string) {
    const result = await signInMock(email, password)
    setUser(result.user)
    setShowAuthPrompt(false)
    setSessionNotice(
      result.persisted
        ? ''
        : result.user.temporary
          ? 'Temporary account: lost on reload.'
          : 'Browser session storage is unavailable. Sign in again after refresh.'
    )
    return result.user
  }
  async function register(email: string, password: string) {
    const next = await signUpMock(email, password)
    setUser(next)
    setSessionNotice('Temporary demo account: lost on reload. No server-side account was created.')
    return next
  }
  function logout() {
    signOutMock()
    setUser(null)
    setShowAuthPrompt(false)
    setDestination(undefined)
    setSessionNotice('')
  }
  function completeSolverProfile(skills: string[]) {
    if (!user) return
    const result = completeMockProfile(user, skills)
    setUser(result.user)
    setSessionNotice(
      result.persisted
        ? 'Demo profile flags saved for this tab. No CV or personal details were stored.'
        : 'Profile updated in memory only; it will be lost on reload.'
    )
  }
  function triggerAuthPrompt(reason = 'Sign in to participate.', destination?: string) {
    setReason(reason)
    setDestination(destination)
    setShowAuthPrompt(true)
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        mockEnabled: mockAuthEnabled(),
        login,
        register,
        logout,
        completeSolverProfile,
        permissions: permissionsFor(user),
        showAuthPrompt,
        setShowAuthPrompt,
        authPromptReason,
        authPromptDestination,
        triggerAuthPrompt,
        sessionNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
