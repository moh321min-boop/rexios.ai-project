import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, leftIcon, rightIcon, className, id, required, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const message = error || helperText
  return (
    <div className="flex w-full flex-col gap-[6px]">
      {label && (
        <label className="label" htmlFor={inputId}>
          {label}
          {required && ' *'}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute start-4" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          {...props}
          required={required}
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={message ? inputId + '-message' : undefined}
          className={cn('field', leftIcon && 'ps-11', rightIcon && 'pe-11', className)}
        />
        {rightIcon && <span className="absolute end-4">{rightIcon}</span>}
      </div>
      {message && (
        <p
          id={inputId + '-message'}
          className={cn('caption', error ? 'text-error-text' : 'text-muted')}
        >
          {message}
        </p>
      )}
    </div>
  )
})
