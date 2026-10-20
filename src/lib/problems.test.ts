import { describe, expect, it } from 'vitest'
import { problems } from '@/data/problems'
import { emptySolution, filterProblems, validateSolution, validateSolutionFile } from './problems'
describe('problem search and proposal validation', () => {
  it('combines query, difficulty, skill and reward filters without mutating fixtures', () => {
    expect(
      filterProblems(problems, 'oven', ['Medium'], ['Python'], 10000, 50000, 'newest').map(
        (p) => p.id
      )
    ).toEqual(['p-101'])
    expect(filterProblems(problems, '', ['Small'], ['Python'], 10000, 200000, 'newest')).toEqual([])
    expect(
      filterProblems(problems, '', ['Expert'], ['AI / ML'], 10000, 200000, 'newest').map(
        (p) => p.id
      )
    ).toEqual(['p-103'])
    expect(filterProblems(problems, '', [], [], 10000, 200000, 'reward')[0]?.id).toBe('p-103')
    expect(filterProblems(problems, '', [], [], 10000, 200000, 'ending')[0]?.id).toBe('p-104')
    expect(problems[0]?.id).toBe('p-101')
  })
  it('requires a summary, delivery and consent but treats fifty words as a recommendation', () => {
    expect(validateSolution(emptySolution()).summary).toBeTruthy()
    expect(
      validateSolution({ ...emptySolution(), summary: 'I propose using a calibrated sensor.' })
    ).toEqual({})
    const errors = validateSolution({
      ...emptySolution(),
      summary: 'Valid summary',
      delivery: '999',
      terms: false,
      link: 'javascript:alert(1)',
    })
    expect(Object.keys(errors)).toEqual(['delivery', 'link', 'terms'])
    expect(
      validateSolution({
        ...emptySolution(),
        summary: 'Valid',
        link: 'https://github.com/example/repo',
      })
    ).toEqual({})
  })
  it('rejects missing, oversized and unsupported attachments', () => {
    expect(validateSolutionFile({ name: 'notes.pdf', size: 512 })).toBe('')
    expect(validateSolutionFile({ name: 'notes.DOCX', size: 512 })).toBe('')
    for (const file of [
      { name: 'notes.exe', size: 1 },
      { name: 'notes.pdf', size: 0 },
      { name: 'notes.pdf', size: 5 * 1024 * 1024 + 1 },
    ])
      expect(validateSolutionFile(file)).toBeTruthy()
  })
})
