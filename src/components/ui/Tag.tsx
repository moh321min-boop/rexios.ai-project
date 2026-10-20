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
  const className = cn(
    'topic-tag',
    neutral && 'topic-tag-neutral',
    selected && 'topic-tag-selected'
  )
  return onClick ? (
    <button type="button" className={className} aria-pressed={!!selected} onClick={onClick}>
      {name}
    </button>
  ) : (
    <span className={className}>{name}</span>
  )
}
