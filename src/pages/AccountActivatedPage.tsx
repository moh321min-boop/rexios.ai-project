import { Link, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/Button'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { useAuth } from '@/context/AuthContext'
export function AccountActivatedPage() {
  const navigate = useNavigate()
  const { user, sessionNotice } = useAuth()
  return (
    <PageLayout>
      <div className="welcome-center">
        <section className="card welcome-card">
          <div className="welcome-mascot">
            <img src="/figma/ffcb3.svg" width={132} height={99} alt="Rexios AI" />
          </div>
          <h1 className="heading text-center">Your account is created!</h1>
          <p className="text-muted text-center text-[18px] leading-[1.6]">
            You can now ask questions, comment and discuss problems with the community.
          </p>
          <div className="welcome-tiers">
            <div className="welcome-tier">
              <h2 className="text-[15px] leading-[1.4] font-semibold">Member (your account now)</h2>
              {['Ask and answer questions', 'Comment on problems'].map((text) => (
                <p key={text}>
                  <FigmaIcon asset="311b1" size={18} />
                  {text}
                </p>
              ))}
            </div>
            <div className="welcome-tier bg-sunken">
              <h2 className="text-[15px] leading-[1.4] font-semibold">Solver (full profile)</h2>
              {['Submit solutions to paid problems', 'Skill-match indicator'].map((text) => (
                <p key={text} className="text-muted">
                  <FigmaIcon asset="81ac7" size={18} />
                  {text}
                </p>
              ))}
            </div>
          </div>
          <div className="welcome-actions">
            <Link className="button-link" to={'/community'}>
              Explore the community
            </Link>
            <Button variant="secondary" onClick={() => navigate('/problems')}>
              Browse problems
            </Button>
            <Link className="text-link px-6 py-[10px]" to={'/profile-setup'}>
              Complete solver profile now
            </Link>
          </div>
        </section>
        <p className="caption text-muted mt-6 text-center">
          {sessionNotice ||
            (user?.temporary
              ? 'Temporary demo account — lost on reload. No server account was created.'
              : 'Demo account only — no real account has been created or activated.')}
        </p>
      </div>
    </PageLayout>
  )
}
