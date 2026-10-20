import { useId, type SelectHTMLAttributes, type ReactNode } from 'react'
import { FigmaIcon } from './FigmaIcon'
// Saved frames specify the closed control; its popup is deliberately OS-owned.
export function Select({
  label,
  error,
  children,
  id,
  required,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  children: ReactNode
}) {
  const generated = useId()
  const fieldId = id || generated
  return (
    <div className="flex min-w-0 flex-col gap-[6px]">
      <label className="label" htmlFor={fieldId}>
        {label}
        {required && ' *'}
      </label>
      <div className="relative">
        <select
          {...props}
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? fieldId + '-error' : undefined}
          className="field appearance-none pe-12"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center">
          <FigmaIcon asset="ac06e" size={20} />
        </span>
      </div>
      {error && (
        <p id={fieldId + '-error'} className="caption text-error-text">
          {error}
        </p>
      )}
    </div>
  )
}
