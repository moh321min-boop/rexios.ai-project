import { t, useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
export function Tag({
  name,
  selected,
  onClick,
  neutral = false,
}: {
  name: string
  selected?: boolean
  onClick?: () => void
  neutral?: boolean
}) {
  useI18n()
  const className = cn(
    'topic-tag',
    neutral && 'topic-tag-neutral',
    selected && 'topic-tag-selected'
  )
  return onClick ? (
    <button
      type="button"
      dir="auto"
      className={className}
      aria-pressed={!!selected}
      onClick={onClick}
    >
      {t(name)}
    </button>
  ) : (
    <span className={className} dir="auto">
      {t(name)}
    </span>
  )
}
