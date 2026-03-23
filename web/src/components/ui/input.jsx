import { cn } from '../../lib/cn'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-12 w-full rounded-2xl border border-stone-300/70 bg-white/80 px-4 text-sm text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition focus:border-[var(--event-accent)] focus:ring-2 focus:ring-[var(--event-accent-soft)]',
        className,
      )}
      {...props}
    />
  )
}
