import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Dialog(props) {
  return <DialogPrimitive.Root {...props} />
}

export function DialogTrigger(props) {
  return <DialogPrimitive.Trigger {...props} />
}

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm data-[state=open]:animate-[fade-in_200ms_ease]" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/50 bg-white/92 p-6 shadow-[0_32px_90px_-45px_rgba(0,0,0,0.6)] backdrop-blur',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 text-stone-500 transition hover:bg-stone-900/5 hover:text-stone-900">
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('space-y-2 pr-8', className)} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn('font-display text-3xl font-semibold text-stone-900', className)}
      {...props}
    />
  )
}

export function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm leading-6 text-stone-500', className)}
      {...props}
    />
  )
}
