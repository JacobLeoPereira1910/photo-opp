import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cn } from '../../lib/cn'

export function Separator({ className, orientation = 'horizontal', ...props }) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        'bg-stone-200/80',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      orientation={orientation}
      {...props}
    />
  )
}
