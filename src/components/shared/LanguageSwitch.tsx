import { useState } from 'react'
export function LanguageSwitch() {
  const [notice, setNotice] = useState(false)
  return (
    <div className="relative">
      <div className="border-ink bg-surface label flex overflow-hidden rounded-[4px] border-2">
        <button
          type="button"
          lang="ar"
          onClick={() => setNotice(!notice)}
          className="px-3 py-[6px]"
          aria-label="Arabic — translation not yet available"
        >
          عربي
        </button>
        <button
          type="button"
          className="bg-accent px-3 py-[6px]"
          aria-pressed="true"
          onClick={() => setNotice(false)}
        >
          EN
        </button>
      </div>
      {notice && (
        <p
          role="status"
          className="border-ink bg-surface shadow-pixel absolute end-0 top-full z-20 mt-2 w-56 rounded border-2 p-3 text-sm"
        >
          Arabic screens are not implemented yet.
        </p>
      )}
    </div>
  )
}
