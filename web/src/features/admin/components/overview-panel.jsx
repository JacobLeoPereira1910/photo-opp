import { ArrowRight, Camera, Download, ScrollText } from 'lucide-react'
import { Button } from '../../../components/ui/button.jsx'
import { Badge } from '../../../components/ui/badge.jsx'
import { formatDateTime } from '../../../lib/format.js'
import { MetricsCards } from './metrics-cards.jsx'

const quickActions = [
  {
    id: 'photos',
    title: 'Fotos e QR Codes',
    description: 'Acompanhe capturas, filtros e o modal com QR Code.',
    icon: Camera,
    accent: 'emerald',
  },
  {
    id: 'logs',
    title: 'Auditoria e exportação',
    description: 'Revise acessos, tentativas de login e exporte CSV.',
    icon: ScrollText,
    accent: 'violet',
  },
]

const accentStyles = {
  emerald: {
    icon: 'border-emerald-100 bg-emerald-50/80 text-emerald-600 group-hover:bg-emerald-100',
    border: 'hover:border-emerald-200',
    arrow: 'group-hover:text-emerald-600',
  },
  violet: {
    icon: 'border-violet-100 bg-violet-50/80 text-violet-600 group-hover:bg-violet-100',
    border: 'hover:border-violet-200',
    arrow: 'group-hover:text-violet-600',
  },
}

export function OverviewPanel({ metrics, photos, logs, onSelectSection, onExportLogs, loading = false }) {
  const latestPhoto = photos?.items?.[0]
  const latestLog = logs?.items?.[0]

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_360px]">
      <section className="admin-content-card rounded-4xl p-6">
        <MetricsCards metrics={metrics} loading={loading} />
      </section>

      <div className="space-y-5">
        <section className="admin-content-card rounded-4xl p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
            atalhos rápidos
          </p>

          <div className="mt-4 space-y-3">
            {quickActions.map(({ id, title, description, icon: Icon, accent }) => {
              const styles = accentStyles[accent]
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectSection(id)}
                  className={`group flex w-full items-center gap-4 rounded-3xl border border-stone-100 bg-stone-50/60 p-5 text-left transition-all duration-200 ${styles.border} hover:bg-stone-50 hover:shadow-md active:scale-[0.99]`}
                >
                  <div
                    className={`grid size-12 shrink-0 place-items-center rounded-2xl border transition-all ${styles.icon}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-semibold text-stone-900">{title}</p>
                    <p className="mt-0.5 text-sm leading-5 text-stone-500">{description}</p>
                  </div>
                  <ArrowRight
                    className={`size-5 text-stone-300 transition-all duration-200 group-hover:translate-x-1 ${styles.arrow}`}
                  />
                </button>
              )
            })}
          </div>
        </section>

        <section className="admin-content-card rounded-4xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
              sinais rápidos
            </p>

            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={onExportLogs}
            >
              <Download className="mr-2 size-4" />
              Exportar logs
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-3xl border border-stone-100 bg-stone-50/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-stone-500">Última foto processada</p>
                  <p className="mt-2 font-display text-xl font-semibold text-stone-900">
                    {latestPhoto?.promoter?.name || 'Sem capturas recentes'}
                  </p>
                </div>
                {latestPhoto ? (
                  <Badge variant={latestPhoto.status === 'ready' ? 'success' : 'warning'}>
                    {latestPhoto.status}
                  </Badge>
                ) : (
                  <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                    vazio
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-stone-400">
                {latestPhoto ? formatDateTime(latestPhoto.createdAt) : 'Aguardando nova captura.'}
              </p>
            </div>

            <div className="rounded-3xl border border-stone-100 bg-stone-50/60 p-4">
              <p className="text-sm text-stone-500">Último evento registrado</p>
              <p className="mt-2 font-display text-xl font-semibold text-stone-900">
                {latestLog?.action || 'Nenhum evento no período'}
              </p>
              <p className="mt-2 text-sm text-stone-400">
                {latestLog
                  ? `${latestLog.method} ${latestLog.route} • ${formatDateTime(latestLog.createdAt)}`
                  : 'Os eventos do sistema aparecerão aqui assim que ocorrerem.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
