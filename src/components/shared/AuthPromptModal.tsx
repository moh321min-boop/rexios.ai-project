import { useLocation, useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
export function AuthPromptModal() {
  const { showAuthPrompt, setShowAuthPrompt, authPromptDestination, authPromptReason } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  function go(path: string) {
    setShowAuthPrompt(false)
    navigate(path, {
      state: { from: authPromptDestination ?? location.pathname + location.search },
    })
  }
  return (
    <Modal
      isOpen={showAuthPrompt}
      onClose={() => setShowAuthPrompt(false)}
      className="auth-prompt"
      title={
        <>
          <img src="/figma/e1b5f.svg" alt="" width={96} height={72} />
          Join the community to participate
        </>
      }
      description={
        authPromptReason === 'Sign in to participate.'
          ? 'You can read questions and answers as a visitor, but asking, answering and reacting require an account.'
          : authPromptReason
      }
    >
      <Button className="w-full" onClick={() => go('/signup')}>
        Sign up
      </Button>
      <Button variant="secondary" className="w-full" onClick={() => go('/signin')}>
        Sign in
      </Button>
      <Button
        variant="ghost"
        className="w-full shadow-none"
        onClick={() => setShowAuthPrompt(false)}
      >
        Continue browsing
      </Button>
    </Modal>
  )
}
