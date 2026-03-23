import { useEffect, useRef, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Eye, EyeOff, Mail } from 'lucide-react'
import { useAuth } from '../features/auth/auth-context.jsx'
import { PhoneShell } from '../components/layout/phone-shell.jsx'
import { Button } from '../components/ui/button.jsx'
import { Checkbox } from '../components/ui/checkbox.jsx'
import { Input } from '../components/ui/input.jsx'
import { Spinner } from '../components/ui/spinner.jsx'

export function LoginPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const emailRef = useRef(null)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showQuickAccess, setShowQuickAccess] = useState(false)
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    remember: true,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      const result = await auth.login(
        { email: formState.email, password: formState.password },
        { remember: formState.remember },
      )
      startTransition(() => navigate(result.nextPath))
    } catch (loginError) {
      setError(loginError.message || 'E-mail ou senha inválidos.')
    }
  }

  return (
    <PhoneShell footer="nex.lab activation flow">
      <div className="flex h-full flex-col justify-between gap-8">

        {/* Hero */}
        <div className="space-y-4">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{
              borderColor: 'var(--event-accent-border)',
              backgroundColor: 'var(--event-accent-soft)',
              color: 'var(--event-accent)',
            }}
          >
            Área de acesso
          </span>
          <div className="space-y-3">
            <h1 className="font-display text-[3.5rem] font-semibold leading-[0.92] tracking-[-0.05em] text-stone-950">
              Entrar
              <br />
              na conta
            </h1>
            <p className="max-w-xs text-sm leading-7 text-stone-500">
              Acesse como promotor para capturar fotos ou como admin para gerenciar o evento.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <form className="space-y-5" onSubmit={handleSubmit}>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                E-mail
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                <Input
                  ref={emailRef}
                  aria-label="E-mail"
                  value={formState.email}
                  onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                  placeholder="voce@empresa.com"
                  type="email"
                  autoComplete="email"
                  className="pr-10"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                Senha
              </span>
              <div className="relative">
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
                <Input
                  aria-label="Senha"
                  value={formState.password}
                  onChange={(e) => setFormState((s) => ({ ...s, password: e.target.value }))}
                  placeholder="••••••"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-10"
                />
              </div>
            </label>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2.5 py-1">
                <Checkbox
                  checked={formState.remember}
                  onCheckedChange={(checked) =>
                    setFormState((s) => ({ ...s, remember: Boolean(checked) }))
                  }
                />
                <span className="text-sm font-medium text-stone-600">Lembrar de mim</span>
              </label>

              <button
                type="button"
                className="text-sm font-medium underline underline-offset-2 transition-colors"
                style={{ color: 'var(--event-accent)' }}
                onClick={() => navigate('/reset-password')}
              >
                Esqueci a senha
              </button>
            </div>

            {error && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar na conta'
              )}
            </Button>
          </form>

          {/* Acesso rápido — colapsável */}
          <div className="overflow-hidden rounded-[18px] border border-dashed border-stone-200">
            <button
              type="button"
              onClick={() => setShowQuickAccess((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-stone-50/80"
            >
              <span className="font-medium text-stone-500">Acesso rápido (demo)</span>
              <ChevronDown
                className={`size-4 text-stone-400 transition-transform duration-200 ${showQuickAccess ? 'rotate-180' : ''}`}
              />
            </button>
            {showQuickAccess && (
              <div className="space-y-2 border-t border-dashed border-stone-200 bg-white/55 px-4 pb-4 pt-3">
                <button
                  type="button"
                  className="block w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left text-xs text-stone-600 transition-colors hover:bg-stone-50"
                  onClick={() =>
                    setFormState((s) => ({ ...s, email: 'promoter@nexlab.com', password: '123456' }))
                  }
                >
                  <span className="font-semibold text-stone-800">Promotor</span>
                  {' '}— promoter@nexlab.com
                </button>
                <button
                  type="button"
                  className="block w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left text-xs text-stone-600 transition-colors hover:bg-stone-50"
                  onClick={() =>
                    setFormState((s) => ({ ...s, email: 'admin@nexlab.com', password: '123456' }))
                  }
                >
                  <span className="font-semibold text-stone-800">Admin</span>
                  {' '}— admin@nexlab.com
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </PhoneShell>
  )
}
