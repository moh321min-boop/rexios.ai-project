import { Link } from 'react-router-dom'
import type { Question } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Tag } from '@/components/ui/Tag'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { Reactions } from '@/components/shared/Reactions'
import { formatRelativeTime } from '@/lib/utils'
export function QuestionCard({
  question: q,
  onTagClick,
}: {
  question: Question
  onTagClick?: (tag: string) => void
}) {
  return (
    <article className="question-card">
      <div className="author-row">
        <div className="flex items-center gap-[10px]">
          <Avatar name={q.author.displayName} size="sm" />
          <span className="label">{q.author.displayName}</span>
        </div>
        <span className="caption text-muted">{q.timeLabel || formatRelativeTime(q.createdAt)}</span>
      </div>
      <h2 className="section-title">
        <Link className="hover:underline" to={`/community/questions/${q.id}`}>
          {q.title}
        </Link>
      </h2>
      <p className="text-muted">{q.summary || q.body}</p>
      <div className="flex flex-wrap gap-2">
        {q.tags.map((tag) => (
          <Tag
            key={tag.id}
            name={tag.name}
            neutral={['EMBEDDED', 'AUTOMATION', 'SQL', 'ROBOTICS'].includes(tag.name)}
            onClick={onTagClick ? () => onTagClick(tag.slug) : undefined}
          />
        ))}
      </div>
      <div className="bg-subtle h-[2px]" />
      <div className="question-footer">
        <Reactions id={q.id} helpful={q.voteCount} insight={q.insightCount || 0} />
        <div className="caption text-muted flex items-center gap-5">
          <Link
            className="flex items-center gap-[6px] hover:underline"
            to={`/community/questions/${q.id}`}
          >
            <FigmaIcon asset="84216" size={16} />
            {q.answerCount ? `${q.answerCount} answers` : 'No answers'}
          </Link>
          <span className="flex items-center gap-[6px]">
            <FigmaIcon asset="be2c2" size={16} />
            {q.viewCount}
          </span>
        </div>
      </div>
    </article>
  )
}
