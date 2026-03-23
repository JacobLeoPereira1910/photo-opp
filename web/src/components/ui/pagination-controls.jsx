import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Select } from './select.jsx'

const pageSizeOptions = [10, 20, 50, 100]

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right)
}

export function PaginationControls({
  page,
  totalPages,
  limit,
  total,
  loading,
  onPageChange,
  onLimitChange,
  tone = 'light',
}) {
  const visiblePages = getVisiblePages(page, totalPages)
  const isDark = tone === 'dark'

  const wrapperClassName = isDark
    ? 'border-white/8 text-stone-400'
    : 'border-stone-200/80 text-stone-500'
  const strongClassName = isDark ? 'text-white' : 'text-stone-900'
  const surfaceClassName = isDark
    ? 'rounded-[22px] border border-white/10 bg-white/[0.04]'
    : 'rounded-[22px] border border-stone-200 bg-white/90'
  const buttonClassName = isDark
    ? 'border-white/10 bg-white/[0.04] text-stone-200 hover:bg-white/[0.08]'
    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900'
  const activeButtonClassName = isDark
    ? 'bg-white text-stone-950'
    : 'bg-stone-900 text-white'

  return (
    <div className={`flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between ${wrapperClassName}`}>
      <div className="text-sm">
        Página <span className={`font-semibold ${strongClassName}`}>{page}</span> de{' '}
        <span className={`font-semibold ${strongClassName}`}>{totalPages}</span> •{' '}
        <span className={`font-semibold ${strongClassName}`}>{total}</span> itens
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className={`flex items-center gap-3 px-3 py-2 ${surfaceClassName}`}>
          <span className="text-sm">Por página</span>
          <Select
            value={String(limit)}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className={`h-10 min-w-24 rounded-xl py-0 shadow-none ${
              isDark ? 'border-white/10 bg-transparent text-stone-100' : 'border-stone-200 bg-white/95'
            }`}
            disabled={loading}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className={`flex items-center gap-1 p-1 ${surfaceClassName}`}>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={loading || page <= 1}
            className={`inline-flex h-10 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-45 ${buttonClassName}`}
          >
            <ChevronLeft className="mr-1 size-4" />
            Anterior
          </button>

          {visiblePages.map((visiblePage, index) => {
            const previousPage = visiblePages[index - 1]
            const shouldRenderGap = previousPage && visiblePage - previousPage > 1

            return (
              <span key={visiblePage} className="flex items-center gap-1">
                {shouldRenderGap ? <span className="px-1 text-sm text-stone-500">…</span> : null}
                <button
                  type="button"
                  onClick={() => onPageChange(visiblePage)}
                  disabled={loading}
                  className={`inline-flex size-10 items-center justify-center rounded-2xl text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 ${
                    visiblePage === page ? activeButtonClassName : buttonClassName
                  }`}
                >
                  {visiblePage}
                </button>
              </span>
            )
          })}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={loading || page >= totalPages}
            className={`inline-flex h-10 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-45 ${buttonClassName}`}
          >
            Próxima
            <ChevronRight className="ml-1 size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
