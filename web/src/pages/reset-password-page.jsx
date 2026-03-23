import { useState, useTransition, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Sparkles,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "../lib/api-client.js";
import { PhoneShell } from "../components/layout/phone-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Spinner } from "../components/ui/spinner.jsx";

// ─── Step 1: Email ────────────────────────────────────────────────────────────

function StepEmail({ onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const result = await apiClient.requestPasswordReset({ email });
        onSuccess({ email, devOtp: result.otp });
      } catch (err) {
        setError(err.message || "Não foi possível enviar o código agora.");
      }
    });
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Digite seu e-mail para receber o código de redefinição.</CardTitle>
        <CardDescription className="font-semibold">
          Você receberá um código de 4 dígitos no seu e-mail.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Email
            </span>
            <div className="relative pt-2 pb-2">
              <Mail className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@empresa.com"
                type="email"
                required
                autoFocus
                className="pr-10"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          )}

          <Button
            className="mt-2 mb-2"
            type="submit"
            fullWidth
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Enviando...
              </>
            ) : (
              "Enviar código"
            )}
          </Button>
        </form>
      </CardContent>
    </>
  );
}

// ─── Step 2: OTP ─────────────────────────────────────────────────────────────

function StepOtp({ email, devOtp, onSuccess, onBack }) {
  const [isPending, startTransition] = useTransition();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  function handleDigitChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, i) => (i === index ? digit : d));
    setDigits(next);

    if (digit && index < 3) {
      refs[index + 1].current?.focus();
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  }

  function handlePaste(event) {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pasted.length === 4) {
      setDigits(pasted.split(""));
      refs[3].current?.focus();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const otp = digits.join("");
    if (otp.length < 4) return;
    setError("");

    startTransition(async () => {
      try {
        const result = await apiClient.verifyOtp({ email, otp });
        onSuccess({ resetToken: result.resetToken });
      } catch (err) {
        setError(err.message || "Código inválido.");
        setDigits(["", "", "", ""]);
        refs[0].current?.focus();
      }
    });
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Digite o código</CardTitle>
        <CardDescription>
          Insira o código de 4 dígitos enviado para{" "}
          <span className="font-medium text-stone-700">{email}</span>.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoFocus={i === 0}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-14 rounded-2xl border border-stone-200 bg-white/80 text-center text-2xl font-bold text-stone-900 shadow-sm outline-none ring-stone-300 transition focus:border-stone-400 focus:ring-2"
              />
            ))}
          </div>

          {error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={isPending || digits.join("").length < 4}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Verificando...
              </>
            ) : (
              "Verificar código"
            )}
          </Button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 text-sm text-stone-400 hover:text-stone-600"
            onClick={onBack}
          >
            <ArrowLeft className="size-3.5" />
            Usar outro e-mail
          </button>
        </form>

        {devOtp && (
          <div className="mt-5 rounded-[22px] border border-dashed border-stone-300/80 bg-white/55 p-4 text-sm text-stone-500">
            <p className="font-medium text-stone-700">
              Simulação de e-mail (dev)
            </p>
            <p className="mt-0.5">
              Em produção este código seria enviado ao e-mail. OTP gerado:{" "}
              <span className="font-mono font-bold tracking-widest text-stone-900">
                {devOtp}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </>
  );
}

// ─── Step 3: Nova senha ───────────────────────────────────────────────────────

function StepNewPassword({ resetToken, onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    startTransition(async () => {
      try {
        await apiClient.confirmPasswordReset({ resetToken, password });
        onSuccess();
      } catch (err) {
        setError(err.message || "Não foi possível redefinir a senha agora.");
      }
    });
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Nova senha</CardTitle>
        <CardDescription>
          Escolha uma senha com no mínimo 6 caracteres.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Nova senha
            </span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                type="password"
                required
                autoFocus
                minLength={6}
                className="pr-10"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Confirmar senha
            </span>
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••"
                type="password"
                required
                className="pr-10"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                Salvando...
              </>
            ) : (
              "Redefinir senha"
            )}
          </Button>
        </form>
      </CardContent>
    </>
  );
}

// ─── Step 4: Sucesso ──────────────────────────────────────────────────────────

function StepSuccess({ onLogin }) {
  return (
    <>
      <CardHeader>
        <CardTitle>Senha redefinida!</CardTitle>
        <CardDescription>Sua senha foi alterada com sucesso.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-3 py-4 text-emerald-600">
          <CheckCircle2 className="size-14 stroke-[1.5]" />
          <p className="text-center text-sm text-stone-500">
            Agora você já pode entrar com a nova senha.
          </p>
        </div>

        <Button type="button" fullWidth size="lg" onClick={onLogin}>
          Ir para o login
        </Button>
      </CardContent>
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

const STEP_META = {
  email: {
    title: "Recuperar acesso",
    subtitle: "Informe seu e-mail para redefinir a senha.",
  },
  otp: {
    title: "Verificação",
    subtitle: "Confirme sua identidade com o código recebido.",
  },
  "new-password": {
    title: "Nova senha",
    subtitle: "Crie uma senha segura para sua conta.",
  },
  success: { title: "Tudo certo!", subtitle: "Acesso recuperado com sucesso." },
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [ctx, setCtx] = useState({ email: "", devOtp: null, resetToken: null });

  const meta = STEP_META[step];

  return (
    <PhoneShell footer="nex.lab activation flow">
      <div className="flex h-full flex-col">
        <div className="mb-8 space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            <Sparkles className="size-3.5" />
            {meta.title}
          </span>
          <h1 className="font-display text-2xl font-semibold text-stone-950">
            Trocar a Senha
          </h1>
          <p className="mx-auto max-w-xs text-sm leading-6 text-stone-500">
            {meta.subtitle}
          </p>
        </div>

        <Card className="grid-surface flex-1">
          {step === "email" && (
            <StepEmail
              onSuccess={({ email, devOtp }) => {
                setCtx((c) => ({ ...c, email, devOtp }));
                setStep("otp");
              }}
            />
          )}

          {step === "otp" && (
            <StepOtp
              email={ctx.email}
              devOtp={ctx.devOtp}
              onSuccess={({ resetToken }) => {
                setCtx((c) => ({ ...c, resetToken }));
                setStep("new-password");
              }}
              onBack={() => setStep("email")}
            />
          )}

          {step === "new-password" && (
            <StepNewPassword
              resetToken={ctx.resetToken}
              onSuccess={() => setStep("success")}
            />
          )}

          {step === "success" && (
            <StepSuccess onLogin={() => navigate("/login")} />
          )}
        </Card>

        {step !== "success" && (
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm text-stone-400 hover:text-stone-600"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="size-3.5" />
            Voltar para o login
          </button>
        )}
      </div>
    </PhoneShell>
  );
}
