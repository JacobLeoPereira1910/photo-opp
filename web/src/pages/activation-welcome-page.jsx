import { startTransition, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, History, Maximize2, Minimize2 } from 'lucide-react'
import { ActivationSessionActions } from '../components/layout/activation-session-actions.jsx'
import { PhoneShell } from '../components/layout/phone-shell.jsx'
import { Button } from '../components/ui/button.jsx'
import { StatusToast } from '../features/activation/components/status-toast.jsx'
import { useActivationFlow } from '../features/activation/context/activation-flow-context.jsx'
import { SessionHistoryPanel } from '../features/activation/components/session-history-panel.jsx'
import { apiClient } from '../lib/api-client.js'

export function ActivationWelcomePage() {
  const navigate = useNavigate()
  const {
    eventConfig,
    resetFlow,
    isOnline,
    configError,
    retryConfig,
  } = useActivationFlow()
  const [todayCount, setTodayCount] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)
  const [showHistory, setShowHistory] = useState(false)
  const [cameraReady, setCameraReady] = useState(null)
  const [sessionCount, setSessionCount] = useState(null)
  const canStartFlow = cameraReady !== false && isOnline && !configError

  useEffect(() => {
    apiClient.getActivationStats()
      .then((data) => setTodayCount(data?.todayPhotos ?? null))
      .catch(() => {})

    apiClient.getActivationHistory()
      .then((data) => setSessionCount(data?.photos?.length ?? 0))
      .catch(() => setSessionCount(0))

    navigator.mediaDevices?.enumerateDevices?.()
      .then((devices) => {
        setCameraReady(devices.some((device) => device.kind === 'videoinput'))
      })
      .catch(() => setCameraReady(false))
  }, [])

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function toggleKiosk() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  function handleStart() {
    resetFlow()
    startTransition(() => {
      navigate('/activation/camera')
    })
  }

  return (
    <>
      <PhoneShell footer="Photo Opp • portrait capture" headerRight={<ActivationSessionActions />}>
        <div className="flex h-full flex-col justify-between gap-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-white/50 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Promoter flow
              </span>
              {todayCount !== null && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    borderColor: 'var(--event-accent-border)',
                    backgroundColor: 'var(--event-accent-soft)',
                    color: 'var(--event-accent)',
                  }}
                >
                  📸 {todayCount} {todayCount === 1 ? 'foto hoje' : 'fotos hoje'}
                </span>
              )}
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-[4rem] font-semibold leading-[0.92] tracking-[-0.06em] text-stone-950">
                {(eventConfig?.copy?.welcomeTitle || 'Photo Opp')
                  .split(' ')
                  .map((chunk, index, chunks) => (
                    <span key={`${chunk}-${index}`}>
                      {chunk}
                      {index < chunks.length - 1 ? <br /> : null}
                    </span>
                  ))}
              </h1>
              <p className="max-w-xs text-sm leading-7 text-stone-500">
                {eventConfig?.copy?.welcomeDescription ||
                  'Prepare a câmera, conduza a captura e entregue a experiência completa com QR Code final.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {configError ? (
              <StatusToast
                title={configError.title}
                description={configError.description}
                tone={configError.tone}
                actionLabel="Tentar novamente"
                onAction={retryConfig}
              />
            ) : null}

            <div className="rounded-[28px] border border-white/55 bg-white/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Sequência
              </p>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                Abertura da câmera, contagem regressiva, moldura automática, revisão e entrega por QR Code.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/55 bg-white/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Pré-check operacional
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    Confirme que o posto está pronto antes de iniciar a próxima captura.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  pronto
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                {[
                  {
                    label: 'Câmera',
                    value: cameraReady === null ? 'Verificando...' : cameraReady ? 'Disponível' : 'Indisponível',
                    ok: cameraReady !== false,
                  },
                  {
                    label: 'API',
                    value: configError ? 'Indisponível' : 'Operacional',
                    ok: !configError,
                  },
                  {
                    label: 'Internet',
                    value: isOnline ? 'Online' : 'Offline',
                    ok: isOnline,
                  },
                  {
                    label: 'Tela cheia',
                    value: isFullscreen ? 'Ativa' : 'Opcional',
                    ok: true,
                  },
                  {
                    label: 'Sessão atual',
                    value: sessionCount === null ? 'Carregando...' : `${sessionCount} foto${sessionCount === 1 ? '' : 's'}`,
                    ok: true,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-stone-200/70 bg-white/80 px-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-stone-600">{item.label}</span>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <span className={`size-2 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button fullWidth size="lg" onClick={handleStart} disabled={!canStartFlow}>
              {canStartFlow ? 'Iniciar' : 'Aguardando ambiente'}
              <ArrowRight className="ml-2 size-4" />
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                size="sm"
                onClick={() => setShowHistory(true)}
              >
                <History className="mr-2 size-4" />
                Histórico
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                onClick={toggleKiosk}
                title={isFullscreen ? 'Sair do modo quiosque' : 'Ativar modo quiosque (tela cheia)'}
              >
                {isFullscreen
                  ? <Minimize2 className="size-4" />
                  : <Maximize2 className="size-4" />
                }
              </Button>
            </div>
          </div>
        </div>
      </PhoneShell>

      {showHistory && (
        <SessionHistoryPanel onClose={() => setShowHistory(false)} />
      )}
    </>
  )
}
