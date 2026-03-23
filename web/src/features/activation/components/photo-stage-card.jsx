import { Download, RefreshCcw } from 'lucide-react'
import { Button } from '../../../components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card.jsx'
import { ZoomableImageStage } from './zoomable-image-stage.jsx'

export function PhotoStageCard({
  imageUrl,
  qrCodeUrl,
  title,
  description,
  primaryAction,
  secondaryAction,
  primaryLabel,
  secondaryLabel,
}) {
  const hasSecondaryAction = Boolean(secondaryAction)

  return (
    <Card className="grid-surface flex min-h-full flex-col rounded-[30px] p-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="relative flex min-h-[58vh] flex-1 overflow-hidden rounded-[28px] border border-stone-200/80 bg-stone-100/70 p-2">
          {imageUrl ? (
            <ZoomableImageStage src={imageUrl} alt="Foto pronta" />
          ) : (
            <div className="aspect-[9/16] w-full rounded-[24px] bg-stone-900/5" />
          )}
        </div>

        {qrCodeUrl ? (
          <div className="rounded-[24px] border border-stone-200/80 bg-white/90 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Fazer download
            </p>
            <div className="mx-auto grid w-full max-w-[180px] place-items-center rounded-[20px] border border-stone-200 bg-white p-4">
              <img src={qrCodeUrl} alt="QR code da foto" className="size-36 object-contain" />
            </div>
          </div>
        ) : null}

        <div className={`mt-auto grid gap-3 ${hasSecondaryAction ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {secondaryAction ? (
            <Button variant="outline" onClick={secondaryAction}>
              <RefreshCcw className="mr-2 size-4" />
              {secondaryLabel}
            </Button>
          ) : null}

          {primaryAction ? (
            <Button onClick={primaryAction} fullWidth>
              <Download className="mr-2 size-4" />
              {primaryLabel}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
