import type { Problem } from '@/data/problems'
export interface SolutionDraft {
  summary: string
  delivery: string
  link: string
  terms: boolean
  file: { name: string; size: number } | null
}
export const emptySolution = (): SolutionDraft => ({
  summary: '',
  delivery: '10',
  link: '',
  terms: true,
  file: null,
})
export const normalizeSkill = (skill: string) => skill.toLowerCase().replace(/\s|systems/g, '')
export function filterProblems(
  items: Problem[],
  query: string,
  difficulties: string[],
  skills: string[],
  min: number,
  max: number,
  sort: string
) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const found = items.filter(
    (p) =>
      words.every((w) =>
        `${p.title} ${p.company} ${p.summary} ${p.skills.join(' ')}`.toLowerCase().includes(w)
      ) &&
      (!difficulties.length || difficulties.includes(p.difficulty)) &&
      (!skills.length ||
        skills.some((s) => p.skills.some((t) => normalizeSkill(t) === normalizeSkill(s)))) &&
      p.reward >= min &&
      p.reward <= max
  )
  return sort === 'reward'
    ? found.sort((a, b) => b.reward - a.reward)
    : sort === 'ending'
      ? found.sort((a, b) => a.days - b.days)
      : found
}
export function validateSolution(draft: SolutionDraft) {
  const errors: Record<string, string> = {}
  if (!draft.summary.trim()) errors.summary = 'Describe your solution.'
  if (draft.delivery !== '10') errors.delivery = 'Choose a proposed delivery time.'
  if (draft.link.trim()) {
    try {
      const url = new URL(draft.link.trim())
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      errors.link = 'Enter a complete http:// or https:// URL.'
    }
  }
  if (!draft.terms) errors.terms = 'Confirm your work is your own before submitting.'
  return errors
}
export function validateSolutionFile(file: { name: string; size: number }) {
  return !/\.(pdf|docx)$/i.test(file.name) || file.size > 5 * 1024 * 1024 || file.size === 0
    ? 'Choose a non-empty PDF or DOCX file up to 5MB.'
    : ''
}
