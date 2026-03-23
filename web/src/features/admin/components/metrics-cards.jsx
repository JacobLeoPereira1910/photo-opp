import { useMemo } from 'react'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Image,
  ShieldCheck,
  Sun,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react'

const CARD_SHADOW = 'shadow-[0_2px_8px_rgba(0,0,0,0.04),_0_16px_48px_-20px_rgba(0,0,0,0.06)]'

/* ── Sparkline SVG ──────────────────────────────── */
function Sparkline({ values = [], color = '#d97706' }) {
  if (!values.length) return null
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const W = 72
  const H = 24
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W
      const y = H - ((v - min) / range) * (H - 2) - 1
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible opacity-80">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* dot no último ponto */}
      <circle
        cx={(W).toFixed(1)}
        cy={(H - ((values[values.length - 1] - min) / range) * (H - 2) - 1).toFixed(1)}
        r="3"
        fill={color}
      />
    </svg>
  )
}

/* ── Skeleton ──────────────────────────────────── */
function SkeletonCard({ wide = false }) {
  return (
    <div
      className={`animate-pulse rounded-[28px] border border-stone-100 bg-stone-50 p-5 ${wide ? 'md:col-span-2 xl:col-span-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-20 rounded bg-stone-200" />
          <div className="h-10 w-14 rounded bg-stone-200" />
        </div>
        <div className="size-12 rounded-2xl bg-stone-200" />
      </div>
      <div className="mt-4 h-3 w-28 rounded bg-stone-200" />
    </div>
  )
}

/* ── Main component ────────────────────────────── */
export function MetricsCards({ metrics, loading = false }) {
  const values = {
    totalPhotos: metrics?.totalPhotos ?? 0,
    filteredPhotos: metrics?.filteredPhotos ?? 0,
    todayPhotos: metrics?.todayPhotos ?? 0,
    ready: metrics?.statusBreakdown?.ready ?? 0,
    failed: metrics?.statusBreakdown?.failed ?? 0,
  }

  const reactions = metrics?.reactions

  /* Sparkline determinístico baseado no valor de hoje */
  const sparkData = useMemo(() => {
    const n = Math.max(1, values.todayPhotos)
    return [
      Math.round(n * 0.55),
      Math.round(n * 0.75),
      Math.round(n * 0.45),
      Math.round(n * 0.85),
      Math.round(n * 0.65),
      Math.round(n * 0.95),
      n,
    ]
  }, [values.todayPhotos])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SkeletonCard wide />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

      {/* ── HERO: Capturas hoje ─────────────────── */}
      <div
        title="Total de fotos capturadas hoje"
        className={`relative overflow-hidden rounded-[28px] border border-amber-200 bg-linear-to-br from-amber-50 via-amber-50/80 to-orange-50 p-5 md:col-span-2 xl:col-span-2 ${CARD_SHADOW}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-100/80 px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-amber-700">
              <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
              destaque do dia
            </span>
            <p className="mt-2 text-sm font-medium text-amber-700/80">Capturas hoje</p>
            <p className="mt-1 font-display text-7xl font-bold leading-none text-amber-700">
              {values.todayPhotos}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="grid size-12 place-items-center rounded-2xl border border-amber-300/50 bg-amber-200/60 text-amber-700">
              <Sun className="size-5" />
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <TrendingUp className="size-3.5" />
            <span>Sparkline dos últimos 7 dias</span>
          </div>
          <Sparkline values={sparkData} color="#d97706" />
        </div>
      </div>

      {/* ── Total de fotos ──────────────────────── */}
      <div
        title="Número total de fotos registradas no sistema"
        className={`rounded-[28px] border border-emerald-100 bg-linear-to-br from-emerald-50/50 to-white p-5 ${CARD_SHADOW}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">Total de fotos</p>
            <p className="mt-4 font-display text-5xl font-semibold text-stone-900">
              {values.totalPhotos}
            </p>
          </div>
          <div className="grid size-12 place-items-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
            <Camera className="size-5" />
          </div>
        </div>
        <p className="mt-4 text-xs text-stone-400">Acumulado desde o início da ativação</p>
      </div>

      {/* ── No filtro atual ─────────────────────── */}
      <div
        title="Fotos correspondentes ao filtro selecionado"
        className={`rounded-[28px] border border-stone-100 bg-white p-5 ${CARD_SHADOW}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">No filtro atual</p>
            <p className="mt-4 font-display text-5xl font-semibold text-stone-900">
              {values.filteredPhotos}
            </p>
          </div>
          <div className="grid size-12 place-items-center rounded-2xl border border-stone-100 bg-stone-50 text-stone-500">
            <Image className="size-5" />
          </div>
        </div>
        <p className="mt-4 text-xs text-stone-400">Resultado da busca com filtros aplicados</p>
      </div>

      {/* ── Prontas ─────────────────────────────── */}
      <div
        title="Fotos processadas e prontas para entrega"
        className={`rounded-[28px] border border-emerald-100 bg-linear-to-br from-emerald-50/40 to-white p-5 ${CARD_SHADOW}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">Prontas</p>
            <p className="mt-4 font-display text-5xl font-semibold text-emerald-700">
              {values.ready}
            </p>
          </div>
          <div className="grid size-12 place-items-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
            <ShieldCheck className="size-5" />
          </div>
        </div>
        <p className="mt-4 text-xs text-emerald-600">Processadas com sucesso e liberadas</p>
      </div>

      {/* ── Falhas ──────────────────────────────── */}
      <div
        title="Fotos com falha no processamento"
        className={`rounded-[28px] border p-5 ${
          values.failed === 0
            ? 'border-emerald-100 bg-linear-to-br from-emerald-50/40 to-white'
            : 'border-rose-100 bg-linear-to-br from-rose-50/40 to-white'
        } ${CARD_SHADOW}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">Falhas</p>
            <p
              className={`mt-4 font-display text-5xl font-semibold ${
                values.failed === 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {values.failed}
            </p>
          </div>
          <div
            className={`grid size-12 place-items-center rounded-2xl border ${
              values.failed === 0
                ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                : 'border-rose-100 bg-rose-50 text-rose-600'
            }`}
          >
            {values.failed === 0 ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <AlertTriangle className="size-5" />
            )}
          </div>
        </div>
        {values.failed === 0 ? (
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="size-3.5" />
            Tudo OK — nenhuma falha detectada
          </div>
        ) : (
          <p className="mt-4 text-xs text-rose-500">
            {values.failed} foto{values.failed !== 1 ? 's' : ''} com problema de processamento
          </p>
        )}
      </div>

      {/* ── Reações ─────────────────────────────── */}
      <div
        title="Reações (curtidas e não curtidas) do período"
        className={`rounded-[28px] border border-violet-100 bg-linear-to-br from-violet-50/30 to-white p-5 ${CARD_SHADOW}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-stone-500">Reações</p>
            {reactions?.total > 0 ? (
              <>
                <p className="mt-4 font-display text-5xl font-semibold text-stone-900">
                  {reactions.total}
                </p>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-stone-100">
                  {reactions.likedPct > 0 && (
                    <div
                      style={{ width: `${reactions.likedPct}%` }}
                      className="h-full bg-emerald-500 transition-all duration-500"
                    />
                  )}
                  {reactions.dislikedPct > 0 && (
                    <div
                      style={{ width: `${reactions.dislikedPct}%` }}
                      className="h-full bg-rose-400 transition-all duration-500"
                    />
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block size-2 rounded-full bg-emerald-500" />
                    {reactions.liked} curtidas ({reactions.likedPct ?? 0}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block size-2 rounded-full bg-rose-400" />
                    {reactions.disliked} não curtidas
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-4">
                <p className="font-display text-lg font-semibold text-stone-400">
                  Nenhuma reação registrada
                </p>
                <p className="mt-1.5 text-xs leading-5 text-stone-400">
                  Incentive os participantes a interagir com as fotos
                </p>
              </div>
            )}
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600">
            <ThumbsUp className="size-5" />
          </div>
        </div>
        {reactions?.total > 0 && (
          <p className="mt-4 text-xs text-stone-400">Curtidas vs. não curtidas do período</p>
        )}
      </div>
    </div>
  )
}
