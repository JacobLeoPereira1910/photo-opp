import { AlertCircle, CheckCircle2, RefreshCcw, X } from 'lucide-react'
import { Button } from '../../../components/ui/button.jsx'
import { cn } from '../../../lib/cn.js'

const toneClasses = {
  error: {
    shell: 'border-rose-200 bg-rose-50/95 text-rose-700',
    icon: 'text-rose-500',
  },
  success: {
    shell: 'border-emerald-200 bg-emerald-50/95 text-emerald-700',
    icon: 'text-emerald-500',
  },
  warning: {
    shell: 'border-amber-200 bg-amber-50/95 text-amber-800',
    icon: 'text-amber-600',
  },
  info: {
    shell: 'border-sky-200 bg-sky-50/95 text-sky-800',
    icon: 'text-sky-600',
  },
}

export function StatusToast({
  title,
  description,
  tone = 'error',
  actionLabel,
  onAction,
  onDismiss,
  className,
}) {
  const styles = toneClasses[tone] || toneClasses.error
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle

  return (
    <div
      className={cn(
        'rounded-[22px] border px-4 py-3 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.35)] backdrop-blur-sm',
        styles.shell,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 size-5 shrink-0', styles.icon)} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          {description ? (
            <p className="mt-1 text-sm leading-5 opacity-80">{description}</p>
          ) : null}
          {actionLabel && onAction ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-8 rounded-full border border-current/15 bg-white/55 px-3 text-current hover:bg-white/80"
              onClick={onAction}
            >
              <RefreshCcw className="mr-2 size-3.5" />
              {actionLabel}
            </Button>
          ) : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="grid size-7 shrink-0 place-items-center rounded-full text-current/60 transition hover:bg-black/5 hover:text-current"
            aria-label="Dispensar aviso"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
