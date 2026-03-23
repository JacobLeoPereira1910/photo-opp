import { useEffect, useState } from 'react'
import { startTransition } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Clock3, Download, QrCode, Share2 } from 'lucide-react'
import { ActivationSessionActions } from '../components/layout/activation-session-actions.jsx'
import { PhoneShell } from '../components/layout/phone-shell.jsx'
import { Button } from '../components/ui/button.jsx'
import { Card } from '../components/ui/card.jsx'
import { StatusToast } from '../features/activation/components/status-toast.jsx'
import { ActivationFlowSteps } from '../features/activation/components/activation-flow-steps.jsx'
import { useActivationFlow } from '../features/activation/context/activation-flow-context.jsx'

const AUTO_RETURN_SECONDS = 15
const TIMER_EXTENSION_SECONDS = 15
const MAX_RETURN_SECONDS = 60

export function ActivationSharePage() {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(AUTO_RETURN_SECONDS)
  const [returnWindow, setReturnWindow] = useState(AUTO_RETURN_SECONDS)
  const [shareStatus, setShareStatus] = useState(null) // 'sharing' | 'done' | 'error'
  const [now, setNow] = useState(() => Date.now())
  const { eventConfig, uploadedPhoto } = useActivationFlow()
  const nextRoute = eventConfig?.features?.reactionEnabled ? '/activation/reaction' : '/activation/thanks'
  const qrTtlMinutes = Math.max(1, Math.round((eventConfig?.qrCode?.ttlSeconds || 900) / 60))
  const accessUrl = uploadedPhoto?.qrCodeValue || uploadedPhoto?.metadata?.qr?.accessUrl || uploadedPhoto?.downloadUrl
  const qrExpiresAt = uploadedPhoto?.metadata?.qr?.expiresAt
    ? new Date(uploadedPhoto.metadata.qr.expiresAt)
    : null
  const qrSecondsLeft = qrExpiresAt
    ? Math.max(0, Math.ceil((qrExpiresAt.getTime() - now) / 1000))
    : null
  const isQrExpired = qrSecondsLeft === 0

  useEffect(() => {
    if (!uploadedPhoto) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setTimeLeft((current) => (current > 1 ? current - 1 : 1))
      setNow(Date.now())
    }, 1000)

    const redirectTimer = window.setTimeout(() => {
      startTransition(() => {
        navigate(nextRoute)
      })
    }, returnWindow * 1000)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(redirectTimer)
    }
  }, [navigate, nextRoute, returnWindow, uploadedPhoto])

  async function handleShare() {
    if (!navigator.share) return
    setShareStatus('sharing')
    try {
      await navigator.share({
        title: 'Minha foto no evento!',
        text: 'Veja minha foto do evento.',
        url: accessUrl,
      })
      setShareStatus('done')
    } catch {
      setShareStatus(null) // usuário cancelou ou falhou
    }
  }

  function handleFinishNow() {
    startTransition(() => {
      navigate(nextRoute)
    })
  }

  if (!uploadedPhoto) {
    return <Navigate to="/activation/camera" replace />
  }

  const canShare = typeof navigator.share === 'function'

  return (
    <PhoneShell footer="final screen • qr code • auto reset" headerRight={<ActivationSessionActions />}>
      <div className="flex h-full flex-col gap-4">
        <ActivationFlowSteps currentStep="share" />

        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Entrega final
          </p>
          <h1 className="font-display text-4xl font-semibold text-stone-950">
            {eventConfig?.copy?.shareTitle || 'Aponte a câmera do celular para o QR Code'}
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-6 text-stone-500">
            {eventConfig?.copy?.shareDescription ||
              'O visitante pode escanear agora e baixar a foto finalizada direto no telefone, sem precisar digitar nada.'}
          </p>
        </div>

        <Card className="grid-surface flex-1 rounded-[30px] p-4">
          <div className="flex h-full flex-col gap-4">
            <div className="grid gap-4 rounded-3xl border border-stone-200/80 bg-white/75 p-4 sm:grid-cols-[96px_1fr] sm:items-center">
              <img
                src={uploadedPhoto.framedUrl}
                alt="Miniatura da foto"
                className="mx-auto aspect-9/16 w-24 rounded-[18px] object-cover"
              />

              <div className="space-y-2 text-center sm:text-left">
                <p className="font-display text-lg font-semibold text-stone-900">
                  Foto final pronta
                </p>
                <p className="text-sm leading-6 text-stone-500">
                  {isQrExpired
                    ? 'O QR desta sessão expirou. O visitante precisa voltar ao promotor para gerar um novo acesso.'
                    : 'O QR Code aponta para uma página pública com o download da foto.'}
                </p>
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Button asChild variant="outline" size="sm">
                    <a href={accessUrl} target="_blank" rel="noreferrer">
                      <QrCode className="mr-2 size-4" />
                      Abrir página pública
                    </a>
                  </Button>
                  {!isQrExpired ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={uploadedPhoto.downloadUrl} target="_blank" rel="noreferrer">
                        <Download className="mr-2 size-4" />
                        Download direto
                      </a>
                    </Button>
                  ) : null}
                  {canShare && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={shareStatus === 'sharing'}
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 size-4" />
                      {shareStatus === 'done' ? 'Compartilhado!' : 'Compartilhar'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center rounded-[28px] border border-stone-200/80 bg-white/92 p-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                <QrCode className="size-3.5" />
                {isQrExpired ? 'QR expirado' : 'Escaneie para baixar'}
              </div>
              {isQrExpired ? (
                <div className="w-full max-w-xs rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center">
                  <p className="font-display text-2xl font-semibold text-amber-900">
                    Validade encerrada
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    O visitante precisa voltar ao promotor para um novo QR. A página pública já mostra esse estado ao escanear.
                  </p>
                </div>
              ) : (
                <div className="grid place-items-center rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_20px_40px_-35px_rgba(0,0,0,0.45)]">
                  <img
                    src={uploadedPhoto.qrCodeUrl}
                    alt="QR code da foto"
                    className="size-52 max-w-full object-contain"
                  />
                </div>
              )}
              <p className="mt-4 max-w-xs text-center text-sm leading-6 text-stone-500">
                {isQrExpired
                  ? 'Finalize a sessão ou recomece uma nova captura quando o visitante estiver pronto.'
                  : (eventConfig?.copy?.shareHint ||
                    'Se preferir, o promotor também pode abrir a página pública e enviar o link pelo navegador.')}
              </p>
            </div>
          </div>
        </Card>

        {isQrExpired ? (
          <StatusToast
            title="QR expirado"
            description="A página pública continua acessível, mas agora informa que a validade encerrou."
            tone="warning"
          />
        ) : null}

        <div
          className={`rounded-[22px] px-4 py-3 text-center text-sm ${isQrExpired ? 'border border-rose-200 bg-rose-50 text-rose-700' : 'border border-amber-200 bg-amber-50 text-amber-700'}`}
        >
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-2">
            <span className="inline-flex items-center gap-2 font-medium">
              <Clock3 className="size-4" />
              Retornando ao início em {timeLeft}s
            </span>
            <span className={`text-[0.72rem] font-semibold uppercase tracking-[0.16em] ${isQrExpired ? 'text-rose-800/80' : 'text-amber-800/80'}`}>
              {isQrExpired
                ? 'QR expirado'
                : `QR válido por ${qrSecondsLeft ?? qrTtlMinutes * 60}s`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const nextWindow = Math.min(MAX_RETURN_SECONDS, returnWindow + TIMER_EXTENSION_SECONDS)
              setReturnWindow(nextWindow)
              setTimeLeft(nextWindow)
            }}
          >
            +15s de tempo
          </Button>
          <Button fullWidth size="lg" onClick={handleFinishNow}>
            Finalizar agora
          </Button>
        </div>
      </div>
    </PhoneShell>
  )
}
