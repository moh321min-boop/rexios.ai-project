import { t, useI18n } from '@/i18n'
import { useLayoutEffect, useRef } from 'react'
import { Textarea, type TextareaProps } from '@/components/ui/Textarea'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
export function MarkdownEditor({
  value,
  onValueChange,
  ...props
}: Omit<TextareaProps, 'value' | 'onChange'> & {
  value: string
  onValueChange: (value: string) => void
}) {
  const { language } = useI18n()
  const input = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const element = input.current
    if (element) {
      element.style.height = '132px'
      element.style.height = `${Math.max(132, element.scrollHeight + 4)}px`
    }
  }, [value, language])
  function insert(kind: 'code' | 'link' | 'list') {
    const element = input.current
    if (!element) return
    const start = element.selectionStart,
      end = element.selectionEnd
    const selected = value.slice(start, end)
    const insertion =
      kind === 'code'
        ? `\n\n\`\`\`\n${selected || 'code'}\n\`\`\`\n`
        : kind === 'link'
          ? `[${selected || t('markdownEditor.link_text')}](https://example.com)`
          : `\n${(selected || t('markdownEditor.list_item'))
              .split('\n')
              .map((line) => `- ${line}`)
              .join('\n')}\n`
    onValueChange(value.slice(0, start) + insertion + value.slice(end))
    requestAnimationFrame(() => {
      element.focus()
      element.setSelectionRange(start, start + insertion.length)
    })
  }
  return (
    <div className="markdown-editor">
      <div
        className="editor-toolbar"
        role="group"
        aria-label={t('markdownEditor.markdown_formatting')}
      >
        {(
          [
            { kind: 'code', label: 'Insert code block', asset: 'e46e1' },
            { kind: 'link', label: 'Insert link', asset: 'b5f04' },
            { kind: 'list', label: 'Insert bulleted list', asset: 'a701b' },
          ] as const
        ).map((item) => (
          <button
            key={item.kind}
            type="button"
            aria-label={t(item.label)}
            onClick={() => insert(item.kind)}
          >
            <FigmaIcon asset={item.asset} size={18} />
          </button>
        ))}
      </div>
      <Textarea
        className="resize-none"
        {...props}
        ref={input}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </div>
  )
}
