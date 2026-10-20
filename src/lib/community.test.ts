import { describe, expect, it } from 'vitest'
import { filterQuestions } from './community'
import { MOCK_QUESTIONS } from '@/data/mockData'
const defaults = { category: 'cat-all', tag: '', sort: 'newest', query: '' }
describe('community filtering', () => {
  it('matches category IDs exactly rather than unrelated substrings', () => {
    expect(
      filterQuestions(MOCK_QUESTIONS, { ...defaults, category: 'cat-ai' }).map((q) => q.id)
    ).toEqual(['q-102'])
    expect(filterQuestions(MOCK_QUESTIONS, { ...defaults, category: 'cat-embedded' })).toEqual([])
  })
  it('combines category, tag and case-insensitive trimmed search', () => {
    expect(
      filterQuestions(MOCK_QUESTIONS, {
        ...defaults,
        category: 'cat-ai',
        tag: 'python',
        query: '  VIBRATION  ',
      }).map((q) => q.id)
    ).toEqual(['q-102'])
    expect(
      filterQuestions(MOCK_QUESTIONS, { ...defaults, category: 'cat-iot', tag: 'python' })
    ).toEqual([])
  })
  it('uses zero answers for unanswered, not the status label', () => {
    expect(
      filterQuestions(MOCK_QUESTIONS, { ...defaults, sort: 'unanswered' }).map((q) => q.id)
    ).toEqual(['q-104'])
  })
  it('sorts active questions and leaves source order unchanged', () => {
    const before = MOCK_QUESTIONS.map((q) => q.id)
    expect(filterQuestions(MOCK_QUESTIONS, { ...defaults, sort: 'active' })[0]?.id).toBe('q-102')
    expect(MOCK_QUESTIONS.map((q) => q.id)).toEqual(before)
  })
})
