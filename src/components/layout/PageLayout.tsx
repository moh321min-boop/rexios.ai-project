import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { AuthPromptModal } from '@/components/shared/AuthPromptModal'
export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-page text-ink min-h-screen">
      <Navbar />
      <main>{children}</main>
      <AuthPromptModal />
    </div>
  )
}
