import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog.jsx'
import { Button } from '../../../components/ui/button.jsx'
import { Badge } from '../../../components/ui/badge.jsx'
import { formatDateTime } from '../../../lib/format.js'

export function PhotoDetailDialog({ photo, qrCode, open, onOpenChange }) {
  async function handleCopyLink() {
    if (!photo?.downloadUrl || !navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(photo.downloadUrl)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border-white/10 bg-[#111111]/95 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Detalhes da foto</DialogTitle>
          <DialogDescription className="text-stone-400">
            Visualizacao completa da foto processada, metadados e QR Code final.
          </DialogDescription>
        </DialogHeader>

        {photo ? (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-stone-950">
              <img
                src={photo.framedUrl}
                alt="Foto processada"
                className="aspect-[9/16] w-full object-contain"
              />
            </div>

            <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-white">
                  {photo.promoter?.name}
                </h3>
                <Badge variant={photo.status === 'ready' ? 'success' : 'warning'}>
                  {photo.status}
                </Badge>
              </div>

              <dl className="space-y-3 text-sm text-stone-400">
                <div>
                  <dt className="font-semibold text-white">Criada em</dt>
                  <dd>{formatDateTime(photo.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Moldura</dt>
                  <dd>{photo.frameName || '-'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Reação</dt>
                  <dd>{photo.reaction ? (photo.reaction === 'liked' ? 'Curtiu' : 'Não curtiu') : 'Sem reação'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Origem</dt>
                  <dd>{photo.metadata?.customData?.source || '-'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Arquivo original</dt>
                  <dd>{photo.metadata?.originalFilename || '-'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Tamanho</dt>
                  <dd>{photo.metadata?.size || 0} bytes</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Evento</dt>
                  <dd>{photo.metadata?.event?.name || '-'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">QR expira em</dt>
                  <dd>{photo.metadata?.qr?.expiresAt ? formatDateTime(photo.metadata.qr.expiresAt) : '-'}</dd>
                </div>
              </dl>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  QR Code
                </p>
                <div className="grid place-items-center rounded-[20px] border border-white/10 bg-white p-4">
                  <img
                    src={qrCode?.qrCodeUrl || photo.qrCodeUrl}
                    alt="QR code da foto"
                    className="size-40 object-contain"
                  />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <Button asChild fullWidth className="bg-white text-stone-950 hover:bg-stone-200">
                  <a href={photo.downloadUrl} target="_blank" rel="noreferrer">
                    Abrir download
                  </a>
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  className="border border-white/10 bg-white/6 text-white hover:bg-white/12"
                  onClick={handleCopyLink}
                >
                  Copiar link
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  fullWidth
                  className="border border-white/10 bg-white/6 text-white hover:bg-white/12"
                >
                  <a href={qrCode?.qrCodeUrl || photo.qrCodeUrl} target="_blank" rel="noreferrer">
                    Abrir QR
                  </a>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  fullWidth
                  className="border border-white/10 bg-white/6 text-white hover:bg-white/12"
                >
                  <a href={photo.originalUrl} target="_blank" rel="noreferrer">
                    Ver original
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
