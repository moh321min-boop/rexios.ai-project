import { t, useI18n } from '@/i18n'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { FigmaIcon } from './FigmaIcon'
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showCloseButton?: boolean
}
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
}: ModalProps) {
  useI18n()
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !isOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [isOpen])
  return (
    <dialog
      ref={ref}
      className={cn('app-dialog', className)}
      aria-labelledby={title ? `${id}-title` : undefined}
      aria-label={title ? undefined : t('modal.dialog')}
      aria-describedby={description ? `${id}-description` : undefined}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]'
          )
        ).filter((element) => element.getClientRects().length)
        const first = focusable[0],
          last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {showCloseButton && (
        <div className="flex justify-end">
          <button
            type="button"
            className="dialog-close"
            onClick={onClose}
            aria-label={t('modal.close_dialog')}
          >
            <FigmaIcon asset="08e51" size={20} />
          </button>
        </div>
      )}
      {title && (
        <h2 id={`${id}-title`} className="dialog-title">
          {typeof title === 'string' ? t(title) : title}
        </h2>
      )}
      {description && (
        <p id={`${id}-description`}>
          {typeof description === 'string' ? t(description) : description}
        </p>
      )}
      {children}
    </dialog>
  )
}
