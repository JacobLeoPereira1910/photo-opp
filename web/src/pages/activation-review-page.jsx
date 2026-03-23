import { startTransition } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ActivationSessionActions } from '../components/layout/activation-session-actions.jsx'
import { PhoneShell } from '../components/layout/phone-shell.jsx'
import { ActivationFlowSteps } from '../features/activation/components/activation-flow-steps.jsx'
import { PhotoStageCard } from '../features/activation/components/photo-stage-card.jsx'
import { useActivationFlow } from '../features/activation/context/activation-flow-context.jsx'

export function ActivationReviewPage() {
  const navigate = useNavigate()
  const { eventConfig, uploadedPhoto, resetFlow } = useActivationFlow()

  if (!uploadedPhoto) {
    return <Navigate to="/activation/camera" replace />
  }

  return (
    <PhoneShell footer="review • refazer • continuar" headerRight={<ActivationSessionActions />}>
      <div className="flex min-h-full flex-col gap-4">
        <ActivationFlowSteps currentStep="review" />
        <PhotoStageCard
          imageUrl={uploadedPhoto.framedUrl}
          title={eventConfig?.copy?.reviewTitle || 'Sua foto está pronta'}
          description={
            eventConfig?.copy?.reviewDescription ||
            'Revise em tela cheia, dê zoom com pinch e confirme antes de avançar para o QR Code.'
          }
          secondaryLabel="Refazer"
          secondaryAction={() => {
            resetFlow()
            startTransition(() => {
              navigate('/activation/camera')
            })
          }}
          primaryLabel="Continuar"
          primaryAction={() => {
            startTransition(() => {
              navigate('/activation/share')
            })
          }}
        />
      </div>
    </PhoneShell>
  )
}
