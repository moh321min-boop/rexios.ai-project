import { t, useI18n } from '@/i18n'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
export function RexiosLogo({
  variant = 'dark',
  className,
}: {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  useI18n()
  return (
    <Link
      to="/"
      dir="ltr"
      aria-label={t('rexiosLogo.rexios_ai_home')}
      className={cn(
        'inline-flex shrink-0 items-center gap-3 rounded-[4px] px-4 py-3',
        variant === 'light' ? 'bg-primary text-surface' : 'text-ink',
        className
      )}
    >
      <img
        src={'/figma/' + (variant === 'light' ? '31199' : 'e1b5f') + '.svg'}
        alt=""
        width="48"
        height="36"
      />
      <span className="font-brand text-[28px] leading-[1.2] font-bold whitespace-nowrap">
        REXIOS AI
      </span>
    </Link>
  )
}
