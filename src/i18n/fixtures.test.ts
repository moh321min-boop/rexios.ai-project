import { afterEach, expect, it } from 'vitest'
import { MOCK_QUESTIONS, MOCK_ANSWERS } from '@/data/mockData'
import { problems, initialProblemComments } from '@/data/problems'
import { filterProblems } from '@/lib/problems'
import { setLanguage, t } from './index'
import { questionText, answerText } from './community'
import { fixtureText } from './fixtures'

afterEach(() => setLanguage('en'))

it('covers every static question, answer, industrial requirement and discussion fixture', () => {
  setLanguage('ar')
  const content = [
    ...MOCK_QUESTIONS.flatMap((q) => [q.title, q.summary, q.body, q.authorRole]),
    ...Object.values(MOCK_ANSWERS)
      .flat()
      .flatMap((a) => [a.body, a.authorRole]),
    ...problems.flatMap((p) => [
      p.title,
      p.summary,
      p.description,
      ...(p.sections?.flatMap((s) => [s.title, ...s.items]) ?? []),
    ]),
    ...initialProblemComments.map((c) => c.text),
  ].filter((text): text is string => !!text)
  for (const text of content) {
    expect(t(text), text).not.toBe(text)
    expect(t(text), text).toMatch(/[\u0600-\u06ff]/)
  }
})

it('keeps authored answers, roles and comments unchanged even if they copy a sample', () => {
  setLanguage('ar')
  const answer = MOCK_ANSWERS['q-101']![0]!
  expect(answerText(answer, 'body')).not.toBe(answer.body)
  expect(answerText({ ...answer, id: 'local-answer' }, 'body')).toBe(answer.body)
  expect(answerText({ ...answer, body: 'My real contribution' }, 'body')).toBe(
    'My real contribution'
  )
  expect(questionText({ ...MOCK_QUESTIONS[0]!, id: 'local-question' }, 'authorRole')).toBe(
    MOCK_QUESTIONS[0]!.authorRole
  )
  expect(fixtureText(initialProblemComments[0]!.text, undefined)).toBe(
    initialProblemComments[0]!.text
  )
})

it('supports Arabic Problems search with combined filters without changing English fixtures', () => {
  setLanguage('ar')
  const translated = (problem: (typeof problems)[number]) =>
    `${t(problem.title)} ${t(problem.summary)}`
  for (const query of ['فرن صناعي', 'oven']) {
    expect(
      filterProblems(
        problems,
        query,
        ['Medium'],
        ['Python'],
        10000,
        50000,
        'newest',
        translated
      ).map((p) => p.id)
    ).toEqual(['p-101'])
  }
  expect(
    filterProblems(problems, 'فرن صناعي', ['Expert'], [], 10000, 200000, 'newest', translated)
  ).toEqual([])
  expect(problems[0]!.title).toContain('industrial oven')
})
