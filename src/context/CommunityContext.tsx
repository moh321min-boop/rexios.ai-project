import { createContext, useContext, useState, type ReactNode } from 'react'
import { MOCK_QUESTIONS, MOCK_ANSWERS } from '@/data/mockData'
import type { Question, Answer } from '@/types'
import { useAuth } from '@/context/AuthContext'
export interface QuestionDraft {
  title: string
  body: string
  tags: string[]
}
interface CommunityState {
  questions: Question[]
  answers: Record<string, Answer[]>
  draft: QuestionDraft | null
  saveDraft: (draft: QuestionDraft | null) => void
  addQuestion: (question: Question) => void
  addAnswer: (answer: Answer) => void
  reactions: Record<string, boolean>
  toggleReaction: (id: string) => void
}
const CommunityContext = createContext<CommunityState | null>(null)
export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const owner = user?.id ?? 'visitor'
  const [questions, setQuestions] = useState(MOCK_QUESTIONS)
  const [answers, setAnswers] = useState(MOCK_ANSWERS)
  const [drafts, setDrafts] = useState<Record<string, QuestionDraft | null>>({})
  const [allReactions, setReactions] = useState<Record<string, Record<string, boolean>>>({})
  const draft = drafts[owner] ?? null,
    reactions = allReactions[owner] ?? {}
  const saveDraft = (next: QuestionDraft | null) => setDrafts((all) => ({ ...all, [owner]: next }))
  return (
    <CommunityContext.Provider
      value={{
        questions,
        answers,
        draft,
        saveDraft,
        reactions,
        addQuestion: (q) => setQuestions((list) => [q, ...list]),
        addAnswer: (a) => {
          setAnswers((all) => ({ ...all, [a.questionId]: [...(all[a.questionId] || []), a] }))
          setQuestions((list) =>
            list.map((q) =>
              q.id === a.questionId
                ? { ...q, answerCount: q.answerCount + 1, status: 'answered' }
                : q
            )
          )
        },
        toggleReaction: (id) =>
          setReactions((all) => ({ ...all, [owner]: { ...all[owner], [id]: !all[owner]?.[id] } })),
      }}
    >
      {children}
    </CommunityContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useCommunity() {
  const context = useContext(CommunityContext)
  if (!context) throw new Error('CommunityProvider is required')
  return context
}
