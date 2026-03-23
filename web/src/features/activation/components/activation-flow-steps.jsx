import { cn } from '../../../lib/cn.js'

const STEPS = [
  { id: 'capture', label: 'Captura' },
  { id: 'review', label: 'Revisão' },
  { id: 'share', label: 'Entrega' },
]

export function ActivationFlowSteps({ currentStep }) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep)
  const currentStyle = {
    borderColor: 'var(--event-accent-border)',
    backgroundColor: 'var(--event-accent-soft)',
    color: 'var(--event-accent)',
  }
  const currentBadgeStyle = {
    backgroundColor: 'var(--event-accent)',
    color: 'var(--event-accent-contrast)',
  }

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const isCurrent = currentStep === step.id
        const isDone = index < currentIndex

        return (
          <div key={step.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border px-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-colors',
                isCurrent
                  ? ''
                  : isDone
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-white/55 bg-white/55 text-stone-400',
              )}
              style={isCurrent ? currentStyle : undefined}
            >
              <span
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full text-[0.62rem]',
                  isCurrent
                    ? ''
                    : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-stone-200 text-stone-500',
                )}
                style={isCurrent ? currentBadgeStyle : undefined}
              >
                {isDone ? '✓' : index + 1}
              </span>
              <span className="truncate">{step.label}</span>
            </div>

            {index < STEPS.length - 1 ? (
              <div className={cn('h-px flex-1', isDone ? 'bg-emerald-300' : 'bg-white/55')} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
