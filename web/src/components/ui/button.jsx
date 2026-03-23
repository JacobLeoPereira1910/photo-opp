import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-transparent bg-[var(--event-accent)] text-[var(--event-accent-contrast)] shadow-[0_14px_28px_-18px_var(--event-accent-shadow)] hover:brightness-95',
        secondary:
          'bg-white/75 text-stone-900 backdrop-blur hover:bg-white',
        outline:
          'border border-[var(--event-accent-border)] bg-transparent text-[var(--event-accent)] hover:border-[var(--event-accent)] hover:bg-[var(--event-accent-soft)]',
        ghost:
          'text-stone-600 hover:bg-[var(--event-accent-soft)] hover:text-[var(--event-accent)]',
      },
      size: {
        default: 'h-12 px-5',
        sm: 'h-10 px-4 text-xs',
        lg: 'h-14 px-6 text-base',
        icon: 'size-11 rounded-full',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  type = 'button',
  ...props
}) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      type={asChild ? undefined : type}
      {...props}
    />
  )
}
