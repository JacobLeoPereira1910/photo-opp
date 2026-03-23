import { startTransition, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ActivationSessionActions } from '../components/layout/activation-session-actions.jsx'
import { Button } from '../components/ui/button.jsx'
import { Card } from '../components/ui/card.jsx'
import { PhoneShell } from '../components/layout/phone-shell.jsx'
import { useActivationFlow } from '../features/activation/context/activation-flow-context.jsx'

export function ActivationThanksPage() {
  const navigate = useNavigate()
  const { eventConfig, uploadedPhoto, resetFlow } = useActivationFlow()

  useEffect(() => {
    if (!uploadedPhoto) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      resetFlow()
      startTransition(() => {
        navigate('/activation')
      })
    }, 8000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [navigate, resetFlow, uploadedPhoto])

  if (!uploadedPhoto) {
    return <Navigate to="/activation" replace />
  }

  return (
    <PhoneShell footer="obrigado • qr final" headerRight={<ActivationSessionActions />}>
      <div className="flex h-full flex-col justify-between gap-8 text-center">
        <div className="space-y-4">
          <h1 className="font-display text-5xl font-semibold text-stone-950">
            {eventConfig?.copy?.thanksTitle || 'Obrigado!'}
          </h1>
          <p className="mx-auto max-w-xs text-sm leading-7 text-stone-500">
            {eventConfig?.copy?.thanksDescription ||
              'O visitante já pode escanear o QR Code para baixar a foto final.'}
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
            Retornando ao início automaticamente
          </p>
        </div>

        <Card className="grid-surface mx-auto w-full max-w-[300px] rounded-[34px] p-5">
          <div className="rounded-[28px] border border-stone-200 bg-white p-5">
            <img
              src={uploadedPhoto.qrCodeUrl}
              alt="QR code final"
              className="mx-auto size-52 object-contain"
            />
          </div>
        </Card>

        <Button
          fullWidth
          size="lg"
          onClick={() => {
            resetFlow()
            startTransition(() => {
              navigate('/activation')
            })
          }}
        >
          Finalizar
        </Button>
      </div>
    </PhoneShell>
  )
}
