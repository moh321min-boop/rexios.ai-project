import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCommunity } from '@/context/CommunityContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Chip } from '@/components/ui/Chip'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { MarkdownEditor } from '@/components/shared/MarkdownEditor'
import { MOCK_CATEGORIES } from '@/data/mockData'
import { focusFirstError } from '@/lib/forms'
const tagOptions = [
  'Python',
  'C / C++',
  'Embedded Systems',
  'IoT',
  'AI / ML',
  'SCADA',
  'Backend',
  'React',
]
const tips = [
  'Summarize the problem in one clear title',
  'Say what you tried and what happened',
  'Attach relevant code or specs',
  'Choose tags that describe the field precisely',
  "Don't share confidential company information",
]
const tagNames: Record<string, string> = { 'Embedded Systems': 'EMBEDDED', 'AI / ML': 'AI/ML' }
export function AskQuestionPage() {
  const { user, triggerAuthPrompt } = useAuth()
  const { draft, saveDraft, addQuestion } = useCommunity()
  const navigate = useNavigate()
  const [title, setTitle] = useState(draft?.title || '')
  const [body, setBody] = useState(draft?.body || '')
  const [tags, setTags] = useState<string[]>(draft?.tags ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warning, setWarning] = useState(true)
  const [notice, setNotice] = useState('')
  function toggleTag(tag: string) {
    if (!tags.includes(tag) && tags.length === 5) {
      setErrors((previous) => ({ ...previous, tags: 'Choose up to 5 tags.' }))
      return
    }
    setTags((previous) =>
      previous.includes(tag) ? previous.filter((item) => item !== tag) : [...previous, tag]
    )
    setErrors((previous) => ({ ...previous, tags: '' }))
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (title.trim().length < 15) next.title = 'Title must be at least 15 characters.'
    if (body.trim().length < 30)
      next.body = 'Please describe the problem in at least 30 characters.'
    if (!tags.length) next.tags = 'Choose at least one tag.'
    setErrors(next)
    if (Object.keys(next).length) {
      focusFirstError()
      return
    }
    if (!user) {
      saveDraft({ title, body, tags })
      triggerAuthPrompt()
      return
    }
    const id = `local-${crypto.randomUUID()}`,
      now = new Date().toISOString()
    const categoryId = tags.includes('IoT')
      ? 'cat-iot'
      : tags.includes('Embedded Systems')
        ? 'cat-embedded'
        : tags.includes('AI / ML')
          ? 'cat-ai'
          : tags.includes('SCADA')
            ? 'cat-automation'
            : tags.some((tag) => ['React', 'Backend'].includes(tag))
              ? 'cat-web'
              : 'cat-other'
    addQuestion({
      id,
      title: title.trim(),
      body: body.trim(),
      authorId: user.id,
      author: user,
      tags: tags.map((tag) => {
        const name = tagNames[tag] || tag.toUpperCase()
        return { id: name, name, slug: name.toLowerCase(), questionCount: 0 }
      }),
      category: MOCK_CATEGORIES.find((category) => category.id === categoryId),
      status: 'open',
      voteCount: 0,
      insightCount: 0,
      answerCount: 0,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      timeLabel: 'Just now',
    })
    saveDraft(null)
    navigate(`/community/questions/${id}`)
  }
  return (
    <div className="app-content profile-content ask-content">
      <div className="min-w-0">
        <form className="card profile-form" onSubmit={submit} noValidate>
          <h1 className="heading">Ask a question</h1>
          <p className="text-muted">Describe your problem clearly so the community can help.</p>
          <Input
            id="question-title"
            label="Question title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. How do I reduce temperature sensor noise?"
            helperText="Be specific: at least 15 characters"
            error={errors.title}
          />
          <MarkdownEditor
            id="question-body"
            label="Problem details"
            required
            value={body}
            onValueChange={setBody}
            placeholder="Explain the problem and what you tried, and attach code if any…"
            helperText="Supports Markdown and code blocks"
            error={errors.body}
          />
          <fieldset className="tag-field" aria-describedby={errors.tags ? 'tag-error' : undefined}>
            <legend className="label">Tags * — choose up to 5</legend>
            <div
              className="flex flex-wrap gap-[10px]"
              role="group"
              aria-label="Question tags"
              tabIndex={errors.tags ? -1 : undefined}
              aria-invalid={!!errors.tags}
            >
              {tagOptions.map((tag) => (
                <Chip
                  key={tag}
                  selected={tags.includes(tag)}
                  removable={tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Chip>
              ))}
            </div>
            {errors.tags && (
              <p id="tag-error" className="caption text-error-text" role="alert">
                {errors.tags}
              </p>
            )}
          </fieldset>
          {warning && (
            <div className="question-warning">
              <FigmaIcon asset="0aee9" size={24} />
              <p>Don't share confidential or sensitive company data.</p>
              <button type="button" aria-label="Dismiss warning" onClick={() => setWarning(false)}>
                <FigmaIcon asset="bbd93" size={18} />
              </button>
            </div>
          )}
          <div className="bg-subtle h-[2px]" />
          <div className="editor-actions">
            <Button type="submit">Post question</Button>
            <Button
              variant="secondary"
              onClick={() => {
                saveDraft({ title, body, tags })
                setNotice('Draft saved for this preview session. It will be lost on reload.')
              }}
            >
              Save as draft
            </Button>
            <Button
              className="shadow-none"
              variant="ghost"
              onClick={() => {
                saveDraft({ title, body, tags })
                navigate('/community')
              }}
            >
              Cancel
            </Button>
          </div>
          {notice && (
            <p role="status" className="inline-notice">
              {notice}
            </p>
          )}
        </form>
        <p className="caption text-muted mt-5">
          Frontend preview: questions and drafts stay in memory until reload. Cancel keeps your
          draft for this session. No data is submitted to a server.
        </p>
      </div>
      <aside className="question-tips">
        <h2 className="section-title">Tips for a good question</h2>
        {tips.map((tip) => (
          <p key={tip}>
            <FigmaIcon asset="3d3b0" size={20} />
            <span>{tip}</span>
          </p>
        ))}
      </aside>
    </div>
  )
}
