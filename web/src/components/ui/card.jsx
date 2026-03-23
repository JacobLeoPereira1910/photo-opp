import { cn } from '../../lib/cn'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'glass-panel rounded-[28px] border border-white/55 p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.55)]',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('space-y-2', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return (
    <h2
      className={cn('font-display text-2xl font-semibold text-stone-900', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-stone-500', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('space-y-4', className)} {...props} />
}
