import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/cn'

export function Tabs({ className, ...props }) {
  return <TabsPrimitive.Root className={cn('space-y-6', className)} {...props} />
}

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex rounded-2xl border border-white/50 bg-white/65 p-1 backdrop-blur', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'rounded-xl px-4 py-2 text-sm font-medium text-stone-500 transition data-[state=active]:bg-stone-900 data-[state=active]:text-white',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn('space-y-6', className)} {...props} />
}
