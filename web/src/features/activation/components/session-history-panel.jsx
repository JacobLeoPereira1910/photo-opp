import { useEffect, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { apiClient } from '../../../lib/api-client.js'
import { Button } from '../../../components/ui/button.jsx'
import { Spinner } from '../../../components/ui/spinner.jsx'

export function SessionHistoryPanel({ onClose }) {
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiClient
      .getActivationHistory()
      .then((data) => setPhotos(data?.photos || []))
      .catch(() => setError('Não foi possível carregar o histórico.'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-107.5 rounded-t-[28px] border border-stone-200 bg-white p-6 pb-8 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-stone-200" />

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Sessão atual
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Histórico
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {isLoading && (
          <div className="flex h-36 items-center justify-center gap-3 text-sm text-stone-400">
            <Spinner className="size-5" />
            Carregando fotos...
          </div>
        )}

        {!isLoading && error && (
          <div className="flex h-36 items-center justify-center text-sm text-rose-500">
            {error}
          </div>
        )}

        {!isLoading && !error && photos.length === 0 && (
          <div className="flex h-36 items-center justify-center text-sm text-stone-400">
            Nenhuma foto registrada nesta sessão ainda.
          </div>
        )}

        {!isLoading && !error && photos.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-9/16 overflow-hidden rounded-[18px] bg-stone-100"
                >
                  {photo.framedUrl ? (
                    <img
                      src={photo.framedUrl}
                      alt="Foto da sessão"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone-400">
                      Processando
                    </div>
                  )}

                  {/* Reaction badge */}
                  {photo.reaction && (
                    <span className="absolute bottom-1.5 left-1.5 text-sm leading-none">
                      {photo.reaction === 'liked' ? '👍' : '👎'}
                    </span>
                  )}

                  {/* Open link overlay */}
                  {photo.downloadUrl && (
                    <a
                      href={photo.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-stone-950/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      <ExternalLink className="size-5 text-white drop-shadow" />
                    </a>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-stone-400">
              Últimas {photos.length} {photos.length === 1 ? 'foto' : 'fotos'} desta sessão
            </p>
          </>
        )}
      </div>
    </div>
  )
}
