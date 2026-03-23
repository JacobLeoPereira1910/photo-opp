import { LoaderCircle } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Spinner({ className }) {
  return <LoaderCircle className={cn('size-6 animate-spin', className)} />
}
