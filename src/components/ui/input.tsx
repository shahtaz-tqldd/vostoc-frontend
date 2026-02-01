import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-ink-200 bg-white/90 px-4 py-2 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-mint-400 focus:ring-2 focus:ring-mint-400/30',
        className,
      )}
      {...props}
    />
  ),
)

Input.displayName = 'Input'
