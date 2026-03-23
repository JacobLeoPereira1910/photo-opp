import { Download, Filter, ScrollText, Search } from 'lucide-react'
import { Button } from '../../../components/ui/button.jsx'
import { Input } from '../../../components/ui/input.jsx'
import { Select } from '../../../components/ui/select.jsx'
import { Spinner } from '../../../components/ui/spinner.jsx'
import { Badge } from '../../../components/ui/badge.jsx'
import { PaginationControls } from '../../../components/ui/pagination-controls.jsx'
import { formatDateTime } from '../../../lib/format.js'

function MethodBadge({ method }) {
  const styles = {
    GET: 'bg-blue-50 text-blue-600 border-blue-100',
    POST: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    PUT: 'bg-amber-50 text-amber-700 border-amber-100',
    PATCH: 'bg-amber-50 text-amber-700 border-amber-100',
    DELETE: 'bg-rose-50 text-rose-600 border-rose-100',
  }
  const cls = styles[method] || 'bg-stone-50 text-stone-600 border-stone-200'
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider ${cls}`}
    >
      {method}
    </span>
  )
}

export function LogsPanel({
  filters,
  loading,
  logs,
  onOpenLog,
  onFiltersChange,
  onApplyFilters,
  onExport,
  onPageChange,
  onLimitChange,
}) {
  return (
    <section className="admin-content-card relative flex h-full flex-col rounded-[28px] p-5">
      {/* Header */}
      <div className="shrink-0 space-y-4 border-b border-stone-100 pb-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-stone-400">
              logs de auditoria
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-semibold text-stone-900">
              Rastreabilidade
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Tentativas de login, rotas acessadas, IP mascarado e status final das respostas.
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={onExport}
            className="h-10 shrink-0 rounded-[15px] border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          >
            <Download className="mr-2 size-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="rounded-[22px] border border-stone-100 bg-stone-50/80 p-3.5">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="size-3.5 text-stone-400" />
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-stone-400">
              Filtros
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.3fr)_auto]">
            <Input
              aria-label="Data inicial dos logs"
              type="date"
              value={filters.startDate}
              onChange={(event) => onFiltersChange('startDate', event.target.value)}
              className="h-10 shadow-none"
            />
            <Input
              aria-label="Data final dos logs"
              type="date"
              value={filters.endDate}
              onChange={(event) => onFiltersChange('endDate', event.target.value)}
              className="h-10 shadow-none"
            />
            <Input
              aria-label="Hora inicial dos logs"
              type="time"
              value={filters.startTime}
              onChange={(event) => onFiltersChange('startTime', event.target.value)}
              className="h-10 shadow-none"
            />
            <Input
              aria-label="Hora final dos logs"
              type="time"
              value={filters.endTime}
              onChange={(event) => onFiltersChange('endTime', event.target.value)}
              className="h-10 shadow-none"
            />
            <Select
              aria-label="Ação dos logs"
              value={filters.action}
              onChange={(event) => onFiltersChange('action', event.target.value)}
              className="h-10 shadow-none"
            >
              <option value="">Todas as ações</option>
              <option value="auth.login.success">Login com sucesso</option>
              <option value="auth.login.invalid-email">Email inválido</option>
              <option value="auth.login.invalid-password">Senha inválida</option>
              <option value="admin.logs.list">Listagem de logs</option>
              <option value="admin.logs.export">Exportação de logs</option>
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
      <div className="relative flex min-h-0 flex-1 flex-col pt-4">
        {loading ? (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-[22px] bg-white/80 backdrop-blur-sm">
            <div className="rounded-[20px] border border-stone-100 bg-white px-6 py-5 text-center shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]">
              <Spinner className="mx-auto mb-3 size-6 text-stone-700" />
              <p className="font-display text-lg font-semibold text-stone-900">Atualizando logs</p>
            </div>
          </div>
        ) : null}

        {logs.items.length ? (
          <>
            {/* Mobile cards */}
            <div className="admin-scrollbar flex-1 overflow-y-auto md:hidden">
              <div className="space-y-2">
                {logs.items.map((log) => (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => onOpenLog(log)}
                    className="w-full rounded-[18px] border border-stone-100 bg-white p-4 text-left transition hover:border-stone-200 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5">
                        <p className="font-display text-sm font-semibold text-stone-900">
                          {log.action}
                        </p>
                        <div className="flex items-center gap-2">
                          <MethodBadge method={log.method} />
                          <p className="truncate text-xs text-stone-500">{log.route}</p>
                        </div>
                      </div>
                      <Badge variant={log.responseStatus >= 400 ? 'danger' : 'success'}>
                        {log.responseStatus}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-stone-50 pt-2.5">
                      <p className="text-xs text-stone-500">
                        {log.emailAttempted || log.userId || 'Sessão autenticada'}
                        {log.ip ? <span className="ml-1 text-stone-400">• {log.ip}</span> : null}
                      </p>
                      <p className="text-xs text-stone-400">{formatDateTime(log.createdAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop table */}
            <div className="admin-scrollbar hidden min-h-0 flex-1 overflow-auto rounded-[22px] border border-stone-100 md:block">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-stone-50">
                  <tr className="border-b border-stone-100">
                    <th className="px-4 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Método
                    </th>
                    <th className="px-4 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Evento / Rota
                    </th>
                    <th className="px-4 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Origem
                    </th>
                    <th className="px-4 py-3 text-right text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {logs.items.map((log, idx) => (
                    <tr
                      key={log.id}
                      onClick={() => onOpenLog(log)}
                      className={`cursor-pointer transition hover:bg-stone-50/80 ${idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/30'}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-stone-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <MethodBadge method={log.method} />
                      </td>
                      <td className="max-w-[260px] px-4 py-3.5">
                        <p className="truncate font-semibold text-stone-900">{log.action}</p>
                        <p className="mt-0.5 truncate text-[0.72rem] text-stone-400">{log.route}</p>
                      </td>
                      <td className="max-w-[200px] px-4 py-3.5">
                        <p className="truncate text-stone-700">
                          {log.emailAttempted || log.userId || 'Sessão autenticada'}
                        </p>
                        <p className="mt-0.5 truncate text-[0.72rem] text-stone-400">{log.ip}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Badge variant={log.responseStatus >= 400 ? 'danger' : 'success'}>
                          {log.responseStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center rounded-[22px] border border-dashed border-stone-200 bg-stone-50/60 px-6 py-12 text-center">
            <div>
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-stone-200 bg-white">
                <ScrollText className="size-6 text-stone-400" />
              </div>
              <p className="font-display text-xl font-semibold text-stone-800">
                Nenhum log encontrado
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Nenhum evento registrado para o período selecionado.
              </p>
            </div>
          </div>
        )}

        <PaginationControls
          page={logs.page || 1}
          totalPages={logs.totalPages || 1}
          limit={logs.limit || Number(filters.limit) || 10}
          total={logs.total || 0}
          loading={loading}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          tone="light"
        />
      </div>
    </section>
  )
}
