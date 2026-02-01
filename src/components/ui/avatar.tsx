import * as React from 'react'
import { cn } from '../../lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, initials, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full bg-ink-900/10 text-sm font-semibold text-ink-900',
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  ),
)

Avatar.displayName = 'Avatar'
