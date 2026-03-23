import { LayoutDashboard, LogOut, QrCode, ScrollText, ShieldCheck } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/avatar.jsx'
import { Button } from '../ui/button.jsx'
import { BrandMark } from './brand-mark.jsx'
import { formatRole } from '../../lib/format.js'

const navigationItems = [
  {
    id: 'overview',
    label: 'Visão geral',
    description: 'Métricas, atalhos e status da operação',
    icon: LayoutDashboard,
  },
  {
    id: 'photos',
    label: 'Fotos e QR',
    description: 'Capturas, filtros e QR Codes finais',
    icon: QrCode,
  },
  {
    id: 'logs',
    label: 'Logs',
    description: 'Auditoria, rastreio e exportação CSV',
    icon: ScrollText,
  },
]

export function AdminShell({ user, activeSection, onSectionChange, onLogout, children }) {
  return (
    /* Full-viewport container — sem padding externo */
    <div className="flex h-screen w-full overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="admin-panel page-enter flex w-65 shrink-0 flex-col overflow-y-auto shell-scrollbar px-4 py-6">

        {/* Logo */}
        <div className="shrink-0 px-2 pb-6">
          <BrandMark compact onDark homeRoute="/admin" />
        </div>

        {/* User card */}
        <div className="admin-grid mx-2 shrink-0 rounded-[20px] border border-white/10 bg-white/4 p-3.5">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar className="size-10">
                <AvatarFallback className="bg-white text-[0.65rem] font-bold text-stone-950">
                  {user?.name?.slice(0, 2)?.toUpperCase() || 'NX'}
                </AvatarFallback>
              </Avatar>
              {/* Status online */}
              <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-stone-900 bg-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-[0.88rem] font-semibold leading-tight text-white">
                {user?.name}
              </p>
              <p className="mt-0.5 text-[0.7rem] text-stone-400">{formatRole(user?.role)}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              RBAC ativo
            </span>
            <span className="rounded-full border border-white/10 bg-white/3 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
              {formatRole(user?.role)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 space-y-0.5 px-1">
          {navigationItems.map(({ id, label, description, icon: Icon }) => {
            const isActive = activeSection === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSectionChange(id)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-white/12 text-white ring-1 ring-white/10'
                    : 'text-stone-400 hover:bg-white/6 hover:text-stone-200'
                }`}
              >
                {/* Accent bar lateral */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-0.75 -translate-y-1/2 rounded-r-full bg-emerald-400" />
                )}

                <Icon
                  className={`size-4 shrink-0 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-stone-500 group-hover:text-stone-300'
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-white' : ''}`}>
                    {label}
                  </p>
                  <p className="mt-0.5 truncate text-[0.7rem] text-stone-500">{description}</p>
                </div>

                {isActive && (
                  <span className="ml-auto size-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="mt-4 shrink-0 space-y-3 px-2 pt-4">
          <div className="rounded-2xl border border-white/6 bg-white/2 p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-emerald-500" />
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                operação
              </p>
            </div>
            <p className="text-[0.75rem] leading-[1.55] text-stone-500">
              Painel responsivo para métricas macro, consulta de fotos, QR Codes e auditoria.
            </p>
          </div>

          <Button
            fullWidth
            onClick={onLogout}
            className="h-10 rounded-[14px] border border-white/10 bg-white/6 text-stone-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="mr-2 size-3.5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* ── Conteúdo principal ───────────────────────── */}
      <div className="admin-screen flex min-w-0 flex-1 flex-col overflow-hidden p-4">
        {children}
      </div>
    </div>
  )
}
