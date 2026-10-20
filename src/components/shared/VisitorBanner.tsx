import { useState } from 'react'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
export function VisitorBanner() {
  const [dismissed, setDismissed] = useState(false)
  return dismissed ? null : (
    <div className="visitor-banner">
      <FigmaIcon asset="a424c" size={24} />
      <p>
        You're browsing as a visitor: you can only read questions and answers. Sign in or create an
        account to participate.
      </p>
      <button
        type="button"
        aria-label="Dismiss visitor information"
        onClick={() => setDismissed(true)}
      >
        <FigmaIcon asset="bbd93" size={18} />
      </button>
    </div>
  )
}
