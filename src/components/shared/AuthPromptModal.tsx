import { t, useI18n } from '@/i18n'
import { useLocation, useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
export function AuthPromptModal() {
  useI18n()
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
          {t('authPromptModal.join_the_community_to_participate')}
        </>
      }
      description={
        authPromptReason === 'Sign in to participate.'
          ? t('authPromptModal.you_can_read_questions_and_answers_as')
          : authPromptReason
      }
    >
      <Button className="w-full" onClick={() => go('/signup')}>
        {t('signUp.sign_up')}
      </Button>
      <Button variant="secondary" className="w-full" onClick={() => go('/signin')}>
        {t('signIn.sign_in')}
      </Button>
      <Button
        variant="ghost"
        className="w-full shadow-none"
        onClick={() => setShowAuthPrompt(false)}
      >
        {t('authPromptModal.continue_browsing')}
      </Button>
    </Modal>
  )
}
