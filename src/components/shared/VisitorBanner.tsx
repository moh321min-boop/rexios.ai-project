import { t, useI18n } from '@/i18n'
import { useState } from 'react'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
export function VisitorBanner({ message }: { message?: string }) {
  useI18n()
  const [dismissed, setDismissed] = useState(false)
  return dismissed ? null : (
    <div className="visitor-banner" role="status">
      <FigmaIcon asset="a424c" size={24} />
      <p>{t(message ?? 'visitorBanner.you_re_browsing_as_a_visitor_you')}</p>
      <button
        type="button"
        aria-label={t('visitorBanner.dismiss_visitor_information')}
        onClick={() => setDismissed(true)}
      >
        <FigmaIcon asset="bbd93" size={18} />
      </button>
    </div>
  )
}
