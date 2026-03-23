import { cn } from '../../lib/cn'
import { useAuth } from '../../features/auth/auth-context.jsx'
import { BrandMark } from './brand-mark.jsx'

export function PhoneShell({
  children,
  className,
  footer,
  headerRight,
}) {
  const auth = useAuth()
  const homeRoute = auth?.isAuthenticated ? (auth.user?.role === 'admin' ? '/admin' : '/activation') : '/login'

  return (
    <main className="screen-backdrop relative min-h-screen overflow-hidden px-4 py-5 md:flex md:items-center md:justify-center md:p-8">
      <div className="ambient-glow absolute inset-0 opacity-90" />

      <section
        style={{
          backgroundImage:
            'linear-gradient(180deg, var(--event-shell-top, rgba(255,255,255,0.88)), var(--event-shell-bottom, rgba(230,227,221,0.72)))',
        }}
        className={cn(
          'phone-shell page-enter relative mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[430px] flex-col overflow-hidden rounded-[34px] border border-white/55 px-5 py-6 backdrop-blur-xl md:min-h-[880px] md:max-h-[880px]',
          className,
        )}
      >
        <header className="mb-6 shrink-0 flex items-start justify-between gap-4">
          <BrandMark homeRoute={homeRoute} />
          {headerRight}
        </header>

        <div className="shell-scrollbar flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="flex min-h-full flex-col">{children}</div>
        </div>

        {footer ? (
          <footer className="mt-5 shrink-0 text-center text-[0.72rem] uppercase tracking-[0.22em] text-stone-500">
            {footer}
          </footer>
        ) : null}
      </section>
    </main>
  )
}
