import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
export function RequireMember({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />
  )
}
