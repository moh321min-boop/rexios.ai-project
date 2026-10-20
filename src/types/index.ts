// ── Core domain types for RexiosAI ──
// Shared across all features; extend in feature-level types where needed.

// ── User / Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'industrial_company' | 'technical_talent' | 'admin'

export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl?: string
  role: UserRole
  bio?: string
  skills?: string[]
  company?: string
  location?: string
  githubUrl?: string
  joinedAt: string
  isVerified: boolean
}

// ── Community ─────────────────────────────────────────────────────────────────

export type QuestionStatus = 'open' | 'answered' | 'closed'

export interface Tag {
  id: string
  name: string
  slug: string
  questionCount: number
  color?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  questionCount: number
  icon?: string
}

export interface Question {
  summary?: string
  timeLabel?: string
  insightCount?: number
  authorRole?: string
  code?: string
  id: string
  title: string
  body: string
  authorId: string
  author: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>
  tags: Tag[]
  category?: Category
  status: QuestionStatus
  voteCount: number
  answerCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface Answer {
  timeLabel?: string
  insightCount?: number
  authorRole?: string
  id: string
  questionId: string
  body: string
  authorId: string
  author: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>
  voteCount: number
  isAccepted: boolean
  githubUrl?: string
  createdAt: string
  updatedAt: string
}
