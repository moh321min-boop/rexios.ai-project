import { t, useI18n } from '@/i18n'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    type = 'button',
    ...props
  },
  ref
) {
  useI18n()
  const variants = {
    primary: 'bg-primary text-surface hover:bg-[#1b3fc4]',
    secondary: 'bg-surface text-ink hover:bg-sunken',
    accent: 'bg-accent text-ink hover:bg-[#b7ef2e]',
    outline: 'bg-surface text-ink hover:bg-sunken',
    ghost: 'border-transparent shadow-none bg-transparent text-primary hover:bg-brand-soft',
    danger: 'bg-error text-surface',
  }
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'border-ink shadow-pixel inline-flex items-center justify-center gap-2 rounded-[4px] border-2 px-6 py-[10px] text-[15px] leading-[1.4] font-semibold disabled:opacity-50',
        variants[variant],
        size === 'sm' && 'px-4 py-2 text-[13px]',
        size === 'lg' && 'min-h-12',
        className
      )}
    >
      {isLoading ? (
        <span
          aria-label={t('button.loading')}
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
})
