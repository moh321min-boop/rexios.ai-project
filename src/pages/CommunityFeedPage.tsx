import { t, useI18n } from '@/i18n'
import { questionText } from '@/i18n/community'
import { useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCommunity } from '@/context/CommunityContext'
import { VisitorBanner } from '@/components/shared/VisitorBanner'
import { CategoriesSidebar } from '@/features/community/CategoriesSidebar'
import { QuestionCard } from '@/features/community/QuestionCard'
import { TopContributorsWidget } from '@/features/community/TopContributorsWidget'
import { PopularTagsWidget } from '@/features/community/PopularTagsWidget'
import { CommunityRulesWidget } from '@/features/community/CommunityRulesWidget'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Avatar } from '@/components/ui/Avatar'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { filterQuestions } from '@/lib/community'
export function CommunityFeedPage() {
  useI18n()
  const { user, isAuthenticated, triggerAuthPrompt } = useAuth()
  const { questions } = useCommunity()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const search = useRef<HTMLInputElement>(null)
  const category = params.get('category') || 'cat-all',
    tag = params.get('tag') || '',
    sort = params.get('sort') || 'newest',
    query = params.get('q') || ''
  const limit = Math.max(4, Number(params.get('limit')) || 4)
  const results = filterQuestions(
    questions,
    { category, tag, sort, query },
    (question) =>
      `${questionText(question, 'title')} ${questionText(question, 'summary')} ${questionText(question, 'body')}`
  )
  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'limit') next.delete('limit')
    setParams(next, { replace: key === 'q' })
  }
  function ask() {
    if (isAuthenticated) navigate('/community/ask')
    else triggerAuthPrompt('Sign in to ask a question.', '/community/ask')
  }
  const filtered = category !== 'cat-all' || !!tag || !!query || sort === 'unanswered'
  return (
    <div className="community-content">
      {!isAuthenticated && <VisitorBanner />}
      <div className="feed-columns">
        <aside className="feed-categories">
          <Button variant="accent" className="w-full" onClick={ask}>
            {t('askQuestion.ask_a_question')}
          </Button>
          <CategoriesSidebar
            selectedCategory={category}
            onSelectCategory={(id) => update('category', id)}
          />
        </aside>
        <section className="feed-main">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="heading">{t('communityFeed.community')}</h1>
            <span className="text-muted text-[14px]" aria-live="polite">
              {t('counts.questions', {
                count: filtered
                  ? results.length
                  : 248 + questions.filter((q) => q.id.startsWith('local-')).length,
              })}
            </span>
          </div>
          <div className="search-field">
            <FigmaIcon asset="9a614" size={22} />
            <input
              ref={search}
              aria-label={t('communityFeed.search_questions')}
              placeholder={t('communityFeed.search_for_a_question_or_problem')}
              value={query}
              onChange={(e) => update('q', e.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label={t('communityFeed.clear_search')}
                onClick={() => {
                  update('q', '')
                  search.current?.focus()
                }}
              >
                <FigmaIcon asset="bbd93" size={18} />
              </button>
            )}
          </div>
          {isAuthenticated && (
            <div className="ask-composer">
              <Avatar name={user?.displayName ?? 'Member'} />
              <button type="button" className="composer-prompt" onClick={ask}>
                {t('communityFeed.what_problem_are_you_facing_today')}
              </button>
              <Button variant="accent" size="sm" onClick={ask}>
                {t('askQuestion.ask_a_question')}
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-[10px]">
            {(
              [
                ['newest', 'Newest'],
                ['active', 'Most active'],
                ['unanswered', 'Unanswered'],
              ] as const
            ).map(([id, label]) => (
              <Chip key={id} selected={sort === id} onClick={() => update('sort', id)}>
                {label}
              </Chip>
            ))}
            {tag && (
              <Chip selected removable onClick={() => update('tag', '')}>
                {tag.toUpperCase()}
              </Chip>
            )}
          </div>
          {results.length ? (
            results
              .slice(0, limit)
              .map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onTagClick={(slug) => update('tag', slug === tag ? '' : slug)}
                />
              ))
          ) : (
            <div className="widget" role="status">
              <h2 className="section-title">{t('communityFeed.no_questions_found')}</h2>
              <p>{t('communityFeed.try_another_search_or_clear_the_filters')}</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setParams(new URLSearchParams())
                }}
              >
                {t('communityFeed.clear_filters')}
              </Button>
            </div>
          )}
          {results.length > limit && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => update('limit', String(limit + 4))}>
                {t('communityFeed.show_more_questions')}
              </Button>
            </div>
          )}
          <p className="caption text-muted">
            {t('communityFeed.sample_community_data_preview_posts_drafts_and')}
          </p>
        </section>
        <aside className="feed-widgets">
          <TopContributorsWidget />
          <PopularTagsWidget
            selectedTag={tag}
            onTagSelect={(slug) => update('tag', tag === slug ? '' : slug)}
          />
          <CommunityRulesWidget />
        </aside>
      </div>
    </div>
  )
}
