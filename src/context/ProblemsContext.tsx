import { createContext, useContext, useState, type ReactNode } from 'react'
import { initialProblemComments, type ProblemComment } from '@/data/problems'
import type { SolutionDraft } from '@/lib/problems'
interface Store {
  drafts: Record<string, SolutionDraft>
  submissions: Record<string, SolutionDraft>
  comments: Record<string, ProblemComment[]>
  saveDraft: (key: string, draft: SolutionDraft) => void
  submit: (key: string, draft: SolutionDraft) => void
  addComment: (id: string, comment: ProblemComment) => void
}
const Context = createContext<Store | null>(null)
// Deliberately memory-only: nothing is uploaded, authenticated or persisted.
export function ProblemsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Store['drafts']>({})
  const [submissions, setSubmissions] = useState<Store['submissions']>({})
  const [comments, setComments] = useState<Store['comments']>({ 'p-101': initialProblemComments })
  return (
    <Context.Provider
      value={{
        drafts,
        submissions,
        comments,
        saveDraft: (key, draft) => setDrafts((s) => ({ ...s, [key]: draft })),
        submit: (key, draft) => {
          setSubmissions((s) => (s[key] ? s : { ...s, [key]: draft }))
          setDrafts((s) => {
            const next = { ...s }
            delete next[key]
            return next
          })
        },
        addComment: (id, comment) =>
          setComments((s) => ({ ...s, [id]: [...(s[id] ?? []), comment] })),
      }}
    >
      {children}
    </Context.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useProblems() {
  const value = useContext(Context)
  if (!value) throw new Error('ProblemsProvider is required')
  return value
}
