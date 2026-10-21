import { t, useI18n } from '@/i18n'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

/** Controlled notices retain their dismissal when their parent rerenders. */
export function Notice({
  children,
  onDismiss,
  className = 'inline-notice',
}: {
  children: ReactNode
  onDismiss: () => void
  className?: string
}) {
  useI18n()
  return (
    <div role="status" className={`dismissible-notice ${className}`}>
      <div>{typeof children === 'string' ? t(children) : children}</div>
      <button type="button" onClick={onDismiss} aria-label={t('notice.dismiss_notification')}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
