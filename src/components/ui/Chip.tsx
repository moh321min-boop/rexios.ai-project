import { FigmaIcon } from './FigmaIcon'
import { cn } from '@/lib/utils'
export function Chip({
  children,
  selected = false,
  onClick,
  removable = false,
}: {
  children: string
  selected?: boolean
  onClick?: () => void
  removable?: boolean
}) {
  const content = (
    <>
      {children}
      {removable && selected && <FigmaIcon asset="73421" size={14} />}
    </>
  )
  const className = cn('chip', selected && 'chip-selected')
  return onClick ? (
    <button
      type="button"
      className={className}
      aria-pressed={selected}
      aria-label={removable && selected ? `Remove ${children}` : children}
      onClick={onClick}
    >
      {content}
    </button>
  ) : (
    <span className={className}>{content}</span>
  )
}
