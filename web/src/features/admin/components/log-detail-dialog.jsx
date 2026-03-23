import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog.jsx'
import { Badge } from '../../../components/ui/badge.jsx'
import { formatDateTime } from '../../../lib/format.js'

function formatJson(value) {
  if (!value || (typeof value === 'object' && !Object.keys(value).length)) {
    return 'Nenhum dado disponível.'
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function LogDetailDialog({ log, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalhes do log</DialogTitle>
          <DialogDescription>
            Payload sanitizado, metadata técnica e informações de auditoria do evento.
          </DialogDescription>
        </DialogHeader>

        {log ? (
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4 rounded-[24px] border border-stone-200 bg-stone-50/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
                    Evento
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold text-stone-900">
                    {log.action}
                  </p>
                </div>
                <Badge variant={log.responseStatus >= 400 ? 'danger' : 'success'}>
                  {log.responseStatus}
                </Badge>
              </div>

              <dl className="space-y-3 text-sm text-stone-600">
                <div>
                  <dt className="font-semibold text-stone-900">Data</dt>
                  <dd>{formatDateTime(log.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-stone-900">Método</dt>
                  <dd>{log.method}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-stone-900">Rota</dt>
                  <dd className="break-all">{log.route}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-stone-900">Origem</dt>
                  <dd>{log.emailAttempted || log.userId || 'Sessão autenticada'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-stone-900">IP mascarado</dt>
                  <dd>{log.ip || '-'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-stone-900">Request ID</dt>
                  <dd className="break-all">{log.requestId || '-'}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4">
              <section className="rounded-[24px] border border-stone-200 bg-white p-4">
                <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Request Body Sanitizado
                </p>
                <pre className="admin-scrollbar max-h-64 overflow-auto rounded-[18px] bg-stone-950 p-4 text-xs leading-6 text-emerald-200">
                  {formatJson(log.requestBody)}
                </pre>
              </section>

              <section className="rounded-[24px] border border-stone-200 bg-white p-4">
                <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Metadata
                </p>
                <pre className="admin-scrollbar max-h-64 overflow-auto rounded-[18px] bg-stone-950 p-4 text-xs leading-6 text-sky-200">
                  {formatJson(log.metadata)}
                </pre>
              </section>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
