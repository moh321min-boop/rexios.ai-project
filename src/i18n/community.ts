import { MOCK_QUESTIONS, MOCK_ANSWERS } from '@/data/mockData'
import type { Question, Answer } from '@/types'
import { fixtureText } from './fixtures'

/** Translate only unchanged sample content; local posts retain their author's wording. */
export function questionText(
  question: Question,
  field: 'title' | 'summary' | 'body' | 'authorRole'
) {
  const fixture = MOCK_QUESTIONS.find((item) => item.id === question.id)
  return fixtureText(question[field], fixture?.[field])
}

export function answerText(answer: Answer, field: 'body' | 'authorRole') {
  const fixture = MOCK_ANSWERS[answer.questionId]?.find((item) => item.id === answer.id)
  return fixtureText(answer[field], fixture?.[field])
}
