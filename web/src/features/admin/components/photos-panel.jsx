import { Camera, Filter, QrCode, Search } from 'lucide-react'
import { Button } from '../../../components/ui/button.jsx'
import { Input } from '../../../components/ui/input.jsx'
import { Badge } from '../../../components/ui/badge.jsx'
import { Select } from '../../../components/ui/select.jsx'
import { Spinner } from '../../../components/ui/spinner.jsx'
import { PaginationControls } from '../../../components/ui/pagination-controls.jsx'
import { formatDateTime } from '../../../lib/format.js'

export function PhotosPanel({
  filters,
  loading,
  photos,
  onFiltersChange,
  onApplyFilters,
  onApplyPreset,
  onResetFilters,
  onOpenPhoto,
  onPageChange,
  onLimitChange,
}) {
  return (
    <section className="admin-content-card relative flex flex-col rounded-[28px] p-5">
      {/* Header */}
      <div className="shrink-0 space-y-4 border-b border-stone-100 pb-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-stone-400">
              fotos da ativação
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-semibold text-stone-900">
              Fotos e QR Codes
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Consulte capturas finalizadas, filtre por período e abra o QR Code de cada entrega.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.2em] text-stone-500">
              {photos.total || 0} registros
            </span>
            <span
              className={`rounded-full border px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.2em] ${
                photos.items.length
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-stone-200 bg-stone-50 text-stone-400'
              }`}
            >
              {photos.items.length ? 'dados carregados' : 'aguardando capturas'}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-[22px] border border-stone-100 bg-stone-50/80 p-3.5">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="size-3.5 text-stone-400" />
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-stone-400">
              Filtros
            </p>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {[
              ['failed', 'Falhou'],
              ['processing', 'Processando'],
              ['today', 'Prontas hoje'],
              ['noReaction', 'Sem reação'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onApplyPreset(value)}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-stone-500 transition hover:border-stone-300 hover:text-stone-800"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-stone-500 transition hover:border-stone-300 hover:text-stone-800"
            >
              Limpar
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-[minmax(0,1.4fr)_repeat(6,minmax(0,1fr))_auto]">
            <Input
              aria-label="Buscar fotos"
              value={filters.query}
              onChange={(event) => onFiltersChange('query', event.target.value)}
              placeholder="Buscar por nome, e-mail, ID ou moldura"
              className="h-10 shadow-none"
            />
            <Input
              aria-label="Data inicial das fotos"
              type="date"
              value={filters.startDate}
              onChange={(event) => onFiltersChange('startDate', event.target.value)}
              className="h-10 shadow-none"
            />
            <Input
              aria-label="Data final das fotos"
              type="date"
              value={filters.endDate}
              onChange={(event) => onFiltersChange('endDate', event.target.value)}
              className="h-10 shadow-none"
            />
            <Input
              aria-label="Hora inicial das fotos"
              type="time"
              value={filters.startTime}
              onChange={(event) => onFiltersChange('startTime', event.target.value)}
              className="h-10 shadow-none"
            />
            <Input
              aria-label="Hora final das fotos"
              type="time"
              value={filters.endTime}
              onChange={(event) => onFiltersChange('endTime', event.target.value)}
              className="h-10 shadow-none"
            />
            <Select
              aria-label="Status das fotos"
              value={filters.status}
              onChange={(event) => onFiltersChange('status', event.target.value)}
              className="h-10 shadow-none"
            >
              <option value="">Todos os status</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="failed">Failed</option>
            </Select>
            <Select
              aria-label="Moldura das fotos"
              value={filters.frameName}
              onChange={(event) => onFiltersChange('frameName', event.target.value)}
              className="h-10 shadow-none"
            >
              <option value="">Todas as molduras</option>
              <option value="NEXLAB FIGMA">NEXLAB Figma</option>
              <option value="NEXLAB EVENT">NEX Event</option>
              <option value="STANDARD">Standard</option>
              <option value="VIP">VIP</option>
            </Select>
            <Select
              aria-label="Reação das fotos"
              value={filters.reaction}
              onChange={(event) => onFiltersChange('reaction', event.target.value)}
              className="h-10 shadow-none"
            >
              <option value="">Todas as reações</option>
              <option value="liked">Curtiu</option>
              <option value="disliked">Não curtiu</option>
              <option value="none">Sem reação</option>
            </Select>
            <Button
              onClick={onApplyFilters}
              disabled={loading}
              className="h-10 rounded-[15px] bg-stone-900 text-white hover:bg-stone-800"
            >
              <Search className="mr-1.5 size-3.5" />
              Filtrar
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="relative flex flex-col pt-4">
        {loading ? (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-[22px] bg-white/80 backdrop-blur-sm">
            <div className="rounded-[20px] border border-stone-100 bg-white px-6 py-5 text-center shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]">
              <Spinner className="mx-auto mb-3 size-6 text-stone-700" />
              <p className="font-display text-lg font-semibold text-stone-900">Atualizando fotos</p>
            </div>
          </div>
        ) : null}

        {photos.items.length ? (
          <div className="pr-1">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {photos.items.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onOpenPhoto(photo.id)}
                  className="group overflow-hidden rounded-[24px] border border-stone-100 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-stone-200 hover:shadow-lg"
                >
                  {/* Thumbnail with hover overlay */}
                  <div className="relative overflow-hidden rounded-[18px] border border-stone-100 bg-stone-100">
                    <img
                      src={photo.framedUrl}
                      alt={`Foto ${photo.id}`}
                      className="aspect-[9/16] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/0 transition-all duration-300 group-hover:bg-stone-900/30">
                      <span className="translate-y-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-stone-900 opacity-0 shadow-md backdrop-blur-sm transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                        Ver detalhes
                      </span>
                    </div>
                  </div>

                  {/* Card info */}
                  <div className="space-y-3 px-1 pt-3.5 pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={photo.status === 'ready' ? 'success' : photo.status === 'failed' ? 'danger' : 'warning'}>
                        {photo.status}
                      </Badge>
                      <span className="text-[0.68rem] uppercase tracking-[0.16em] text-stone-400">
                        {formatDateTime(photo.createdAt)}
                      </span>
                    </div>

                    <div>
                      <p className="font-display text-lg font-semibold text-stone-900">
                        {photo.promoter?.name || 'Promotor'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-stone-500">
                        {photo.promoter?.email || '-'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-2.5">
                      <p className="text-xs text-stone-400">
                        Moldura{' '}
                        <span className="font-medium text-stone-700">{photo.frameName}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        {photo.reaction ? (
                          <span className="text-sm leading-none">
                            {photo.reaction === 'liked' ? '👍' : '👎'}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <QrCode className="size-3.5" />
                          QR Code
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid flex-1 place-items-center rounded-[22px] border border-dashed border-stone-200 bg-stone-50/60 px-6 py-12 text-center">
            <div>
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-stone-200 bg-white">
                <Camera className="size-6 text-stone-400" />
              </div>
              <p className="font-display text-xl font-semibold text-stone-800">
                Nenhuma foto encontrada
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Ajuste os filtros ou gere novas capturas na ativação.
              </p>
            </div>
          </div>
        )}

        <PaginationControls
          page={photos.page || 1}
          totalPages={photos.totalPages || 1}
          limit={photos.limit || Number(filters.limit) || 10}
          total={photos.total || 0}
          loading={loading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          tone="light"
        />
      </div>
    </section>
  )
}
