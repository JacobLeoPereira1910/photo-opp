import { startTransition, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api-client.js'
import { useActivationFlow } from '../features/activation/context/activation-flow-context.jsx'

const AUTO_RETURN_SECONDS = 10

export function ActivationReactionPage() {
  const navigate = useNavigate()
  const { eventConfig, uploadedPhoto, resetFlow } = useActivationFlow()
  const [pending, setPending] = useState(null)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(AUTO_RETURN_SECONDS)
  const reactionEnabled = Boolean(eventConfig?.features?.reactionEnabled)

  useEffect(() => {
    if (done || !uploadedPhoto || !reactionEnabled) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setTimeLeft((current) => (current > 1 ? current - 1 : 1))
    }, 1000)

    const timer = window.setTimeout(() => {
      resetFlow()
      startTransition(() => navigate('/activation'))
    }, AUTO_RETURN_SECONDS * 1000)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timer)
    }
  }, [done, navigate, reactionEnabled, resetFlow, uploadedPhoto])

  if (!uploadedPhoto) {
    return <Navigate to="/activation/camera" replace />
  }

  if (!reactionEnabled) {
    return <Navigate to="/activation/thanks" replace />
  }

  async function handleReaction(reaction) {
    if (pending || done) return
    setPending(reaction)
    try {
      await apiClient.reactToActivationPhoto(uploadedPhoto.id, reaction)
    } catch {
      // best-effort
    } finally {
      setDone(true)
      setTimeout(() => {
        resetFlow()
        startTransition(() => navigate('/activation'))
      }, 1500)
    }
  }

  return (
    <div className="relative flex min-h-screen items-end justify-center overflow-hidden bg-stone-950">

      {/* Foto em tela cheia */}
      <img
        src={uploadedPhoto.framedUrl}
        alt="Foto capturada"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />

      {/* Gradiente mais dramático e elegante */}
      <div className="absolute inset-x-0 bottom-0 h-[75%] bg-[linear-gradient(to_top,rgba(0,0,0,0.95)_35%,rgba(0,0,0,0.5)_60%,transparent)]" />

      {/* Overlay de confirmação pós-clique */}
      {done && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-black/65 backdrop-blur-md">
          <span className="animate-bounce text-7xl">✨</span>
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-white">Valeu pelo feedback!</p>
            <p className="mt-2 text-sm text-white/55">Preparando sua foto...</p>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="relative z-10 w-full max-w-107.5 space-y-6 px-5 pb-12">

        {/* Mini preview da foto */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={uploadedPhoto.framedUrl}
              alt="Sua foto"
              className="h-20 w-20 rounded-2xl object-cover object-top shadow-xl ring-2 ring-white/20"
            />
            <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-stone-900/80 backdrop-blur-sm ring-1 ring-white/20">
              <span className="text-xs leading-none">📸</span>
            </div>
          </div>
        </div>

        {/* Hierarquia textual */}
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/40">
            Avalie a experiência
          </p>
          <h1 className="mt-2 font-display text-5xl font-extrabold leading-tight text-white">
            {eventConfig?.copy?.reactionTitle || 'Curtiu a foto?'}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {eventConfig?.copy?.reactionDescription || 'Essa foi sua foto no evento'}
          </p>
        </div>

        {/* Botões */}
        <div className="grid grid-cols-2 gap-3">
          {/* Não curti — outline neutro */}
          <button
            type="button"
            disabled={!!pending || done}
            onClick={() => handleReaction('disliked')}
            className={`
              group flex flex-col items-center gap-3 rounded-3xl border py-7 text-center backdrop-blur-sm transition-all duration-200 active:scale-95
              ${pending === 'disliked'
                ? 'scale-95 border-rose-400/60 bg-rose-500/20 text-white shadow-lg shadow-rose-500/20'
                : 'border-white/15 bg-white/7 text-white/80 hover:border-white/25 hover:bg-white/13'
              }
              disabled:cursor-not-allowed disabled:opacity-50
            `}
          >
            <span className={`text-5xl leading-none transition-transform duration-200 ${pending === 'disliked' ? 'scale-125' : 'group-hover:scale-110'}`}>
              😕
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.14em]">
              {pending === 'disliked' ? '...' : 'Não curti'}
            </span>
          </button>

          {/* Curti — destaque violeta */}
          <button
            type="button"
            disabled={!!pending || done}
            onClick={() => handleReaction('liked')}
            className={`
              group flex flex-col items-center gap-3 rounded-3xl border py-7 text-center backdrop-blur-sm transition-all duration-200 active:scale-95
              ${pending === 'liked'
                ? 'scale-95 text-white shadow-xl'
                : 'text-white hover:shadow-lg'
              }
              disabled:cursor-not-allowed disabled:opacity-50
            `}
            style={{
              borderColor: pending === 'liked'
                ? 'var(--event-accent)'
                : 'var(--event-accent-border)',
              backgroundColor: pending === 'liked'
                ? 'var(--event-accent)'
                : 'var(--event-accent-muted)',
              boxShadow: pending === 'liked'
                ? '0 18px 36px -20px var(--event-accent-shadow)'
                : 'none',
            }}
          >
            <span className={`text-5xl leading-none transition-transform duration-200 ${pending === 'liked' ? 'scale-125' : 'group-hover:scale-110'}`}>
              😍
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.14em]">
              {pending === 'liked' ? '...' : 'Curti!'}
            </span>
          </button>
        </div>

        {/* Pular — mais visível mas ainda secundário */}
        <button
          type="button"
          onClick={() => {
            resetFlow()
            startTransition(() => navigate('/activation'))
          }}
          disabled={!!pending || done}
          className="w-full py-2 text-sm text-white/45 underline decoration-white/20 underline-offset-4 transition-all hover:text-white/75 hover:decoration-white/40 disabled:pointer-events-none"
        >
          Pular e finalizar
        </button>

        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
          Retornando ao início em {timeLeft}s
        </p>
      </div>
    </div>
  )
}
