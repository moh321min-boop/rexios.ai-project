import { t, useI18n } from '@/i18n'
import { Link, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/Button'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { useAuth } from '@/context/AuthContext'
export function AccountActivatedPage() {
  useI18n()
  const navigate = useNavigate()
  const { user, sessionNotice } = useAuth()
  return (
    <PageLayout>
      <div className="welcome-center">
        <section className="card welcome-card">
          <div className="welcome-mascot">
            <img src="/figma/ffcb3.svg" width={132} height={99} alt="Rexios AI" />
          </div>
          <h1 className="heading text-center">{t('accountActivated.your_account_is_created')}</h1>
          <p className="text-muted text-center text-[18px] leading-[1.6]">
            {t('accountActivated.you_can_now_ask_questions_comment_and')}
          </p>
          <div className="welcome-tiers">
            <div className="welcome-tier">
              <h2 className="text-[15px] leading-[1.4] font-semibold">
                {t('accountActivated.member_your_account_now')}
              </h2>
              {['Ask and answer questions', 'Comment on problems'].map((text) => (
                <p key={text}>
                  <FigmaIcon asset="311b1" size={18} />
                  {t(text)}
                </p>
              ))}
            </div>
            <div className="welcome-tier bg-sunken">
              <h2 className="text-[15px] leading-[1.4] font-semibold">
                {t('accountActivated.solver_full_profile')}
              </h2>
              {['Submit solutions to paid problems', 'Skill-match indicator'].map((text) => (
                <p key={text} className="text-muted">
                  <FigmaIcon asset="81ac7" size={18} />
                  {t(text)}
                </p>
              ))}
            </div>
          </div>
          <div className="welcome-actions">
            <Link className="button-link" to={'/community'}>
              {t('accountActivated.explore_the_community')}
            </Link>
            <Button variant="secondary" onClick={() => navigate('/problems')}>
              {t('accountActivated.browse_problems')}
            </Button>
            <Link className="text-link px-6 py-[10px]" to={'/profile-setup'}>
              {t('accountActivated.complete_solver_profile_now')}
            </Link>
          </div>
        </section>
        <p className="caption text-muted mt-6 text-center">
          {t(sessionNotice) ||
            (user?.temporary
              ? t('accountActivated.temporary_demo_account_lost_on_reload_no')
              : t('accountActivated.demo_account_only_no_real_account_has'))}
        </p>
      </div>
    </PageLayout>
  )
}
