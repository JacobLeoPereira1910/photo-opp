import { useEffect, useRef, useState } from 'react'
import { startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCcw } from 'lucide-react'
import { apiClient } from '../lib/api-client'
import { useAuth } from '../features/auth/auth-context.jsx'
import { AdminShell } from '../components/layout/admin-shell.jsx'
import { Button } from '../components/ui/button.jsx'
import { Spinner } from '../components/ui/spinner.jsx'
import { OverviewPanel } from '../features/admin/components/overview-panel.jsx'
import { PhotosPanel } from '../features/admin/components/photos-panel.jsx'
import { LogsPanel } from '../features/admin/components/logs-panel.jsx'
import { PhotoDetailDialog } from '../features/admin/components/photo-detail-dialog.jsx'
import { LogDetailDialog } from '../features/admin/components/log-detail-dialog.jsx'

const defaultFilters = {
  page: '1',
  limit: '10',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  query: '',
  frameName: '',
  reaction: '',
  status: '',
  action: '',
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [activeSection, setActiveSection] = useState('overview')
  const [metrics, setMetrics] = useState(null)
  const [photos, setPhotos] = useState({ items: [] })
  const [logs, setLogs] = useState({ items: [] })
  const [photoFilters, setPhotoFilters] = useState(defaultFilters)
  const [logFilters, setLogFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [panelLoading, setPanelLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [selectedPhotoQr, setSelectedPhotoQr] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

  const sectionMeta = {
    overview: {
      eyebrow: 'overview',
      title: 'Painel de operação',
      description: 'Acompanhe os números da ativação e acesse rapidamente fotos e auditoria.',
    },
    photos: {
      eyebrow: 'fotos',
      title: 'Gestão de capturas',
      description: 'Busque fotos processadas, filtre por período e abra o QR Code final.',
    },
    logs: {
      eyebrow: 'logs',
      title: 'Auditoria do sistema',
      description: 'Monitore login, rotas acessadas, eventos sensíveis e exportações.',
    },
  }

  function applyPhotoFilters(nextFilters) {
    setPhotoFilters(nextFilters)
    refreshPhotos(nextFilters)
  }

  function resetPhotoFilters() {
    applyPhotoFilters({
      ...defaultFilters,
      limit: photoFilters.limit || '10',
      page: '1',
    })
  }

  function applyPhotoPreset(preset) {
    const today = new Date().toISOString().slice(0, 10)
    const presets = {
      failed: { ...photoFilters, page: '1', status: 'failed' },
      processing: { ...photoFilters, page: '1', status: 'processing' },
      today: { ...photoFilters, page: '1', startDate: today, endDate: today },
      noReaction: { ...photoFilters, page: '1', reaction: 'none' },
    }

    applyPhotoFilters(presets[preset] || photoFilters)
  }

  async function loadDashboard({ preserveScreen = false } = {}) {
    if (preserveScreen) {
      setPanelLoading(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const [metricsResult, photosResult, logsResult] = await Promise.all([
        apiClient.getAdminMetrics(),
        apiClient.listAdminPhotos(photoFilters),
        apiClient.listAdminLogs(logFilters),
      ])

      setMetrics(metricsResult)
      setPhotos(photosResult)
      setLogs(logsResult)
      setLastUpdatedAt(new Date())
    } catch (dashboardError) {
      setError(dashboardError.message || 'Nao foi possivel carregar o painel.')
    } finally {
      setLoading(false)
      setPanelLoading(false)
    }
  }

  const AUTO_REFRESH_MS = 60_000
  const refreshTimerRef = useRef(null)

  useEffect(() => {
    loadDashboard()

    refreshTimerRef.current = setInterval(() => {
      loadDashboard({ preserveScreen: true })
    }, AUTO_REFRESH_MS)

    return () => clearInterval(refreshTimerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function refreshPhotos(nextFilters = photoFilters) {
    setPanelLoading(true)
    setError('')

    try {
      const [metricsResult, photosResult] = await Promise.all([
        apiClient.getAdminMetrics(nextFilters),
        apiClient.listAdminPhotos(nextFilters),
      ])

      setMetrics(metricsResult)
      setPhotos(photosResult)
      setLastUpdatedAt(new Date())
    } catch (panelError) {
      setError(panelError.message || 'Nao foi possivel atualizar as fotos.')
    } finally {
      setPanelLoading(false)
    }
  }

  async function refreshLogs(nextFilters = logFilters) {
    setPanelLoading(true)
    setError('')

    try {
      const logsResult = await apiClient.listAdminLogs(nextFilters)
      setLogs(logsResult)
      setLastUpdatedAt(new Date())
    } catch (panelError) {
      setError(panelError.message || 'Nao foi possivel atualizar os logs.')
    } finally {
      setPanelLoading(false)
    }
  }

  async function handleOpenPhoto(photoId) {
    setPanelLoading(true)
    setError('')

    try {
      const [photoResult, qrResult] = await Promise.all([
        apiClient.getAdminPhoto(photoId),
        apiClient.getAdminPhotoQrCode(photoId),
      ])

      setSelectedPhoto(photoResult.photo)
      setSelectedPhotoQr(qrResult)
    } catch (panelError) {
      setError(panelError.message || 'Nao foi possivel abrir os detalhes da foto.')
    } finally {
      setPanelLoading(false)
    }
  }

  async function handleExportLogs() {
    try {
      const csv = await apiClient.exportAdminLogs(logFilters)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `photo-opp-logs-${Date.now()}.csv`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (exportError) {
      setError(exportError.message || 'Nao foi possivel exportar os logs.')
    }
  }

  if (loading) {
    return (
      <div className="admin-screen grid min-h-screen place-items-center px-4">
        <div className="admin-content-card flex items-center gap-4 rounded-[28px] px-6 py-5">
          <Spinner className="text-stone-700" />
          <div>
            <p className="font-display text-xl font-semibold text-stone-900">Carregando painel</p>
            <p className="text-sm text-stone-500">Buscando métricas, fotos e logs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <AdminShell
        user={auth.user}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={() => {
          auth.logout()
          startTransition(() => {
            navigate('/login')
          })
        }}
      >
        <div className="flex h-full min-h-0 flex-col gap-4">
          <section className="admin-content-card shrink-0 rounded-[28px] p-5 md:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  {sectionMeta[activeSection].eyebrow}
                </div>
                <h1 className="mt-3 font-display text-3xl font-semibold text-stone-900">
                  {sectionMeta[activeSection].title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                  {sectionMeta[activeSection].description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Indicador de última atualização + status */}
                <div className="flex items-center gap-2 rounded-[18px] border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                  {panelLoading ? (
                    <>
                      <span className="size-2 animate-pulse rounded-full bg-amber-400" />
                      <span className="text-amber-600 font-medium">Atualizando…</span>
                    </>
                  ) : (
                    <>
                      <span className="size-2 rounded-full bg-emerald-400" />
                      <span>
                        Atualizado às{' '}
                        <span className="font-semibold text-stone-900">
                          {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString('pt-BR') : '--:--'}
                        </span>
                      </span>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => loadDashboard({ preserveScreen: true })}
                  disabled={panelLoading}
                  className="h-10 rounded-2xl border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
                >
                  <RefreshCcw className={`mr-2 size-4 ${panelLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto">
            {activeSection === 'overview' ? (
              <OverviewPanel
                metrics={metrics}
                photos={photos}
                logs={logs}
                loading={panelLoading}
                onSelectSection={setActiveSection}
                onExportLogs={handleExportLogs}
              />
            ) : null}

            {activeSection === 'photos' ? (
              <PhotosPanel
                filters={photoFilters}
                loading={panelLoading}
                photos={photos}
                onFiltersChange={(key, value) =>
                  setPhotoFilters((current) => ({ ...current, [key]: value }))
                }
                onApplyFilters={() => {
                  const nextFilters = { ...photoFilters, page: '1' }
                  applyPhotoFilters(nextFilters)
                }}
                onApplyPreset={applyPhotoPreset}
                onResetFilters={resetPhotoFilters}
                onOpenPhoto={handleOpenPhoto}
                onPageChange={(page) => {
                  const nextFilters = { ...photoFilters, page: String(page) }
                  applyPhotoFilters(nextFilters)
                }}
                onLimitChange={(limit) => {
                  const nextFilters = {
                    ...photoFilters,
                    page: '1',
                    limit: String(limit),
                  }

                  applyPhotoFilters(nextFilters)
                }}
              />
            ) : null}

            {activeSection === 'logs' ? (
              <LogsPanel
                filters={logFilters}
                loading={panelLoading}
                logs={logs}
                onOpenLog={setSelectedLog}
                onFiltersChange={(key, value) =>
                  setLogFilters((current) => ({ ...current, [key]: value }))
                }
                onApplyFilters={() => {
                  const nextFilters = { ...logFilters, page: '1' }
                  setLogFilters(nextFilters)
                  refreshLogs(nextFilters)
                }}
                onExport={handleExportLogs}
                onPageChange={(page) => {
                  const nextFilters = { ...logFilters, page: String(page) }
                  setLogFilters(nextFilters)
                  refreshLogs(nextFilters)
                }}
                onLimitChange={(limit) => {
                  const nextFilters = {
                    ...logFilters,
                    page: '1',
                    limit: String(limit),
                  }

                  setLogFilters(nextFilters)
                  refreshLogs(nextFilters)
                }}
              />
            ) : null}
          </div>
        </div>
      </AdminShell>

      <PhotoDetailDialog
        open={Boolean(selectedPhoto)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPhoto(null)
            setSelectedPhotoQr(null)
          }
        }}
        photo={selectedPhoto}
        qrCode={selectedPhotoQr}
      />

      <LogDetailDialog
        open={Boolean(selectedLog)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLog(null)
          }
        }}
        log={selectedLog}
      />
    </>
  )
}
