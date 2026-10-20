import type { Question } from '@/types'
export function filterQuestions(
  questions: Question[],
  filters: { category: string; tag: string; sort: string; query: string }
) {
  const query = filters.query.trim().toLocaleLowerCase('en')
  return questions
    .filter(
      (q) =>
        (filters.category === 'cat-all' || q.category?.id === filters.category) &&
        (!filters.tag || q.tags.some((t) => t.slug === filters.tag)) &&
        (filters.sort !== 'unanswered' || q.answerCount === 0) &&
        (!query ||
          [q.title, q.body, ...q.tags.map((t) => t.name)]
            .join(' ')
            .toLocaleLowerCase('en')
            .includes(query))
    )
    .sort((a, b) =>
      filters.sort === 'active'
        ? b.answerCount - a.answerCount || b.voteCount - a.voteCount
        : Date.parse(b.createdAt) - Date.parse(a.createdAt)
    )
}
