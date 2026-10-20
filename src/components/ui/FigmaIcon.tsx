import { cn } from '@/lib/utils'
// Original exported icon groups, centered in the exact icon slots from Figma.
// Root dimensions are preserved; icons are not redrawn.
export function FigmaIcon({
  asset,
  size = 20,
  className,
}: {
  asset: string
  size?: number
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <img src={'/figma/' + asset + '.svg'} alt="" />
    </span>
  )
}
