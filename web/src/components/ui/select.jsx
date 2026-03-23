import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          'flex h-12 w-full appearance-none rounded-2xl border border-stone-300/70 bg-white/80 px-4 pr-11 text-sm text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition focus:border-stone-900',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
    </div>
  )
}
