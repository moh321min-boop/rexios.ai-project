import { afterEach, expect, it } from 'vitest'
import { MOCK_QUESTIONS } from '@/data/mockData'
import { filterQuestions } from '@/lib/community'
import { resources, setLanguage } from './index'
import { questionText } from './community'

afterEach(() => setLanguage('en'))

it('translates sample cards but preserves local posts and edited content', () => {
  const sample = MOCK_QUESTIONS[0]!
  setLanguage('ar')
  expect(questionText(sample, 'title')).toBe(resources.ar['communityCards.sensor.title'])
  expect(questionText(sample, 'summary')).toBe(resources.ar['communityCards.sensor.summary'])
  expect(questionText({ ...sample, id: 'local-1' }, 'title')).toBe(sample.title)
  expect(questionText({ ...sample, id: 'local-1' }, 'summary')).toBe(sample.summary)
  expect(questionText({ ...sample, title: 'My edited title' }, 'title')).toBe('My edited title')
  setLanguage('en')
  expect(questionText(sample, 'title')).toBe(sample.title)
})

it('searches translated card text while retaining tags, category filters and English search', () => {
  setLanguage('ar')
  const localized = (question: (typeof MOCK_QUESTIONS)[number]) =>
    `${questionText(question, 'title')} ${questionText(question, 'summary')}`
  const filters = { category: 'cat-ai', tag: 'python', sort: 'newest', query: 'التنبؤية' }
  expect(filterQuestions(MOCK_QUESTIONS, filters, localized).map((q) => q.id)).toEqual(['q-102'])
  expect(
    filterQuestions(MOCK_QUESTIONS, { ...filters, query: 'vibration' }, localized).map((q) => q.id)
  ).toEqual(['q-102'])
  expect(filterQuestions(MOCK_QUESTIONS, { ...filters, category: 'cat-web' }, localized)).toEqual(
    []
  )
})
