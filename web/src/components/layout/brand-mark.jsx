import { useNavigate } from 'react-router-dom'

export function BrandMark({ compact = false, onDark = false, homeRoute = '/' }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(homeRoute)}
      className={`flex items-center transition-opacity hover:opacity-75 active:opacity-50 ${compact ? "gap-2" : "gap-3"}`}
    >
      {/* Logo — quadrado intencional, identidade tech da NEX */}
      <div
        className={`grid place-items-center rounded-lg border text-stone-900 ${
          onDark
            ? "border-white/15 bg-white"
            : "border-stone-900/20 bg-white/80"
        } ${compact ? "size-11" : "size-14"}`}
      >
        <span
          className={`font-display font-bold uppercase tracking-[0.28em] ${compact ? "text-[0.62rem]" : "text-[0.8rem]"}`}
        >
          NEX
        </span>
      </div>

      {/* Wordmark */}
      <div className="space-y-1">
        <p
          className={`font-display font-semibold uppercase tracking-[0.16em] leading-none ${
            onDark ? "text-white" : "text-stone-900"
          } ${compact ? "text-sm" : "text-base"}`}
        >
          Nex.lab
        </p>

        {/* Tagline com "events" em roxo e cursor piscante */}
        <p className={`flex items-baseline gap-0 font-semibold text-[0.65rem] uppercase tracking-[0.18em] leading-none ${onDark ? "text-stone-400" : "text-stone-500"}`}>
          we&nbsp;make&nbsp;
          <span style={{ color: 'var(--event-accent, #7c3aed)' }}>events</span>
          &nbsp;simple
          <span
            className="ml-px animate-[blink_1.1s_step-end_infinite]"
            style={{ color: 'var(--event-accent, #7c3aed)' }}
          >
            _
          </span>
        </p>
      </div>
    </button>
  );
}
