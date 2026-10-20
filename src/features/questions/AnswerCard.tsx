import type { Answer } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Reactions } from '@/components/shared/Reactions'
import { FormattedText } from '@/components/shared/FormattedText'
import { formatRelativeTime } from '@/lib/utils'
export function AnswerCard({ answer }: { answer: Answer }) {
  return (
    <article className="answer-card">
      <div className="author-row">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={answer.author.displayName} />
          <div>
            <p className="label">{answer.author.displayName}</p>
            {answer.authorRole && <p className="caption text-muted">{answer.authorRole}</p>}
          </div>
        </div>
        <span className="caption text-muted">
          {answer.timeLabel || formatRelativeTime(answer.createdAt)}
        </span>
      </div>
      <FormattedText text={answer.body} />
      <Reactions id={answer.id} helpful={answer.voteCount} insight={answer.insightCount || 0} />
    </article>
  )
}
