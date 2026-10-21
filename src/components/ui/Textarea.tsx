import { t, useI18n } from '@/i18n'
import { forwardRef, useId, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  autoGrow?: boolean
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, error, id, required, className, autoGrow = false, ...props },
  ref
) {
  const { language } = useI18n()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const message = error || helperText
  const element = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    if (!autoGrow) return
    const resize = () => {
      if (!element.current) return
      element.current.style.height = '132px'
      element.current.style.height = `${Math.max(132, element.current.scrollHeight + 4)}px`
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [autoGrow, props.value, language])
  return (
    <div className="flex w-full min-w-0 flex-col gap-[6px]">
      {label && (
        <label className="label" htmlFor={inputId}>
          {t(label)}
          {required && ' *'}
        </label>
      )}
      <textarea
        {...props}
        dir={props.dir ?? (props.value ? 'auto' : undefined)}
        id={inputId}
        ref={(node) => {
          element.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        required={required}
        aria-invalid={!!error}
        aria-describedby={message ? `${inputId}-message` : undefined}
        className={cn('field app-textarea resize-none', className)}
      />
      {message && (
        <p
          id={`${inputId}-message`}
          className={cn('caption', error ? 'text-error-text' : 'text-muted')}
        >
          {t(message)}
        </p>
      )}
    </div>
  )
})
