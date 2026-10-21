import { Notice } from '@/components/shared/Notice'
import { t, useI18n } from '@/i18n'
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
  'askQuestion.summarize_the_problem_in_one_clear_title',
  'askQuestion.say_what_you_tried_and_what_happened',
  'askQuestion.attach_relevant_code_or_specs',
  'askQuestion.choose_tags_that_describe_the_field_precisely',
  'mockData.don_t_share_confidential_company_information',
]
const tagNames: Record<string, string> = { 'Embedded Systems': 'EMBEDDED', 'AI / ML': 'AI/ML' }
export function AskQuestionPage() {
  useI18n()
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
      setErrors((previous) => ({ ...previous, tags: 'askQuestion.choose_up_to_5_tags' }))
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
    if (title.trim().length < 15) next.title = 'askQuestion.title_must_be_at_least_15_characters'
    if (body.trim().length < 30) next.body = 'askQuestion.please_describe_the_problem_in_at_least'
    if (!tags.length) next.tags = 'askQuestion.choose_at_least_one_tag'
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
          <h1 className="heading">{t('askQuestion.ask_a_question')}</h1>
          <p className="text-muted">
            {t('askQuestion.describe_your_problem_clearly_so_the_community')}
          </p>
          <Input
            id="question-title"
            label={t('askQuestion.question_title')}
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('askQuestion.e_g_how_do_i_reduce_temperature')}
            helperText={t('askQuestion.be_specific_at_least_15_characters')}
            error={errors.title}
          />
          <MarkdownEditor
            id="question-body"
            label={t('askQuestion.problem_details')}
            required
            value={body}
            onValueChange={setBody}
            placeholder={t('askQuestion.explain_the_problem_and_what_you_tried')}
            helperText={t('askQuestion.supports_markdown_and_code_blocks')}
            error={errors.body}
          />
          <fieldset className="tag-field" aria-describedby={errors.tags ? 'tag-error' : undefined}>
            <legend className="label">{t('askQuestion.tags_choose_up_to_5')}</legend>
            <div
              className="flex flex-wrap gap-[10px]"
              role="group"
              aria-label={t('askQuestion.question_tags')}
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
                {t(errors.tags)}
              </p>
            )}
          </fieldset>
          {warning && (
            <div className="question-warning">
              <FigmaIcon asset="0aee9" size={24} />
              <p>{t('askQuestion.don_t_share_confidential_or_sensitive_company')}</p>
              <button
                type="button"
                aria-label={t('askQuestion.dismiss_warning')}
                onClick={() => setWarning(false)}
              >
                <FigmaIcon asset="bbd93" size={18} />
              </button>
            </div>
          )}
          <div className="bg-subtle h-[2px]" />
          <div className="editor-actions">
            <Button type="submit">{t('askQuestion.post_question')}</Button>
            <Button
              variant="secondary"
              onClick={() => {
                saveDraft({ title, body, tags })
                setNotice('askQuestion.draft_saved_for_this_preview_session_it')
              }}
            >
              {t('askQuestion.save_as_draft')}
            </Button>
            <Button
              className="shadow-none"
              variant="ghost"
              onClick={() => {
                saveDraft({ title, body, tags })
                navigate('/community')
              }}
            >
              {t('askQuestion.cancel')}
            </Button>
          </div>
          {notice && <Notice onDismiss={() => setNotice('')}>{notice}</Notice>}
        </form>
        <p className="caption text-muted mt-5">
          {t('askQuestion.frontend_preview_questions_and_drafts_stay_in')}
        </p>
      </div>
      <aside className="question-tips">
        <h2 className="section-title">{t('askQuestion.tips_for_a_good_question')}</h2>
        {tips.map((tip) => (
          <p key={tip}>
            <FigmaIcon asset="3d3b0" size={20} />
            <span>{t(tip)}</span>
          </p>
        ))}
      </aside>
    </div>
  )
}
