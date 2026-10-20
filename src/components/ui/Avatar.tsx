import { useState } from 'react'
import { cn } from '@/lib/utils'
export interface AvatarProps {
  src?: string
  alt?: string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isOnline?: boolean
  className?: string
}
export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const sizes = {
    xs: 'size-6 text-[10px]',
    sm: 'size-8 text-[13px]',
    md: 'size-11 text-[15px]',
    lg: 'size-12 text-[15px]',
    xl: 'size-16 text-xl',
  }
  return (
    <span
      aria-label={name}
      className={cn(
        'border-ink bg-brand-soft text-primary inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[4px] border-2 leading-[1.4] font-semibold',
        sizes[size],
        className
      )}
    >
      {src && failedSrc !== src ? (
        <img
          src={src}
          alt={alt ?? name}
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        name.trim().charAt(0).toUpperCase() || '?'
      )}
    </span>
  )
}
