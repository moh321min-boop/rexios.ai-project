import { t, useI18n } from '@/i18n'
import { Link } from 'react-router-dom'
import { Eye, UserRound, MessageSquare, Check, LockKeyhole } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { RexiosLogo } from '@/components/shared/RexiosLogo'
import { VisitorBanner } from '@/components/shared/VisitorBanner'
import { useAuth } from '@/context/AuthContext'

const browsingNote = 'landing.browsing_is_free_and_open_to_everyone'
const steps = [
  {
    title: 'landing.read_freely',
    text: 'landing.browse_questions_and_answers_without_an_account',
    icon: Eye,
  },
  {
    title: 'landing.sign_up_and_participate',
    text: 'landing.create_an_account_with_email_or_google',
    icon: UserRound,
  },
  {
    title: 'landing.become_a_solver',
    text: 'landing.complete_your_solver_profile_background_skills_cv',
    icon: MessageSquare,
  },
]
const capabilities = [
  'landing.read_posts_and_problems',
  'landing.ask_questions_and_comment_on_problems',
  'landing.react_helpful_insight',
  'accountActivated.submit_solutions_to_paid_problems',
]
const roles = [
  { name: 'landing.visitor', badge: 'roles.visitorBadge', type: 'visitor', unlocked: 1 },
  { name: 'landing.member_email', badge: 'roles.memberBadge', type: 'member', unlocked: 3 },
  { name: 'landing.solver', badge: 'roles.solverBadge', type: 'solver', unlocked: 4 },
]
// Decorative pixels measured from the supplied 520 x 440 illustration panel.
const pixels = [
  [472, 16, 12],
  [236, 34, 12, 1],
  [136, 50, 8],
  [50, 86, 8, 1],
  [264, 92, 16],
  [282, 104, 12],
  [472, 210, 12],
  [64, 244, 12],
  [180, 226, 16],
  [48, 366, 16],
  [140, 366, 8],
  [376, 332, 12],
  [460, 332, 12],
  [484, 418, 12],
  [38, 418, 8, 1],
]

function CommunityIllustration() {
  useI18n()
  return (
    <div
      className="landing-art"
      role="img"
      aria-label={t('landing.rexios_pixel_dinosaur_with_a_community_question')}
    >
      <div className="landing-art-pixels" aria-hidden="true">
        {pixels.map(([x, y, size, lime], i) => (
          <i
            key={i}
            style={{
              left: `${(x! / 520) * 100}%`,
              top: `${(y! / 440) * 100}%`,
              width: `${(size! / 520) * 100}%`,
              aspectRatio: '1',
              background: lime ? 'var(--color-accent)' : '#1b3fc4',
            }}
          />
        ))}
      </div>
      <img className="landing-dinosaur" src="/figma/e5844.svg" alt="" width={360} height={270} />
      <div className="landing-question-bubble" aria-hidden="true">
        <span className="landing-art-avatar">A</span>
        <span>{t('landing.how_do_i_read_a_temperature_sensor')}</span>
      </div>
      <span className="landing-art-tag landing-iot" aria-hidden="true">
        IOT
      </span>
      <span className="landing-art-tag landing-ai" aria-hidden="true">
        AI/ML
      </span>
      <div className="landing-answer-bubble" aria-hidden="true">
        <span className="landing-art-avatar">Y</span>
        <span>
          {t('landing.try_a_kalman_filter')} <span aria-hidden="true">✓</span>
        </span>
      </div>
    </div>
  )
}

export function LandingPage() {
  useI18n()
  const { isAuthenticated } = useAuth()
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        {!isAuthenticated && (
          <div className="landing-container landing-visitor">
            <VisitorBanner message={browsingNote} />
          </div>
        )}
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-container landing-hero-grid">
            <div className="landing-intro">
              <span className="landing-badge landing-beta">{t('landing.community_beta')}</span>
              <h1 id="landing-title">
                {t('landing.where_tech_skills_meet')}
                <br className="landing-title-break" /> {t('landing.real_problems')}
              </h1>
              <p className="landing-description">
                {t('landing.an_algerian_community_where_students_developers_and')}
              </p>
              <div className="landing-actions">
                <Link className="button-link" to="/signup">
                  {t('landing.get_started')}
                </Link>
                <Link className="button-link landing-secondary" to="/community">
                  {t('landing.browse_as_a_visitor')}
                </Link>
              </div>
            </div>
            <CommunityIllustration />
          </div>
        </section>
        <section className="landing-how" id="how-it-works" aria-labelledby="landing-how-title">
          <div className="landing-container">
            <div className="landing-section-heading">
              <h2 id="landing-how-title">{t('landing.how_does_the_community_work')}</h2>
              <p>{t('landing.three_simple_steps_from_reading_to_contributing')}</p>
            </div>
            <div className="landing-three-columns landing-steps">
              {steps.map(({ title, text, icon: Icon }, i) => (
                <article className="card landing-step" key={title}>
                  <div className={`landing-step-icon ${i === 1 ? 'landing-step-member' : ''}`}>
                    <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h3>{t(title)}</h3>
                  <p>{t(text)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="landing-capabilities" aria-labelledby="landing-capabilities-title">
          <div className="landing-container">
            <div className="landing-section-heading">
              <h2 id="landing-capabilities-title">{t('landing.what_can_you_do')}</h2>
              <p>{t('landing.visitors_read_members_participate_solvers_solve_and')}</p>
            </div>
            <div className="landing-three-columns landing-role-grid">
              {roles.map((role) => (
                <article className={`card landing-role landing-role-${role.type}`} key={role.type}>
                  <span className={`landing-badge landing-badge-${role.type}`}>
                    {t(role.badge)}
                  </span>
                  <h3>{t(role.name)}</h3>
                  <ul>
                    {capabilities.map((text, i) => {
                      const available = i < role.unlocked
                      const Icon = available ? Check : LockKeyhole
                      return (
                        <li key={text} className={available ? '' : 'landing-locked'}>
                          <Icon size={22} aria-hidden="true" />
                          <span>
                            <span className="sr-only">
                              {t(
                                available
                                  ? 'landing.included'
                                  : 'landing.requires_an_upgraded_profile'
                              )}{' '}
                            </span>
                            {t(text)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </article>
              ))}
            </div>
            <section className="landing-join" aria-labelledby="landing-join-title">
              <div>
                <h2 id="landing-join-title">{t('landing.ready_to_join_the_community')}</h2>
                <p>{t('landing.create_your_account_in_under_a_minute')}</p>
              </div>
              <div className="landing-actions">
                <Link className="button-link landing-accent" to="/signup">
                  {t('landing.create_a_free_account')}
                </Link>
                <Link className="button-link landing-secondary" to="/community">
                  {t('landing.browse_as_a_visitor')}
                </Link>
              </div>
            </section>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="landing-container">
          <RexiosLogo className="text-primary" />
          <p>{t('landing.2026_rexios_ai_where_tech_skills_meet')}</p>
        </div>
      </footer>
    </div>
  )
}
