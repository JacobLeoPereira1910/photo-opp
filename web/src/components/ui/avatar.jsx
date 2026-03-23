import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '../../lib/cn'

export function Avatar({ className, ...props }) {
  return (
    <AvatarPrimitive.Root
      className={cn('inline-flex size-10 overflow-hidden rounded-full border border-white/60 bg-stone-900/10', className)}
      {...props}
    />
  )
}

export function AvatarFallback({ className, ...props }) {
  return (
    <AvatarPrimitive.Fallback
      className={cn('grid size-full place-items-center bg-stone-900 text-sm font-semibold text-white', className)}
      {...props}
    />
  )
}
