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
  const results = filterQuestions(questions, { category, tag, sort, query })
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
            Ask a question
          </Button>
          <CategoriesSidebar
            selectedCategory={category}
            onSelectCategory={(id) => update('category', id)}
          />
        </aside>
        <section className="feed-main">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="heading">Community</h1>
            <span className="text-muted text-[14px]" aria-live="polite">
              {filtered
                ? results.length
                : 248 + questions.filter((q) => q.id.startsWith('local-')).length}{' '}
              questions
            </span>
          </div>
          <div className="search-field">
            <FigmaIcon asset="9a614" size={22} />
            <input
              ref={search}
              aria-label="Search questions"
              placeholder="Search for a question or problem…"
              value={query}
              onChange={(e) => update('q', e.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
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
                What problem are you facing today?
              </button>
              <Button variant="accent" size="sm" onClick={ask}>
                Ask a question
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
              <h2 className="section-title">No questions found</h2>
              <p>Try another search or clear the filters.</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setParams(new URLSearchParams())
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
          {results.length > limit && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => update('limit', String(limit + 4))}>
                Show more questions
              </Button>
            </div>
          )}
          <p className="caption text-muted">
            Sample community data. Preview posts, drafts and reactions stay in this browser session
            and are not sent to a server.
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
