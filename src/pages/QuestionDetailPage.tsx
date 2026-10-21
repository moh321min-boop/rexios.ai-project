import { t, useI18n } from '@/i18n'
import { questionText } from '@/i18n/community'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Chip } from '@/components/ui/Chip'
import { useCommunity } from '@/context/CommunityContext'
import { Avatar } from '@/components/ui/Avatar'
import { Tag } from '@/components/ui/Tag'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { Reactions } from '@/components/shared/Reactions'
import { FormattedText } from '@/components/shared/FormattedText'
import { AnswerCard } from '@/features/questions/AnswerCard'
import { AnswerInputForm } from '@/features/questions/AnswerInputForm'
import { RELATED_QUESTIONS } from '@/data/mockData'
import { formatRelativeTime } from '@/lib/utils'
export function QuestionDetailPage() {
  useI18n()
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const sort = params.get('answers') || 'helpful'
  const { questions, answers } = useCommunity()
  const question = questions.find((item) => item.id === id)
  if (!question)
    return (
      <section className="app-content">
        <div className="widget">
          <h1 className="heading">{t('questionDetail.question_not_found')}</h1>
          <p>{t('questionDetail.this_question_is_unavailable_in_the_current')}</p>
          <Link className="text-link" to={'/community'}>
            {t('questionDetail.back_to_community')}
          </Link>
        </div>
      </section>
    )
  const list = [...(answers[question.id] || [])].sort((a, b) =>
    sort === 'newest'
      ? Date.parse(b.createdAt) - Date.parse(a.createdAt)
      : b.voteCount - a.voteCount
  )
  const time = question.timeLabel || formatRelativeTime(question.createdAt)
  return (
    <div className="question-content">
      <nav aria-label={t('questionDetail.breadcrumb')} className="question-breadcrumb">
        <Link className="text-link" to={'/community'}>
          {t('communityFeed.community')}
        </Link>
        <FigmaIcon asset="60b9b" size={16} />
        <span aria-current="page" dir="auto" title={questionText(question, 'title')}>
          {questionText(question, 'title')}
        </span>
      </nav>
      <div className="question-columns">
        <div className="question-main">
          <article className="question-detail">
            <div className="author-row">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={question.author.displayName} />
                <div>
                  <p className="label">{question.author.displayName}</p>
                  {question.authorRole && (
                    <p className="caption text-muted">{questionText(question, 'authorRole')}</p>
                  )}
                </div>
              </div>
              <p className="caption text-muted">
                {t(time)} · {t('counts.views', { count: question.viewCount })}
              </p>
            </div>
            <h1 className="heading" dir="auto">
              {questionText(question, 'title')}
            </h1>
            <FormattedText
              text={
                question.id.startsWith('related-')
                  ? t('mockData.the_saved_design_includes_this_question_title')
                  : questionText(question, 'body')
              }
            />
            {question.code && (
              <pre className="code-block">
                <code>{question.code}</code>
              </pre>
            )}
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <Tag
                  key={tag.id}
                  name={tag.name}
                  neutral={['EMBEDDED', 'AUTOMATION', 'SQL'].includes(tag.name)}
                />
              ))}
            </div>
            <div className="bg-subtle h-[2px]" />
            <Reactions
              id={question.id}
              helpful={question.voteCount}
              insight={question.insightCount || 0}
            />
          </article>
          <section aria-labelledby="answers-heading" className="answers-section">
            <div className="answers-header">
              <h2 id="answers-heading" className="answers-heading">
                {t('counts.answers', { count: question.answerCount })}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['helpful', 'Most helpful'],
                    ['newest', 'Newest'],
                  ] as const
                ).map(([key, label]) => (
                  <Chip
                    key={key}
                    selected={sort === key}
                    onClick={() => {
                      const next = new URLSearchParams(params)
                      next.set('answers', key)
                      setParams(next)
                    }}
                  >
                    {t(label)}
                  </Chip>
                ))}
              </div>
            </div>
            {list.map((answer) => (
              <AnswerCard key={answer.id} answer={answer} />
            ))}
            {list.length < question.answerCount && (
              <p className="caption text-muted">
                {t('questionDetail.only_the_answers_included_in_the_saved')}
              </p>
            )}
            {!question.answerCount && (
              <p className="text-muted">{t('questionDetail.no_answers_yet_be_the_first_to')}</p>
            )}
          </section>
          <AnswerInputForm key={question.id} questionId={question.id} />
          <p className="caption text-muted">
            {t('questionDetail.sample_discussion_new_answers_and_reactions_are')}
          </p>
        </div>
        <aside className="question-side">
          <section className="widget">
            <h2 className="section-title">{t('questionDetail.related_questions')}</h2>
            {RELATED_QUESTIONS.filter((item) => item.id !== question.id).map((item) => (
              <Link
                key={item.id}
                className="related-question"
                to={`/community/questions/${item.id}`}
              >
                <span className="label" dir="auto">
                  {questionText(item, 'title')}
                </span>
                <span className="caption text-muted">
                  {t('counts.answers', { count: item.answerCount })}
                </span>
              </Link>
            ))}
          </section>
          <section className="widget">
            <h2 className="section-title">{t('questionDetail.question_stats')}</h2>
            <dl className="question-stats">
              {[
                ['Views', question.viewCount],
                ['Answers', question.answerCount],
                ['Asked', time],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{t(label)}</dt>
                  <dd>{t(value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}
