import { t, useI18n } from '@/i18n'
import { answerText } from '@/i18n/community'
import type { Answer } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Reactions } from '@/components/shared/Reactions'
import { FormattedText } from '@/components/shared/FormattedText'
import { formatRelativeTime } from '@/lib/utils'
export function AnswerCard({ answer }: { answer: Answer }) {
  useI18n()
  return (
    <article className="answer-card">
      <div className="author-row">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={answer.author.displayName} />
          <div>
            <p className="label">{answer.author.displayName}</p>
            {answer.authorRole && (
              <p className="caption text-muted">{answerText(answer, 'authorRole')}</p>
            )}
          </div>
        </div>
        <span className="caption text-muted">
          {t(answer.timeLabel || formatRelativeTime(answer.createdAt))}
        </span>
      </div>
      <FormattedText text={answerText(answer, 'body')} />
      <Reactions id={answer.id} helpful={answer.voteCount} insight={answer.insightCount || 0} />
    </article>
  )
}
